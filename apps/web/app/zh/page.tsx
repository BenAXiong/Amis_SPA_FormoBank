import type { Metadata } from "next";

import { TestTranslator } from "@/components/TestTranslator";

export const metadata: Metadata = {
  title: "中文 -> Amis",
  description: "Fixed-direction Chinese to Amis draft translation surface.",
};

export default function ZhPage() {
  return <TestTranslator fixedDirectionId="zh-to-ami" />;
}
