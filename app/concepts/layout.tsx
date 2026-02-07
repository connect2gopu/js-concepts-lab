import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | JS Concept Lab",
    default: "Concepts",
  },
};

export default function ConceptsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">{children}</div>
    </div>
  );
}
