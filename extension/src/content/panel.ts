import stylesText from "./styles.css?inline";

import type { RiskReport, ScreenPayload, Severity } from "../lib/types";

type ErrorTone = "neutral" | "critical";

type PanelState =
  | { type: "hidden" }
  | { type: "loading"; target: ScreenPayload }
  | { type: "result"; report: RiskReport }
  | { type: "error"; message: string; tone: ErrorTone; retryable: boolean };

interface RiskPanelOptions {
  onRefresh: () => void;
}

function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  options?: {
    className?: string;
    textContent?: string;
    attributes?: Record<string, string>;
  },
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tagName);

  if (options?.className) {
    element.className = options.className;
  }

  if (typeof options?.textContent === "string") {
    element.textContent = options.textContent;
  }

  if (options?.attributes) {
    for (const [key, value] of Object.entries(options.attributes)) {
      element.setAttribute(key, value);
    }
  }

  return element;
}

function severityLabel(severity: Severity): string {
  switch (severity) {
    case "clean":
      return "clean";
    case "info":
      return "info";
    case "warning":
      return "warning";
    case "danger":
      return "danger";
    default:
      return "unknown";
  }
}

export class RiskPanel {
  private readonly host = document.createElement("div");
  private readonly shadowRoot = this.host.attachShadow({ mode: "closed" });
  private readonly options: RiskPanelOptions;
  private state: PanelState = { type: "hidden" };
  private collapsed = false;

  constructor(options: RiskPanelOptions) {
    this.options = options;
    window.addEventListener("keydown", this.handleKeydown, true);
  }

  showLoading(target: ScreenPayload): void {
    this.collapsed = false;
    this.state = { type: "loading", target };
    this.render();
  }

  showResult(report: RiskReport): void {
    this.state = { type: "result", report };
    this.render();
  }

  showError(message: string, options?: { tone?: ErrorTone; retryable?: boolean }): void {
    this.collapsed = false;
    this.state = {
      type: "error",
      message,
      tone: options?.tone ?? "critical",
      retryable: options?.retryable ?? true,
    };
    this.render();
  }

  hide(): void {
    this.state = { type: "hidden" };
    this.render();
  }

  dispose(): void {
    window.removeEventListener("keydown", this.handleKeydown, true);
    this.host.remove();
  }

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    if (event.key !== "Escape" || this.state.type === "hidden") {
      return;
    }

