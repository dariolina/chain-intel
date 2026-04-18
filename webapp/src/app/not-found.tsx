import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center sm:px-6">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="mt-2 font-heading text-2xl font-semibold tracking-tight">
        Page not found
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        The report or page does not exist, or the input could not be resolved.
        Check the chain, address format, and try the search from the home page.
      </p>
      <Link
        href="/"
        className={cn(buttonVariants({ size: "default" }), "mt-8")}
      >
        Back to home
      </Link>
    </div>
  );
}
