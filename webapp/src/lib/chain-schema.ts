import { z } from "zod";
import type { Chain } from "@/lib/types";

export const chainParamSchema = z.enum([
  "eth",
  "base",
  "polygon",
  "arbitrum",
  "optimism",
  "btc",
]);

export function parseChainParam(value: string): Chain | null {
  const r = chainParamSchema.safeParse(value);
  return r.success ? r.data : null;
}
