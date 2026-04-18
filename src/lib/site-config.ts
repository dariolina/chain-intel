function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

export const siteConfig = {
  name: "Justice",
  description:
    "Public on-chain risk screening: aggregate signals for addresses and transactions before you move funds.",
  url: siteUrl(),
  githubUrl:
    process.env.NEXT_PUBLIC_GITHUB_URL ?? "https://github.com/dariolina/chain-intel",
  extensionChromeUrl:
    process.env.NEXT_PUBLIC_EXTENSION_CHROME_URL ??
    "https://github.com/dariolina/chain-intel/tree/main/extension",
} as const;
