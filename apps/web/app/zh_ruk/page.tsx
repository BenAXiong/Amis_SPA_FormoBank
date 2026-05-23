import type { Metadata } from "next";

import { TestTranslator } from "@/components/TestTranslator";

export const metadata: Metadata = {
  title: "中文 -> Rukai",
  description: "Fixed-direction Chinese to Rukai draft translation surface.",
};

export default function ZhRukPage() {
  return <TestTranslator fixedPair={{ sourceLang: "zho_Hant", targetLang: "dru_Latn" }} />;
}
