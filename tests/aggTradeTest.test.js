import ws from "k6/ws";
import { check } from "k6";
import { aggTradeUrl, logConnection, logTrade, logError } from "@/utils";
import { Counter, Trend } from "k6/metrics";
import { buildOptions, env } from "@/config/index.js";

const tradesReceived = new Counter("trades_received");
const priceValue = new Trend("btc_price");
const url = aggTradeUrl();

export const options = buildOptions({
  trades_received: ["count>5"],
  btc_price: ["p(95)<100000"],
});

export default function () {
  const connection = ws.connect(url, {}, function (socket) {
    socket.on("open", function () {
      logConnection("aggTrade", "connected");
    });

    socket.on("error", function (e) {
      logError("aggTrade WebSocket", e.error());
    });

    socket.on("message", function (message) {
      console.log("Received message:", message);

      const msg = JSON.parse(message);
      logTrade(msg);

      tradesReceived.add(1);
      priceValue.add(parseFloat(msg.p));

      check(msg, {
        "event type": (m) => m.e === "aggTrade",
        symbol: (m) => m.s !== undefined,
        price: (m) => m.p !== undefined,
        quantity: (m) => m.q !== undefined,
      });
    });

    socket.on("close", function () {
      console.log("AggTrade WebSocket closed");
    });

    socket.setTimeout(function () {
      socket.close();
    }, 9000);
  });

  check(connection, {
    "WebSocket status is 101": (r) => r && r.status === 101,
  });
}
