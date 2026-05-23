import Skeleton from "./Skeleton";

const TradePageSkeleton = () => (
  <main className="min-h-screen pb-6 text-foreground">
    <section className="border-b border-border bg-card p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-start">
        <Skeleton className="h-20 w-full max-w-[340px] rounded-2xl" />
        <Skeleton className="h-20 w-full max-w-[340px] rounded-2xl" />
      </div>
    </section>

    <div className="mx-auto mt-4 flex-col gap-4 px-4">
      <div className="hidden gap-4 xl:grid xl:grid-cols-[320px_minmax(0,1fr)_320px] xl:items-start">
        <Skeleton className="h-[760px] w-full rounded-2xl" />

        <div className="grid gap-4">
          <div className="grid grid-cols-4 gap-2 md:gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-24 w-full rounded-2xl" />
            ))}
          </div>

          <Skeleton className="h-[420px] w-full rounded-2xl" />

          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-[360px] w-full rounded-2xl" />
            <Skeleton className="h-[360px] w-full rounded-2xl" />
          </div>
        </div>

        <Skeleton className="h-[760px] w-full rounded-2xl" />
      </div>

      <div className="grid gap-4 xl:hidden">
        <Skeleton className="h-32 w-full rounded-2xl" />

        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-full rounded-2xl" />
          ))}
        </div>

        <Skeleton className="h-[420px] w-full rounded-2xl" />
        <Skeleton className="h-[560px] w-full rounded-2xl" />
        <Skeleton className="h-[420px] w-full rounded-2xl" />
      </div>
    </div>
  </main>
);

export default TradePageSkeleton;
