const languageOptions = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "hi", name: "Hindi" },
  { code: "te", name: "Telugu" },
  { code: "ta", name: "Tamil" },
  { code: "mr", name: "Marathi" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ru", name: "Russian" },
];

const defaultSettings = {
  apiBaseUrl: "https://libretranslate.com",
  targetLang: "en",
};

async function loadSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(defaultSettings, (items) => resolve(items));
  });
}

async function saveSettings(settings) {
  return new Promise((resolve) => {
    chrome.storage.sync.set(settings, () => resolve());
  });
}

function fillLanguageSelect(selectEl, selected) {
  selectEl.innerHTML = "";
  languageOptions.forEach((lang) => {
    const opt = document.createElement("option");
    opt.value = lang.code;
    opt.textContent = `${lang.name} (${lang.code})`;
    if (lang.code === selected) opt.selected = true;
    selectEl.appendChild(opt);
  });
}

async function translateText(apiBaseUrl, text, targetLang) {
  const res = await fetch(`${apiBaseUrl}/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: text, source: "auto", target: targetLang, format: "text" }),
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Translate failed: ${res.status} ${msg}`);
  }
  const data = await res.json();
  return data.translatedText || "";
}

document.addEventListener("DOMContentLoaded", async () => {
  const settings = await loadSettings();

  const sourceText = document.getElementById("sourceText");
  const targetLang = document.getElementById("targetLang");
  const resultText = document.getElementById("resultText");
  const translateBtn = document.getElementById("translateBtn");

  fillLanguageSelect(targetLang, settings.targetLang);

  translateBtn.addEventListener("click", async () => {
    const text = sourceText.value.trim();
    const lang = targetLang.value;
    if (!text) return;
    translateBtn.disabled = true;
    resultText.value = "Translating...";
    try {
      const translated = await translateText(settings.apiBaseUrl, text, lang);
      resultText.value = translated;
      await saveSettings({ ...settings, targetLang: lang });
    } catch (e) {
      resultText.value = String(e.message || e);
    } finally {
      translateBtn.disabled = false;
    }
  });
});


