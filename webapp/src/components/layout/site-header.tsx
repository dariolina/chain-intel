import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { ThemeToggle } from "@/components/common/theme-toggle-loader";
import { MobileNav } from "@/components/layout/mobile-nav";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/history", label: "Cronologia" },
  { href: "/docs", label: "API docs" },
  { href: "/status", label: "Status" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="font-heading text-sm font-semibold tracking-tight text-foreground"
        >
          {siteConfig.name}
        </Link>
        <span className="hidden text-xs text-muted-foreground sm:inline">
          On-chain intelligence
        </span>
        <nav
          className="ml-auto hidden items-center gap-1 md:flex"
          aria-label="Primary"
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <div className="md:hidden">
            <MobileNav items={nav} />
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
