window.addEventListener("message", function (event) {
  // Verificar a origem da mensagem e a estrutura
  if (
    event.source === window &&
    event.data &&
    event.data.action === "websocketConnected"
  ) {
    chrome.runtime.sendMessage({
      action: event.data.action,
      walletId: event.data.walletId,
      network: event.data.network,
    });
  } else if (event.data.action === "websocketEvent") {
    chrome.runtime.sendMessage({
      action: event.data.action,
      params: event.data.params,
    });
  }
});

//send message to content.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action == "bombstats-from-background") {
    window.postMessage(message, "*");
  }
});
