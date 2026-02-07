import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Search className="h-7 w-7 text-muted-foreground" />
        </div>
        <h2 className="mb-2 text-4xl font-bold text-foreground">404</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist. It might have
          been moved or you may have mistyped the URL.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
        >
          <Home className="h-4 w-4" />
          Go Home
        </Link>
      </div>
    </div>
  );
}
