import ws from "k6/ws";
import { check } from "k6";
import { Counter } from "k6/metrics";
import { klineUrl, logConnection, logError, logKline } from "@/utils";
import { buildOptions, env } from "@/config/index.js";

const klineReceived = new Counter("kline_received");
const url = klineUrl();

export const options = buildOptions({
  kline_received: ["count>5"],
});

export default function () {

  const connection = ws.connect(url, {}, function (socket) {
    socket.on("open", function () {
      logConnection("kline", "connected");
    });

    socket.on("error", function (e) {
      logError("kline WebSocket", e.error());
    });

    socket.on("message", function (message) {
      const msg = JSON.parse(message);
      klineReceived.add(1);

      logKline(msg);

      check(msg, {
        "has event type": (m) => m.e === "kline",
        "has symbol": (m) => m.s !== undefined,
        "has kline data": (m) => m.k !== undefined,
        "has open price": (m) => m.k.o !== undefined,
        "has high price": (m) => m.k.h !== undefined,
        "has low price": (m) => m.k.l !== undefined,
        "has close price": (m) => m.k.c !== undefined,
        "has volume": (m) => m.k.v !== undefined,
      });
    });

    socket.on("close", function () {
      logConnection("kline", "closed");
    });

    socket.setTimeout(function () {
      socket.close();
    }, 14000);
  });

  check(connection, {
    "WebSocket status is 101": (r) => r && r.status === 101,
  });
}
