const DEFAULT_APP_URL = "https://transia.dev";

export function getAppBaseUrl(): string {
  const configured =
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    DEFAULT_APP_URL;

  try {
    return new URL(configured).origin;
  } catch {
    return DEFAULT_APP_URL;
  }
}
