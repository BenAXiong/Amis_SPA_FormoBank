import { InfoPanel } from "@/components/InfoPanel";
import { TranslationWorkbench } from "@/components/TranslationWorkbench";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f7f4] text-[#1c2421]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-2 border-b border-[#d8d7ce] pb-5">
          <p className="text-sm font-medium text-[#58645f]">Draft translation + annotation</p>
          <h1 className="text-3xl font-semibold tracking-normal text-[#15201c] sm:text-4xl">
            Amis–Mandarin MT Review Demo
          </h1>
          <p className="max-w-2xl text-base leading-7 text-[#4b5651]">
            Experimental draft translation with optional correction and annotation.
          </p>
        </header>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
          <TranslationWorkbench />
          <InfoPanel />
        </div>
      </div>
    </main>
  );
}
