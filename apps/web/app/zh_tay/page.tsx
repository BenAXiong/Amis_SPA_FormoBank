import type { Metadata } from "next";

import { TestTranslator } from "@/components/TestTranslator";

export const metadata: Metadata = {
  title: "中文 -> Atayal",
  description: "Fixed-direction Chinese to Atayal draft translation surface.",
};

export default function ZhTayPage() {
  return <TestTranslator fixedPair={{ sourceLang: "zho_Hant", targetLang: "tay_Latn" }} />;
}
