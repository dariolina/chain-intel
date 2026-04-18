import {
  API_BASE_URL_KEY,
  DEFAULT_API_BASE_URL,
  normalizeApiBaseUrl,
} from "../lib/api";

function readStorageSync<T>(key: string): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(key, (result) => {
      const error = chrome.runtime.lastError;
      if (error) {
        reject(error);
        return;
      }

      resolve(result[key] as T | undefined);
    });
  });
}

function writeStorageSync(key: string, value: string): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set({ [key]: value }, () => {
      const error = chrome.runtime.lastError;
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

const formElement = document.querySelector<HTMLFormElement>("#settings-form");
const inputElement = document.querySelector<HTMLInputElement>("#apiBaseUrl");
const statusElement = document.querySelector<HTMLSpanElement>("#status");

if (!formElement || !inputElement || !statusElement) {
  throw new Error("Popup DOM non inizializzato correttamente.");
}

const form = formElement;
const input = inputElement;
const status = statusElement;

async function loadValue(): Promise<void> {
  const stored = await readStorageSync<string>(API_BASE_URL_KEY);
  input.value = normalizeApiBaseUrl(stored ?? DEFAULT_API_BASE_URL);
}

function setStatus(message: string): void {
  status.textContent = message;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const normalized = normalizeApiBaseUrl(input.value);

  try {
    new URL(normalized);
  } catch {
    setStatus("URL non valida.");
    return;
  }

  await writeStorageSync(API_BASE_URL_KEY, normalized);
  setStatus("Salvato.");
});

void loadValue().catch((error) => {
  setStatus(error instanceof Error ? error.message : "Impossibile leggere la configurazione.");
});
