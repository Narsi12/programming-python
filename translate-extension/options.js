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

function loadSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(defaultSettings, (items) => resolve(items));
  });
}

function saveSettings(settings) {
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

document.addEventListener("DOMContentLoaded", async () => {
  const apiBaseUrl = document.getElementById("apiBaseUrl");
  const targetLang = document.getElementById("targetLang");
  const saveBtn = document.getElementById("saveBtn");
  const status = document.getElementById("status");

  const settings = await loadSettings();
  apiBaseUrl.value = settings.apiBaseUrl;
  fillLanguageSelect(targetLang, settings.targetLang);

  saveBtn.addEventListener("click", async () => {
    await saveSettings({ apiBaseUrl: apiBaseUrl.value.trim() || defaultSettings.apiBaseUrl, targetLang: targetLang.value });
    status.textContent = "Saved";
    setTimeout(() => (status.textContent = ""), 1500);
  });
});


