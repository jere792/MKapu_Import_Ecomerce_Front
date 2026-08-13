import { ReactNode } from "react";

export default function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-8 border-l-[3px] border-brand pl-5">
      <h2 className="text-base font-bold text-white mb-[0.6rem]">{title}</h2>
      <div className="text-[0.9rem] leading-[1.75] text-[#aaa] space-y-2 [&_ul]:pl-5 [&_ol]:pl-5 [&_ul]:list-disc [&_ol]:list-decimal [&_a]:text-brand [&_a]:no-underline hover:[&_a]:underline">
        {children}
      </div>
    </section>
  );
}