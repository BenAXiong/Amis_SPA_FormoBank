import type { Metadata } from "next";

import { TestTranslator } from "@/components/TestTranslator";

export const metadata: Metadata = {
  title: "Atayal -> 中文",
  description: "Fixed-direction Atayal to Chinese draft translation surface.",
};

export default function AtayalPage() {
  return <TestTranslator fixedPair={{ sourceLang: "tay_Latn", targetLang: "zho_Hant" }} />;
}
