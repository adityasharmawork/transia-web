import { NextResponse } from "next/server";
import { connectDB, Project, User, UsageLog, CliToken, hashToken, TranslationCache, cacheHash, hashApiKey } from "@/lib/db";
import { translateLimiter, checkRateLimit } from "@/lib/rate-limit";
import { getAvailableKey, markRateLimited, hasKeys } from "@/lib/ai/key-pool";

const TIER_LIMITS: Record<string, number> = {
  free: 0,
  pro: 10000,
  team: 50000,
};

const LOCALE_RE = /^[a-z]{2}(-[A-Z]{2})?$/;
const MAX_STRINGS = 100;
const MAX_KEY_LENGTH = 500;
const MAX_ORIGINAL_LENGTH = 5000;
const MAX_CONTEXT_LENGTH = 1000;
const FETCH_TIMEOUT_MS = 30_000;

interface TranslationString {
  key: string;
  original: string;
  context?: string;
}

interface TranslateRequestBody {
  apiKey: string;
  strings: TranslationString[];
  sourceLocale: string;
  targetLocale: string;
}

// Strip control characters from context to mitigate prompt injection
function sanitizeContext(ctx: string): string {
  return ctx.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

function validateBody(
  body: TranslateRequestBody
): string | null {
  if (!body.apiKey || typeof body.apiKey !== "string") {
    return "Missing or invalid apiKey";
  }
  if (!body.sourceLocale || !LOCALE_RE.test(body.sourceLocale)) {
    return `Invalid sourceLocale: must match ${LOCALE_RE}`;
  }
  if (!body.targetLocale || !LOCALE_RE.test(body.targetLocale)) {
    return `Invalid targetLocale: must match ${LOCALE_RE}`;
  }
  if (!Array.isArray(body.strings) || body.strings.length === 0) {
    return "strings must be a non-empty array";
  }
  if (body.strings.length > MAX_STRINGS) {
    return `strings array exceeds maximum of ${MAX_STRINGS} items`;
  }
  for (let i = 0; i < body.strings.length; i++) {
    const s = body.strings[i];
    if (typeof s.key !== "string" || s.key.length === 0 || s.key.length > MAX_KEY_LENGTH) {
      return `strings[${i}].key must be a non-empty string (max ${MAX_KEY_LENGTH} chars)`;
    }
    if (typeof s.original !== "string" || s.original.length === 0 || s.original.length > MAX_ORIGINAL_LENGTH) {
      return `strings[${i}].original must be a non-empty string (max ${MAX_ORIGINAL_LENGTH} chars)`;
    }
    if (s.context !== undefined && s.context !== null) {
      if (typeof s.context !== "string" || s.context.length > MAX_CONTEXT_LENGTH) {
        return `strings[${i}].context must be a string (max ${MAX_CONTEXT_LENGTH} chars)`;
      }
    }
  }
  return null;
}

export async function POST(req: Request) {
  try {
    // C3: Verify Bearer token authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer trn_cli_")) {
      return NextResponse.json(
        { error: "Missing or invalid Authorization header. Use Bearer trn_cli_* token." },
        { status: 401 }
      );
    }
    const bearerToken = authHeader.slice(7); // Remove "Bearer "

    const body = (await req.json()) as TranslateRequestBody;

    // C2: Input validation
    const validationError = validateBody(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const { apiKey, strings, sourceLocale, targetLocale } = body;

    // Reject public keys — only private keys (trn_live_*) are valid for translation
    if (apiKey.startsWith("trn_pub_")) {
      return NextResponse.json(
        { error: "Public keys (trn_pub_*) cannot be used for translations. Use your private API key (trn_live_*)." },
        { status: 403 }
      );
    }

    // Sanitize context fields
    for (const s of strings) {
      if (s.context) {
        s.context = sanitizeContext(s.context);
      }
    }

    await connectDB();

    // Verify Bearer token (must exist and not be expired)
    const tokenDoc = await CliToken.findOne({
      tokenHash: hashToken(bearerToken),
      expiresAt: { $gt: new Date() },
    });
    if (!tokenDoc) {
      return NextResponse.json(
        { error: "Invalid or expired authentication token. Run 'transia login' to re-authenticate." },
        { status: 401 }
      );
    }

    // Rate limit by authenticated user
    const rateLimited = await checkRateLimit(translateLimiter, tokenDoc.userId.toString());
    if (rateLimited) return rateLimited;

    // Find project by API key hash
    const project = await Project.findOne({ apiKeyHash: hashApiKey(apiKey) });
    if (!project) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      );
    }

    // Verify the Bearer token owner matches the project owner
    if (tokenDoc.userId.toString() !== project.userId.toString()) {
      return NextResponse.json(
        { error: "Token does not have access to this project" },
        { status: 403 }
      );
    }

    // Find user and check tier
    const user = await User.findById(project.userId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const monthlyLimit = TIER_LIMITS[user.tier] ?? 0;
    if (monthlyLimit === 0) {
      return NextResponse.json(
        {
          error:
            "Managed translations are not available on the free tier. Upgrade to Pro at https://transia.dev/pricing",
        },
        { status: 403 }
      );
    }

    // Check monthly usage
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthlyUsage = await UsageLog.aggregate([
      {
        $match: {
          projectId: project._id,
          createdAt: { $gte: monthStart },
        },
      },
      { $group: { _id: null, total: { $sum: "$stringsTranslated" } } },
    ]);

    const currentUsage = monthlyUsage[0]?.total ?? 0;
    if (currentUsage + strings.length > monthlyLimit) {
      return NextResponse.json(
        {
          error: `Monthly limit reached (${currentUsage}/${monthlyLimit} strings). Upgrade your plan for more.`,
        },
        { status: 429 }
      );
    }

    // Check translation cache for each string
    const translations: Record<string, string> = {};
    const uncachedStrings: TranslationString[] = [];

    const cacheHashes = strings.map((s) => cacheHash(s.original, sourceLocale, targetLocale));
    const cachedDocs = await TranslationCache.find({ hash: { $in: cacheHashes } }).lean();
    const cacheMap = new Map(cachedDocs.map((doc) => [doc.hash, doc.translated]));

    for (let i = 0; i < strings.length; i++) {
      const cached = cacheMap.get(cacheHashes[i]);
      if (cached) {
        translations[strings[i].key] = cached;
      } else {
        uncachedStrings.push(strings[i]);
      }
    }

    // Increment hit count for cached entries (best-effort, non-blocking)
    if (cachedDocs.length > 0) {
      const hitHashes = cachedDocs.map((d) => d.hash);
      TranslationCache.updateMany(
        { hash: { $in: hitHashes } },
        { $inc: { hitCount: 1 } },
      ).catch(() => {});
    }

    // Translate uncached strings via AI provider (with key pool + fallback chain)
    if (uncachedStrings.length > 0) {
      const providerChain: Array<{
        name: "gemini" | "grok";
        translate: (key: string, strs: TranslationString[], src: string, tgt: string) => Promise<Record<string, string>>;
      }> = [
        { name: "gemini", translate: translateWithGemini },
        { name: "grok", translate: translateWithGrok },
      ];

      let aiTranslations: Record<string, string> | null = null;
      let providerName = "";

      for (const provider of providerChain) {
        if (!hasKeys(provider.name)) continue;

        const key = getAvailableKey(provider.name);
        if (!key) continue; // all keys for this provider are rate-limited

        try {
          aiTranslations = await provider.translate(key, uncachedStrings, sourceLocale, targetLocale);
          providerName = provider.name;
          break; // success — stop trying
        } catch (error) {
          const message = error instanceof Error ? error.message : "";
          if (message.includes("429") || message.includes("rate")) {
            // Parse Retry-After if available, default to 60s
            markRateLimited(provider.name, key, 60_000);
            continue; // try next provider
          }
          throw error; // non-rate-limit error — bubble up
        }
      }

      if (!aiTranslations) {
        return NextResponse.json(
          { error: "All translation providers are currently rate-limited. Please try again shortly." },
          { status: 503, headers: { "Retry-After": "60" } }
        );
      }

      // Merge AI translations into result and store in cache
      const cacheEntries = [];

      for (const s of uncachedStrings) {
        const translated = aiTranslations[s.key];
        if (translated) {
          translations[s.key] = translated;
          cacheEntries.push({
            hash: cacheHash(s.original, sourceLocale, targetLocale),
            original: s.original,
            sourceLocale,
            targetLocale,
            translated,
            provider: providerName,
          });
        }
      }

      // Store in cache (best-effort, non-blocking, ignore duplicates)
      if (cacheEntries.length > 0) {
        TranslationCache.insertMany(cacheEntries, { ordered: false }).catch(() => {});
      }

      // Log usage (only count strings actually sent to AI)
      await UsageLog.create({
        projectId: project._id,
        stringsTranslated: uncachedStrings.length,
        tokensUsed: 0,
        provider: providerName,
        locale: targetLocale,
      });
    }

    return NextResponse.json({ translations });
  } catch (error) {
    console.error("Translation proxy error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Translation failed" },
      { status: 500 }
    );
  }
}

