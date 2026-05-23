import type { Metadata } from "next";

import { TestTranslator } from "@/components/TestTranslator";

export const metadata: Metadata = {
  title: "Amis -> 中文",
  description: "Fixed-direction Amis to Chinese draft translation surface.",
};

export default function AmisPage() {
  return <TestTranslator fixedDirectionId="ami-to-zh" />;
}
