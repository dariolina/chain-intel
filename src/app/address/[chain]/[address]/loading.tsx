import { Skeleton } from "@/components/ui/skeleton";

export default function AddressReportLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <div className="space-y-4 border-b border-border/80 pb-8">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-10 w-full max-w-xl" />
        <Skeleton className="h-16 w-full max-w-2xl" />
        <Skeleton className="h-8 w-56" />
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    </div>
  );
}
