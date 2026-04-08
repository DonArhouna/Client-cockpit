import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="flex-1 flex flex-col space-y-6">
      {/* Header Skeleton */}
      <div className="px-6 space-y-2">
        <Skeleton className="h-10 w-[300px]" />
        <Skeleton className="h-4 w-[450px]" />
      </div>

      {/* Toolbar Skeleton */}
      <div className="px-6 flex items-center justify-between gap-4">
        <div className="flex gap-3">
          <Skeleton className="h-10 w-[160px]" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
        <Skeleton className="h-10 flex-1 max-w-md mx-auto" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-[120px]" />
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-[300px] border border-slate-100 dark:border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
               <Skeleton className="h-6 w-32" />
               <Skeleton className="h-4 w-4 rounded-full" />
            </div>
            <Skeleton className="h-[200px] w-full" />
            <div className="flex gap-2">
               <Skeleton className="h-3 w-16" />
               <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
