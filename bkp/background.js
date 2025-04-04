chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("onMessage", message);
});

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({ url: chrome.runtime.getURL("index.html") });
});
