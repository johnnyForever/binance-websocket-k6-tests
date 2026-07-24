import ws from "k6/ws";
import { check } from "k6";
import { aggTradeUrl, logConnection, logTrade, logError } from "@/utils";
import { Counter, Trend } from "k6/metrics";
import { buildOptions, wsMetrics } from "@/config";

const tradesReceived = new Counter("trades_received");
const priceValue = new Trend("btc_price");
const url = aggTradeUrl();

const { wsConnecting, checksRate, minMessages } = wsMetrics;
const { aggTrade } = wsMetrics.streams;

export const options = buildOptions({
  thresholds: {
    checks: [`rate>${checksRate}`],
    ws_connecting: [
      `p(50)<${wsConnecting.p50}`,
      `p(95)<${wsConnecting.p95}`,
      `p(99)<${wsConnecting.p99}`,
    ],
    ws_msgs_received: [`count>${minMessages}`],
    trades_received: [`count>${aggTrade.minCount}`],
    btc_price: [`p(95)<${aggTrade.btcPriceP95}`],
  },
  tags: {
    type: "ws",
  },
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
