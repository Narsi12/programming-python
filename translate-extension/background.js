const DEFAULTS = {
  apiBaseUrl: "https://libretranslate.com",
  targetLang: "en",
};

function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(DEFAULTS, (items) => resolve(items));
  });
}

async function doTranslate(text) {
  const { apiBaseUrl, targetLang } = await getSettings();
  const res = await fetch(`${apiBaseUrl}/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: text, source: "auto", target: targetLang, format: "text" }),
  });
  if (!res.ok) throw new Error(`Translate failed: ${res.status}`);
  const data = await res.json();
  return data.translatedText || "";
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "quick-translate",
    title: "Translate selection",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "quick-translate" || !info.selectionText) return;
  try {
    const translated = await doTranslate(info.selectionText);
    if (tab && tab.id) {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (text) => {
          alert(`Translation:\n\n${text}`);
        },
        args: [translated.slice(0, 2000)],
      });
    }
  } catch (e) {
    if (tab && tab.id) {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (msg) => {
          alert(`Translation Error:\n\n${msg}`);
        },
        args: [String(e.message || e)],
      });
    }
  }
});


