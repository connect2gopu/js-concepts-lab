import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | LLD Practice",
    default: "LLD Practice",
  },
};

export default function LLDLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
