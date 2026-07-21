import ws from "k6/ws";
import { check } from "k6";
import { Counter, Trend } from "k6/metrics";
import { miniTickerUrl, logConnection, logError, logTicker } from "@/utils";
import { buildOptions, env } from "@/config/index.js";

const tickerReceived = new Counter("ticker_received");
const priceChange = new Trend("price_change_percent");
const url = miniTickerUrl();

export const options = buildOptions({
  ticker_received: ["count>5"],
  price_change_percent: ["p(95)<10"],
});
  
export default function () {
  const connection = ws.connect(url, {}, function (socket) {
    socket.on("open", function () {
      logConnection("ticker", "connected");
    });

    socket.on("error", function (e) {
      logError("ticker WebSocket", e.error());
    });

    socket.on("message", function (message) {
      const msg = JSON.parse(message);
      tickerReceived.add(1);

      logTicker(msg);

      check(msg, {
        "has event type": (m) => m.e === "24hrMiniTicker",
        "has symbol": (m) => m.s !== undefined,
        "has close price": (m) => m.c !== undefined,
        "has open price": (m) => m.o !== undefined,
        "has high price": (m) => m.h !== undefined,
        "has low price": (m) => m.l !== undefined,
        "has volume": (m) => m.v !== undefined,
      });
    });

    socket.on("close", function () {
      logConnection("ticker", "closed");
    });

    socket.setTimeout(function () {
      socket.close();
    }, 9000);
  });

  check(connection, {
    "WebSocket status is 101": (r) => r && r.status === 101,
  });
}
