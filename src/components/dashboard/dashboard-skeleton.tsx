import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="max-w-[1200px]">
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-[10px] border border-border bg-card px-5 py-[22px]"
          >
            <Skeleton className="mb-3.5 h-3 w-24" />
            <Skeleton className="mb-2 h-8 w-28" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="overflow-hidden rounded-[10px] border border-border bg-card">
          <div className="border-b border-border px-[22px] py-[18px]">
            <Skeleton className="h-4 w-32" />
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b border-border px-[22px] py-3.5 last:border-0"
            >
              <Skeleton className="h-3 w-[130px]" />
              <Skeleton className="h-3 flex-1" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-3 w-[80px]" />
            </div>
          ))}
        </div>

        <div className="rounded-[10px] border border-border bg-card px-[22px] py-5">
          <Skeleton className="mb-4 h-4 w-32" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="mb-3.5">
              <div className="mb-1.5 flex justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-6" />
              </div>
              <Skeleton className="h-1.5 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
