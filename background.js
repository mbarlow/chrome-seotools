chrome.action.onClicked.addListener(async (tab) => {
  try {
    // First inject CSS
    await chrome.scripting.insertCSS({
      target: { tabId: tab.id },
      files: ["styles.css"],
    });

    // Then inject content script
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
    });

    // Finally send message to trigger analysis
    await chrome.tabs.sendMessage(tab.id, { action: "analyze" });
  } catch (error) {
    console.error("Error initializing SEO analyzer:", error);
  }
});
