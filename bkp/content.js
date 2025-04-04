chrome.runtime.sendMessage({
  type: "INITIAL_MESSAGE",
  data: Date.now(),
});

// Guardando a referência original do WebSocket
(async () => {
  //sleep 5 seconds
  await new Promise((resolve) => setTimeout(resolve, 1000));
  chrome.runtime.sendMessage({
    type: "INITIAL_MESSAGE novo",
    data: Date.now(),
  });

  const OriginalWebSocket = window.WebSocket;

  // Substituindo o WebSocket pela nossa implementação personalizada
  function CustomWebSocket(url, protocols) {
    const ws = protocols
      ? new OriginalWebSocket(url, protocols)
      : new OriginalWebSocket(url);

    ws.addEventListener("open", function (event) {
      chrome.runtime.sendMessage({
        type: "WEBSOCKET_OPENED",
        data: event,
      });
    });

    ws.addEventListener("message", function (event) {
      chrome.runtime.sendMessage({
        type: "WEBSOCKET_MESSAGE_RECEIVED",
        data: event.data,
      });
    });

    ws.addEventListener("close", function (event) {
      chrome.runtime.sendMessage({
        type: "WEBSOCKET_CLOSED",
        data: event,
      });
    });

    ws.addEventListener("error", function (event) {
      chrome.runtime.sendMessage({
        type: "WEBSOCKET_ERROR",
        data: event,
      });
    });

    return ws;
  }

  // Mantendo a herança do WebSocket original
  CustomWebSocket.prototype = OriginalWebSocket.prototype;
  window.WebSocket = CustomWebSocket;

  // Substituindo o método send do WebSocket
  if (window.WebSocket.prototype.send) {
    const originalSend = window.WebSocket.prototype.send;
    window.WebSocket.prototype.send = function (data) {
      chrome.runtime.sendMessage({
        type: "WEBSOCKET_SEND",
        data: arrayBufferToBase64(data),
      });
      originalSend.apply(this, arguments);
    };
  }

  // Interceptando a criação do objeto `socket`
  const originalWebSocket = window.WebSocket;
  Object.defineProperty(window, "WebSocket", {
    configurable: true,
    enumerable: true,
    get: function () {
      return CustomWebSocket;
    },
    set: function (newWebSocket) {
      OriginalWebSocket = newWebSocket;
    },
  });
})();

// Enviando uma mensagem de teste para verificar se a substituição foi bem-sucedida
chrome.runtime.sendMessage({
  type: "TEST_MESSAGE",
  data: "WebSocket interception setup complete",
});

// chrome.action.onClicked.addListener(() => {
//   // Obtém a aba ativa na janela atual
//   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//      chrome.runtime.sendMessage("tabs", tabs);
//     if (tabs.length > 0) {
//       const activeTab = tabs[0];
//       const tabId = activeTab.id;

//       // Envia a mensagem ao script de conteúdo
//       chrome.tabs.sendMessage(tabId, {
//         type: "LOG_TO_CONSOLE",
//         data: "Hello, this is a message from your Chrome extension!",
//       });
//     }
//   });
// });

// const networkFilters = {
//     urls: ["<all_urls>"],
//   };

// chrome.webRequest.onBeforeRequest.addListener((details) => {
//   chrome.runtime.sendMessage({
//     type: "WEBSOCKET_MESSAGE_RECEIVED",
//     data: details,
//   });
// }, networkFilters);

// chrome.scripting.executeScript(
//   undefined,
//   () => {
//     // O código injetado será executado no contexto da aba
//      chrome.runtime.sendMessage("Hello, this is a message from your Chrome extension!");
//   },
//   () => {
//      chrome.runtime.sendMessage("Script injected successfully.");
//   }
// );

function arrayBufferToBase64(buffer) {
  var binary = "";
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
