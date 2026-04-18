import dynamic from "next/dynamic";

export const CopyButton = dynamic(
  () => import("@/components/common/copy-button").then((m) => m.CopyButton),
  { ssr: false, loading: () => <span className="inline-block size-8" /> }
);
