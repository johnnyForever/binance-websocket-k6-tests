import ws from "k6/ws";
import { check } from "k6";
import { Counter, Trend } from "k6/metrics";
import { miniTickerUrl, logConnection, logError, logTicker } from "@/utils";
import { buildOptions, wsMetrics } from "@/config";

const tickerReceived = new Counter("ticker_received");
const priceChange = new Trend("price_change_percent");
const url = miniTickerUrl();

const { wsConnecting, checksRate, minMessages } = wsMetrics;
const { ticker } = wsMetrics.streams;

export const options = buildOptions({
  thresholds: {
    checks: [`rate>${checksRate}`],
    ws_connecting: [
      `p(50)<${wsConnecting.p50}`,
      `p(95)<${wsConnecting.p95}`,
      `p(99)<${wsConnecting.p99}`,
    ],
    ws_msgs_received: [`count>${minMessages}`],
    ticker_received: [`count>${ticker.minCount}`],
    price_change_percent: [`p(95)<${ticker.priceChangeP95}`],
  },
  tags: {
    type: "ws",
  },
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
