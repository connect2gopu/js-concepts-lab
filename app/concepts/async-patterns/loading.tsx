export default function AsyncLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-muted border-t-amber-500" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-4 w-4 animate-ping rounded-full bg-amber-500/30" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">
            Loading Async Patterns...
          </p>
          <p className="text-xs text-muted-foreground">
            This loading state is powered by Next.js Suspense
          </p>
        </div>
      </div>
    </div>
  );
}