async function translateWithGemini(
  apiKey: string,
  strings: TranslationString[],
  sourceLocale: string,
  targetLocale: string
): Promise<Record<string, string>> {
  const prompt = buildPrompt(strings, sourceLocale, targetLocale);

  // H3: Timeout for AI provider calls
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt(sourceLocale, targetLocale) }],
          },
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.3,
          },
        }),
        signal: controller.signal,
      }
    );

    if (!res.ok) {
      throw new Error(`Gemini API error: ${res.status}`);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    // H2: Safe JSON parsing
    if (!text) {
      throw new Error("Gemini returned empty response");
    }
    try {
      return JSON.parse(text);
    } catch {
      throw new Error("Gemini returned invalid JSON");
    }
  } finally {
    clearTimeout(timeout);
  }
}

async function translateWithGrok(
  apiKey: string,
  strings: TranslationString[],
  sourceLocale: string,
  targetLocale: string
): Promise<Record<string, string>> {
  const prompt = buildPrompt(strings, sourceLocale, targetLocale);

  // H3: Timeout for AI provider calls
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-2-latest",
        messages: [
          { role: "system", content: systemPrompt(sourceLocale, targetLocale) },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`Grok API error: ${res.status}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content;

    // H2: Safe JSON parsing
    if (!text) {
      throw new Error("Grok returned empty response");
    }
    try {
      return JSON.parse(text);
    } catch {
      throw new Error("Grok returned invalid JSON");
    }
  } finally {
    clearTimeout(timeout);
  }
}

function systemPrompt(sourceLocale: string, targetLocale: string): string {
  return `You are a professional translator. Translate text from ${sourceLocale} to ${targetLocale}.
Rules:
- Preserve placeholders like {name}, {count}, etc. exactly as-is
- Preserve HTML tags exactly as-is
- Maintain the same tone and style
- Do NOT translate brand names or technical terms
- Return ONLY valid JSON, no markdown wrapping`;
}

function buildPrompt(
  strings: TranslationString[],
  _sourceLocale: string,
  _targetLocale: string
): string {
  const input: Record<string, string> = {};
  for (const s of strings) {
    input[s.key] = s.original;
  }
  return `Translate the following strings. Return a JSON object with the same keys and translated values:\n\n${JSON.stringify(input, null, 2)}`;
}
