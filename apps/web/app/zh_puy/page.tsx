import type { Metadata } from "next";

import { TestTranslator } from "@/components/TestTranslator";

export const metadata: Metadata = {
  title: "中文 -> Puyuma",
  description: "Fixed-direction Chinese to Puyuma draft translation surface.",
};

export default function ZhPuyPage() {
  return <TestTranslator fixedPair={{ sourceLang: "zho_Hant", targetLang: "pyu_Latn" }} />;
}
