import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { parseChainParam } from "@/lib/chain-schema";
import { fetchRiskReport, getBaseUrl, RiskFetchError } from "@/lib/api-client";
import { isValidTxForChain } from "@/lib/validate-target";
import { SeverityHero } from "@/components/report/severity-hero";
import { SourceList } from "@/components/report/source-list";
import { ReportEmpty } from "@/components/report/report-empty";
import { RateLimitBanner } from "@/components/report/rate-limit-banner";
import { AiAnalysis } from "@/components/report/ai-analysis";
import { explorerTxUrl } from "@/lib/chains";
import { truncateMiddle } from "@/lib/format";
import { siteConfig } from "@/lib/site-config";

export const revalidate = 60;

type Props = {
  params: { chain: string; hash: string };
  searchParams: Record<string, string | string[] | undefined>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const chain = parseChainParam(params.chain);
  if (!chain || !isValidTxForChain(chain, params.hash)) return { title: "Transaction report" };
  try {
    const report = await fetchRiskReport({ chain, kind: "tx", address: params.hash });
    return {
      title: `${truncateMiddle(params.hash, 8, 6)} — ${report.severity.toUpperCase()}`,
      description: report.summary,
    };
  } catch {
    return { title: `${truncateMiddle(params.hash, 6, 4)} — ${siteConfig.name}` };
  }
}

export default async function TxReportPage({ params, searchParams }: Props) {
  const chain = parseChainParam(params.chain);
  if (!chain || !isValidTxForChain(chain, params.hash)) notFound();

  const fresh = searchParams.fresh === "1" || searchParams.fresh === "true";
  let rateLimited: number | undefined;
  let report;

  try {
    report = await fetchRiskReport({ chain, kind: "tx", address: params.hash, fresh });
  } catch (e) {
    if (e instanceof RiskFetchError) {
      if (e.status === 429) {
        rateLimited = e.retryAfter;
        try {
          report = await fetchRiskReport({ chain, kind: "tx", address: params.hash, fresh: false });
        } catch {
          return (
            <>
              <RateLimitBanner retryAfter={rateLimited} />
              <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
                <p className="text-sm text-muted-foreground">
                  Impossibile caricare il report in cache. Riprova tra poco.
                </p>
              </div>
            </>
          );
        }
      } else if (e.status === 400 || e.status === 404) {
        notFound();
      } else {
        throw e;
      }
    } else {
      throw e;
    }
  }

  const base = getBaseUrl();
  const path = `/tx/${params.chain}/${params.hash}`;
  const freshHref = `${path}?fresh=1`;
  const pathnameForCopy = `${base}${path}`;
  const explorerUrl = explorerTxUrl(chain, params.hash);

  const allUnconfigured =
    report.sources.length === 0 ||
    report.sources.every((s) => s.status === "unconfigured");

  return (
    <>
      {rateLimited !== undefined && <RateLimitBanner retryAfter={rateLimited} />}

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:py-14">
        <SeverityHero
          report={report}
          explorerUrl={explorerUrl}
          pathnameForCopy={pathnameForCopy}
          freshHref={freshHref}
        />

        {allUnconfigured ? (
          <div className="mt-8">
            <ReportEmpty />
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-5">
            <AiAnalysis report={report} />
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Fonti ({report.sources.filter((s) => s.status !== "unconfigured").length})
              </p>
              <SourceList sources={report.sources} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
