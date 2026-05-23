import type { Metadata } from "next";

import { TestTranslator } from "@/components/TestTranslator";

export const metadata: Metadata = {
  title: "Amis–Mandarin MT",
  description: "Compact Amis-Mandarin draft translation surface.",
};

export default function Home() {
  return <TestTranslator />;
}
