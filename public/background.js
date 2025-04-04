let walletIdMap = {};
// Load the Socket.IO client library
import { io } from "./socket.io.js";

function connectToSocket(wallet, network, tabId) {
  let ws = null;
  return new Promise((resolve, reject) => {
    try {
      // ws = io("https://api.bombstats.com", {
      ws = io("http://localhost:3000", {
        forceNew: true,
        transports: ["websocket"],
        reconnection: false,
        query: {
          extension: true,
          wallet,
          network,
        },
      });

      ws.on("error", (error) => {
        console.error("Error connecting to server", error);
        reject(error);
      });

      ws.on("connect", () => {
        console.log("Connected to server");
        startInactivityTimer(tabId);
        resolve();
      });
      ws.on("get-current-values", (values) => {
        chrome.tabs.query({}, function (tabs) {
          tabs.map((tab) => {
            if (tab.url?.includes("game.bombcrypto.io")) {
              chrome.tabs.sendMessage(tab.id, {
                action: "bombstats-from-background",
                value: {
                  action: "get-current-values",
                  values,
                },
              });
            }
          });
        });
      });
      walletIdMap[tabId]["ws"] = ws;

      ws.on("disconnect", () => {
        console.log("Disconnected from server");
        walletIdMap[tabId]["ws"] = null;
        clearInactivityTimer(tabId);
      });

      ws.on("connect_error", (error) => {
        console.error("Connection error :", error);
        walletIdMap[tabId]["ws"].disconnect();
        walletIdMap[tabId]["ws"] = null;
        clearInactivityTimer(tabId);
      });
    } catch (e) {
      ws?.disconnect();
      walletIdMap[tabId]["ws"] = null;
      throw e;
    }
  });
}

function isSocketConnected(tabId) {
  return Boolean(walletIdMap[tabId]?.ws);
  // return ws && ws.connected;
}

chrome.action.onClicked.addListener((params) => {
  const wallet = walletIdMap[params.id]?.walletId?.toLowerCase();
  const network = walletIdMap[params.id]?.network?.toLowerCase();

  let url = "https://www.bombstats.com";

  if (wallet || network) {
    url += `/${network}/wallet/${wallet}`;
  }

  chrome.tabs.create({ url });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // if (message.action === "websocketConnected" && sender.tab) {
  const walletId = message.wallet;
  if (!walletIdMap[sender.tab.id]) {
    walletIdMap[sender.tab.id] = {};
  }

  if (walletId) {
    walletIdMap[sender.tab.id]["walletId"] = walletId;
    walletIdMap[sender.tab.id]["network"] = message.network;
  }

  if (message.params?.wallet && message.params?.network) {
    walletIdMap[sender.tab.id]["walletId"] = message.params?.wallet;
    walletIdMap[sender.tab.id]["network"] = message.params?.network;
  }

  // }
  if (message.action === "closeTab" && sender.tab) {
    walletIdMap[sender.tab.id]["walletId"] = message.walletId;
    walletIdMap[sender.tab.id]["network"] = message.network;
  } else if (message.action === "websocketEvent") {
    sendMessage(
      message.params?.wallet,
      message.params?.network,
      message.params?.message,
      message.params?.additional,
      sender.tab.id
    );
  }
});

chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
  const walletId = walletIdMap[tabId]?.walletId;
  if (!walletId) {
    console.log(walletIdMap);
    console.error("Wallet ID não encontrado para a aba fechada.");
    return;
  }

  try {
    await sendMessage(
      walletId,
      walletIdMap[tabId].network,
      "Q0xPU0VE",
      undefined,
      tabId
    );
    await new Promise((resolve) => setTimeout(resolve, 3000));
  } catch (e) {
    console.error(e);
  } finally {
    delete walletIdMap[tabId];
  }

  console.log("Tab closed", tabId);
});

function startInactivityTimer(tabId) {
  walletIdMap[tabId]["inactivityTimeout"] = setTimeout(() => {
    if (walletIdMap[tabId]?.ws) {
      walletIdMap[tabId]?.ws.disconnect();
      walletIdMap[tabId]["ws"] = null;
    }
  }, 60000 * 15); // Set your inactivity timeout (e.g., 60,000 ms = 60 seconds)
}

function resetInactivityTimer(tabId) {
  clearTimeout(walletIdMap[tabId]["inactivityTimeout"]);
  startInactivityTimer(tabId);
}

function clearInactivityTimer(tabId) {
  clearTimeout(walletIdMap[tabId]["inactivityTimeout"]);
}

async function sendMessage(wallet, network, message, additional, tabId) {
  try {
    if (!isSocketConnected(tabId)) {
      await connectToSocket(wallet, network, tabId);
    }
    walletIdMap[tabId]?.ws?.emit("extension", {
      wallet,
      network,
      message,
      additional,
    });

    if (message == "Q0xPU0VE") {
      setTimeout(() => {
        walletIdMap[tabId]?.ws?.disconnect();
        walletIdMap[tabId]["ws"] = null;
      }, 200);
    } else {
      resetInactivityTimer(tabId);
    }

    // await fetch("http://localhost:3000/extension/v2", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     wallet,
    //     network,
    //     message,
    //     additional,
    //   }),
    // });
  } catch (e) {
    console.error(e);
  }
}
