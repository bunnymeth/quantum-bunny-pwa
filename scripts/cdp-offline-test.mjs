import http from "node:http";

const browserOrigin = "http://127.0.0.1:9222";
const expectedTitle = "量子兔兔旅行記";
const expectedText = "離線旅程已備妥";

function getJson(path) {
  return new Promise((resolve, reject) => {
    http.get(`${browserOrigin}${path}`, (response) => {
      let body = "";
      response.on("data", (chunk) => { body += chunk; });
      response.on("end", () => resolve(JSON.parse(body)));
    }).on("error", reject);
  });
}

async function main() {
  const targets = await getJson("/json/list");
  const target = targets.find((item) => item.type === "page" && item.url.includes("4173-iq7fbs4bpddu6m6885ocg-81578521"));
  if (!target?.webSocketDebuggerUrl) throw new Error("找不到公開 PWA 的瀏覽器分頁。");

  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
  let id = 0;
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const requestId = ++id;
    const onMessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.id !== requestId) return;
      socket.removeEventListener("message", onMessage);
      if (message.error) reject(new Error(message.error.message)); else resolve(message.result);
    };
    socket.addEventListener("message", onMessage);
    socket.send(JSON.stringify({ id: requestId, method, params }));
  });

  try {
    await send("Network.enable");
    await send("Network.emulateNetworkConditions", { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0, connectionType: "none" });
    await send("Page.reload", { ignoreCache: true });
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const result = await send("Runtime.evaluate", { expression: "({ title: document.title, text: document.body.innerText })", returnByValue: true });
    const page = result.result.value;
    if (page.title !== expectedTitle || !page.text.includes(expectedText)) throw new Error("離線重新載入未顯示已快取的遊戲首頁。");
    const interaction = await send("Runtime.evaluate", {
      expression: `(() => {
        const key = "quantum-bunny-pwa-state-v1";
        const original = localStorage.getItem(key);
        const before = JSON.parse(original || "{\\"points\\":0}").points || 0;
        document.querySelector(".affirmation-button")?.click();
        return new Promise((resolve) => setTimeout(() => {
          const after = JSON.parse(localStorage.getItem(key) || "{\\"points\\":0}").points || 0;
          localStorage.setItem(key, original || "");
          resolve({ before, after });
        }, 200));
      })()`,
      awaitPromise: true,
      returnByValue: true,
    });
    const { before, after } = interaction.result.value;
    if (after !== before + 1) throw new Error("離線狀態下正能量互動或本機保存未正常運作。");
    console.log(JSON.stringify({ offlineReload: "passed", offlineInteraction: "passed", title: page.title, marker: expectedText }));
  } finally {
    await send("Network.emulateNetworkConditions", { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1, connectionType: "none" }).catch(() => undefined);
    socket.close();
  }
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
