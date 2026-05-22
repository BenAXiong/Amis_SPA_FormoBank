import type { Metadata } from "next";

import { TestTranslator } from "@/components/TestTranslator";

export const metadata: Metadata = {
  title: "MT Test",
  description: "Compact Amis-Mandarin draft translation test surface.",
};

export default function TestPage() {
  return <TestTranslator />;
}
