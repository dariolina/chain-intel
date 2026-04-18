import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
  manifest_version: 3,
  name: "Justice - On-chain Safety",
  version: "0.1.0",
  description: "Hint di sicurezza on-chain direttamente negli explorer.",
  action: {
    default_popup: "src/popup/index.html",
  },
  background: {
    service_worker: "src/background/index.ts",
    type: "module",
  },
  content_scripts: [
    {
      matches: [
        "https://etherscan.io/*",
        "https://*.etherscan.io/*",
        "https://basescan.org/*",
        "https://polygonscan.com/*",
        "https://arbiscan.io/*",
        "https://mempool.space/*",
        "https://blockstream.info/*",
      ],
      js: ["src/content/index.ts"],
      run_at: "document_idle",
    },
  ],
  permissions: ["storage"],
  host_permissions: ["http://localhost:3000/*", "https://*/*"],
  icons: {
    "16": "icons/16.png",
    "32": "icons/32.png",
    "48": "icons/48.png",
    "128": "icons/128.png",
  },
});