    this.collapsed = true;
    this.render();
  };

  private mount(): void {
    if (!this.host.isConnected) {
      document.documentElement.appendChild(this.host);
    }
  }

  private toggleCollapsed(): void {
    this.collapsed = !this.collapsed;
    this.render();
  }

  private renderHeaderSubtitle(): string {
    if (this.state.type === "loading") {
      return `${this.state.target.chain} • ${this.state.target.kind}`;
    }

    if (this.state.type === "result") {
      const { chain, kind, address } = this.state.report;
      return `${chain} • ${kind} • ${address}`;
    }

    return "Rilevazione explorer";
  }

  private renderLoadingBody(body: HTMLElement): void {
    body.append(
      createElement("div", { className: "justice-skeleton full" }),
      createElement("div", { className: "justice-skeleton medium" }),
      createElement("div", { className: "justice-skeleton short" }),
    );
  }

  private renderResultBody(body: HTMLElement, report: RiskReport): void {
    body.append(createElement("p", { className: "justice-summary", textContent: report.summary }));

    // Sezione analisi AI
    if (report.aiSummary) {
      const aiSection = createElement("div", { className: "justice-ai-section" });
      const aiHeader = createElement("div", { className: "justice-ai-header" });
      aiHeader.append(
        createElement("span", { className: "justice-ai-icon", textContent: "✦" }),
        createElement("span", { className: "justice-ai-label", textContent: "Analisi AI" }),
      );
      const aiText = createElement("p", {
        className: "justice-ai-text",
        textContent: report.aiSummary,
      });
      aiSection.append(aiHeader, aiText);
      body.append(aiSection);
    }

    const sources = createElement("div", { className: "justice-source-list" });

    for (const source of report.sources) {
      const card = createElement("article", { className: "justice-source" });
      const header = createElement("div", { className: "justice-source-header" });
      const title = createElement("div", {
        className: "justice-source-title",
        textContent: source.label,
      });
      const pill = createElement("span", {
        className: "justice-pill",
        textContent: source.status,
        attributes: { "data-severity": source.severity },
      });
      const message = createElement("p", {
        className: "justice-source-message",
        textContent: source.message,
      });

      header.append(title, pill);
      card.append(header, message);

      if (source.externalUrl) {
        const link = createElement("a", {
          className: "justice-link",
          textContent: "Open source",
          attributes: {
            href: source.externalUrl,
            target: "_blank",
            rel: "noreferrer",
          },
        });
        card.append(link);
      }

      sources.append(card);
    }

    body.append(sources);
  }

  private renderErrorBody(body: HTMLElement, message: string, tone: ErrorTone): void {
    body.append(
      createElement("div", {
        className: "justice-banner",
        textContent: message,
        attributes: { "data-tone": tone },
      }),
    );
  }

  private renderFooter(footer: HTMLElement): void {
    const metaText =
      this.state.type === "result"
        ? `${this.state.report.cached ? "cached • " : ""}${new Date(this.state.report.generatedAt).toLocaleString()}`
        : "Aggiornamento manuale disponibile";

    footer.append(createElement("p", { className: "justice-meta", textContent: metaText }));

    const links = createElement("div", { className: "justice-footer-links" });
    const refresh = createElement("button", {
      className: "justice-button",
      textContent: "Refresh",
      attributes: { type: "button" },
    });
    refresh.addEventListener("click", () => this.options.onRefresh());
    links.append(refresh);

    footer.append(links);
  }

  private render(): void {
    if (this.state.type === "hidden") {
      this.host.remove();
      return;
    }

    this.mount();
    this.shadowRoot.replaceChildren();

    const style = document.createElement("style");
    style.textContent = stylesText;

    const root = createElement("section", {
      className: `justice-root${this.collapsed ? " justice-collapsed" : ""}`,
      attributes: {
        role: "complementary",
        "aria-label": "Justice risk panel",
      },
    });

    const severity =
      this.state.type === "result" ? this.state.report.severity : this.state.type === "error" ? "unknown" : "info";

    const card = createElement("div", {
      className: "justice-card",
      attributes: {
        "data-severity": severity,
      },
    });

    const header = createElement("div", { className: "justice-header" });
    const titleGroup = createElement("div", { className: "justice-title-group" });
    titleGroup.append(
      createElement("h2", { className: "justice-title", textContent: "Justice" }),
      createElement("div", {
        className: "justice-subtitle",
        textContent: this.renderHeaderSubtitle(),
      }),
    );

    const actions = createElement("div", { className: "justice-actions" });
    const refresh = createElement("button", {
      className: "justice-button",
      textContent: "Refresh",
      attributes: { type: "button", "aria-label": "Refresh risk panel" },
    });
    refresh.addEventListener("click", () => this.options.onRefresh());

    const collapse = createElement("button", {
      className: "justice-button",
      textContent: this.collapsed ? "Open" : "Collapse",
      attributes: { type: "button", "aria-label": "Collapse risk panel" },
    });
    collapse.addEventListener("click", () => this.toggleCollapsed());

    actions.append(refresh, collapse);
    header.append(titleGroup, actions);

    const body = createElement("div", { className: "justice-body" });
    if (this.state.type === "loading") {
      this.renderLoadingBody(body);
    } else if (this.state.type === "result") {
      this.renderResultBody(body, this.state.report);
    } else {
      this.renderErrorBody(body, this.state.message, this.state.tone);
    }

    const footer = createElement("div", { className: "justice-footer" });
    this.renderFooter(footer);

    card.append(header, body, footer);
    root.append(card);
    this.shadowRoot.append(style, root);
  }
}
