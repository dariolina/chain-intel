import { Skeleton } from "@/components/ui/skeleton";

export default function GlobalLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="space-y-4">
        <Skeleton className="mx-auto h-8 w-2/3 max-w-xl" />
        <Skeleton className="mx-auto h-4 w-1/2 max-w-md" />
        <Skeleton className="mx-auto mt-8 h-12 w-full max-w-3xl" />
      </div>
    </div>
  );
}
