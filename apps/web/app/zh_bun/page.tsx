import type { Metadata } from "next";

import { TestTranslator } from "@/components/TestTranslator";

export const metadata: Metadata = {
  title: "中文 -> Bunun",
  description: "Fixed-direction Chinese to Bunun draft translation surface.",
};

export default function ZhBunPage() {
  return <TestTranslator fixedPair={{ sourceLang: "zho_Hant", targetLang: "bnn_Latn" }} />;
}
