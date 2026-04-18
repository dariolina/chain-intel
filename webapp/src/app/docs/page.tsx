import type { Metadata } from "next";
import { docsSections } from "@/app/docs/content";
import { siteConfig } from "@/lib/site-config";
import Link from "next/link";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "API documentation",
  description: "HTTP contract for Justice risk screening.",
};

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        Documentation
      </h1>
      <p className="mt-3 text-muted-foreground">
        Contract for the public <code className="font-mono text-sm">/api/risk</code>{" "}
        endpoint consumed by this site and the {siteConfig.name} extension.
      </p>
      <div className="mt-10 space-y-12">
        {docsSections.map((section) => (
          <section key={section.id} id={section.id}>
            <h2 className="font-heading text-xl font-medium">{section.title}</h2>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              {section.body.map((p, i) => (
                <p key={`${section.id}-${i}`} className="leading-relaxed">
                  {p.startsWith("curl") ? (
                    <code className="block overflow-x-auto rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs text-foreground">
                      {p}
                    </code>
                  ) : (
                    p
                  )}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
      <p className="mt-12 text-sm text-muted-foreground">
        Live service health:{" "}
        <Link href="/status" className="text-primary underline underline-offset-4">
          /status
        </Link>
        .
      </p>
    </div>
  );
}
