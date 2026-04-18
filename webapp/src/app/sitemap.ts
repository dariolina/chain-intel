import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const lastModified = new Date();
  return [
    { url: base, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/docs`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/status`, lastModified, changeFrequency: "daily", priority: 0.5 },
  ];
}
