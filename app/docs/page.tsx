import type { Metadata } from "next";
import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";
import { DocsLayout } from "./components/docs-layout";

export const metadata: Metadata = {
  title: "Documentation — Transia",
  description:
    "Complete guide to using the Transia CLI, widget, and dashboard. Learn how to translate your React and Next.js apps with AI.",
};

export default function DocsPage() {
  return (
    <main>
      <Navbar />
      <DocsLayout />
      <Footer />
    </main>
  );
}
