import type { Metadata } from "next";

import { TestTranslator } from "@/components/TestTranslator";

export const metadata: Metadata = {
  title: "中文 -> Paiwan",
  description: "Fixed-direction Chinese to Paiwan draft translation surface.",
};

export default function ZhPaiPage() {
  return <TestTranslator fixedPair={{ sourceLang: "zho_Hant", targetLang: "pwn_Latn" }} />;
}
