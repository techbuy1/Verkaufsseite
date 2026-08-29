export function StorePageLoading() {
  return (
    <div
      className="min-h-screen bg-background-secondary pb-16 pt-[72px] text-text-primary"
      aria-busy="true"
      aria-label="Store wird geladen"
    >
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-[1280px] px-5 py-10 md:px-8 md:py-12 lg:px-10">
          <div className="h-10 w-64 animate-pulse rounded-xl bg-surface-soft md:h-12 md:w-80" />
          <div className="mt-4 h-5 w-full max-w-[520px] animate-pulse rounded-lg bg-surface-soft" />
          <div className="mt-8 h-[52px] w-full max-w-[720px] animate-pulse rounded-[18px] bg-surface-soft" />
        </div>
      </section>

      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-[1280px] px-5 py-4 md:px-8 lg:px-10">
          <div className="flex gap-2 overflow-hidden">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-11 w-24 shrink-0 animate-pulse rounded-full bg-surface-soft"
              />
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-5 py-8 md:px-8 lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8 lg:px-10 lg:py-10">
        <div className="hidden space-y-4 lg:block">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-8 animate-pulse rounded-lg bg-surface-soft" />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 min-[480px]:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 xl:gap-5">
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className="aspect-[3/4] animate-pulse rounded-[20px] bg-surface-soft"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
