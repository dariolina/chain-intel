import { describe, expect, it } from "vitest";

import { getHostConfig } from "../src/lib/hosts";
import {
  BTC_ADDRESS_REGEX,
  BTC_TX_REGEX,
  EVM_ADDRESS_REGEX,
  EVM_TX_REGEX,
  parseTargetFromUrl,
} from "../src/lib/parsers";

describe("host config", () => {
  it("supports the configured explorers", () => {
    expect(getHostConfig("etherscan.io")?.chain).toBe("eth");
    expect(getHostConfig("optimistic.etherscan.io")?.chain).toBe("optimism");
    expect(getHostConfig("mempool.space")?.chain).toBe("btc");
  });
});

describe("regex validators", () => {
  it("matches evm address and tx patterns", () => {
    expect(EVM_ADDRESS_REGEX.test("0x8589427373d6d84e98730d7795d8f6f8731fda16")).toBe(true);
    expect(EVM_TX_REGEX.test("0x3b65706f6ca44f6c1d92d9275480bec219c2f4782555026a756d34b93cf9f5a4")).toBe(
      true,
    );
  });

  it("matches btc address and tx patterns", () => {
    expect(BTC_ADDRESS_REGEX.test("bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kygt080")).toBe(true);
    expect(BTC_TX_REGEX.test("4d3c4b88f8706d5ef4cfdca882f228f31d5ba55f1cdccb9d2635ee11ad1ed7e9")).toBe(true);
  });
});

describe("url parsing", () => {
  it("parses evm address routes", () => {
    expect(
      parseTargetFromUrl("https://etherscan.io/address/0x8589427373d6d84e98730d7795d8f6f8731fda16"),
    ).toEqual({
      address: "0x8589427373d6d84e98730d7795d8f6f8731fda16",
      chain: "eth",
      kind: "address",
    });
  });

  it("parses evm tx routes", () => {
    expect(
      parseTargetFromUrl(
        "https://optimistic.etherscan.io/tx/0x3b65706f6ca44f6c1d92d9275480bec219c2f4782555026a756d34b93cf9f5a4",
      ),
    ).toEqual({
      address: "0x3b65706f6ca44f6c1d92d9275480bec219c2f4782555026a756d34b93cf9f5a4",
      chain: "optimism",
      kind: "tx",
    });
  });

  it("parses btc address routes", () => {
    expect(
      parseTargetFromUrl("https://mempool.space/address/bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kygt080"),
    ).toEqual({
      address: "bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kygt080",
      chain: "btc",
      kind: "address",
    });
  });

  it("returns null for unsupported routes", () => {
    expect(parseTargetFromUrl("https://etherscan.io/block/123")).toBeNull();
    expect(parseTargetFromUrl("https://example.com/address/0x8589427373d6d84e98730d7795d8f6f8731fda16")).toBeNull();
  });
});
