const { SmartFox } = require("sfs2x-api");

chrome.debugger.onEvent.addListener((source, method, params) => {
  if (method === "Network.webSocketFrameReceived") {
    // Decodifica a mensagem de base64 e processa
    const message = decodeMessage(params.response.payloadData);
    console.log(message);
  }
});

// Função para anexar o debugger a uma aba
function attachDebugger(tabId) {
  chrome.debugger.attach({ tabId: tabId }, "1.3", function () {
    if (chrome.runtime.lastError) {
      console.error(
        "Falha ao anexar o debugger:",
        chrome.runtime.lastError.message
      );
    } else {
      console.log("Debugger anexado com sucesso à aba", tabId);
      chrome.debugger.sendCommand(
        { tabId: tabId },
        "Network.enable",
        {},
        function () {
          if (chrome.runtime.lastError) {
            console.error(
              "Falha ao enviar comando Network.enable:",
              chrome.runtime.lastError.message
            );
          } else {
            console.log("Network.enable configurado com sucesso.");
          }
        }
      );
    }
  });
}

// Exemplo de como você pode decodificar e processar a mensagem
function decodeMessage(base64) {
  const SFS = new SmartFox({
    host: "sv-game-0.bombcrypto.io",
    port: 8443,
    zone: "BomberGameZone",
    debug: true,
    useSSL: true,
  });

  const binMessage = Buffer.from(base64, "base64");
  const parsed = SFS._socketEngine._protocolCodec.onPacketRead(binMessage);
  return parsed.dump();
}
