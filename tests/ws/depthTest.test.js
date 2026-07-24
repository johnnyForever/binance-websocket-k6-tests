import ws from "k6/ws";
import { check } from "k6";
import { Counter } from "k6/metrics";
import { depthUrl, logConnection, logError, logDepth } from "@/utils";
import { buildOptions, wsMetrics } from "@/config";

const depthUpdates = new Counter("depth_updates");
const url = depthUrl();

const { wsConnecting, checksRate, minMessages } = wsMetrics;
const { depth } = wsMetrics.streams;

export const options = buildOptions({
  thresholds: {
    checks: [`rate>${checksRate}`],
    ws_connecting: [
      `p(50)<${wsConnecting.p50}`,
      `p(95)<${wsConnecting.p95}`,
      `p(99)<${wsConnecting.p99}`,
    ],
    ws_msgs_received: [`count>${minMessages}`],
    depth_updates: [`count>${depth.minCount}`],
  },
  tags: {
    type: "ws",
  },
});

export default function () {
  const connection = ws.connect(url, {}, function (socket) {
    socket.on("open", function () {
      logConnection("depth", "connected");
    });

    socket.on("error", function (e) {
      logError("depth WebSocket", e.error());
    });

    socket.on("message", function (message) {
      const msg = JSON.parse(message);
      depthUpdates.add(1);
      
      logDepth(msg);

      check(msg, {
        "has event type": (m) => m.e === "depthUpdate",
        "has symbol": (m) => m.s !== undefined,
        "has bids": (m) => m.b !== undefined && m.b.length > 0,
        "has asks": (m) => m.a !== undefined && m.a.length > 0,
      });
    });

    socket.on("close", function () {
      logConnection("depth", "closed");
    });

    socket.setTimeout(function () {
      socket.close();
    }, 9000);
  });

  check(connection, {
    "WebSocket status is 101": (r) => r && r.status === 101,
  });
}
