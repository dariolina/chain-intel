import dynamic from "next/dynamic";

export const ThemeToggle = dynamic(
  () =>
    import("@/components/common/theme-toggle").then((m) => m.ThemeToggle),
  { ssr: false, loading: () => <span className="inline-block size-8" /> }
);
