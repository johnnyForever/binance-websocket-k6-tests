import http from "k6/http";
import { check, group, sleep } from "k6";
import { Trend, Counter } from "k6/metrics";
import { buildOptions, apiMetrics, env } from "@/config";
import { pingUrl, timeUrl, exchangeInfoUrl } from "@/utils";

const pingDuration = new Trend("ping_duration");
const timeDuration = new Trend("time_duration");
const exchangeInfoDuration = new Trend("exchange_info_duration");

// Error counters
const pingErrors = new Counter("ping_errors");
const timeErrors = new Counter("time_errors");
const exchangeInfoErrors = new Counter("exchange_info_errors");

const { checksRate, failedRate } = apiMetrics;
const { ping, time, exchangeInfo } = apiMetrics.endpoints;

export const options = buildOptions({
  thresholds: {
    checks: [`rate>${checksRate}`],
    http_req_failed: [`rate<${failedRate}`],
    
    ping_duration: [`p(50)<${ping.p50}`, `p(95)<${ping.p95}`, `p(99)<${ping.p99}`],
    ping_errors: [`count<${ping.maxErrors}`],
    
    time_duration: [`p(50)<${time.p50}`, `p(95)<${time.p95}`, `p(99)<${time.p99}`],
    time_errors: [`count<${time.maxErrors}`],
    
    exchange_info_duration: [`p(50)<${exchangeInfo.p50}`, `p(95)<${exchangeInfo.p95}`, `p(99)<${exchangeInfo.p99}`],
    exchange_info_errors: [`count<${exchangeInfo.maxErrors}`],
  },
  tags: {
    type: "api",
    testType: "load",
  },
});

export default function () {
  const params = {
    timeout: `${env.timeout}ms`,
    tags: { name: "ping" },
  };

  group("Health Endpoints", function () {
    const pingRes = http.get(pingUrl(), { ...params, tags: { name: "ping" } });
    pingDuration.add(pingRes.timings.duration);

    if (
      !check(pingRes, {
        "ping status is 200": (r) => r.status === 200,
      })
    ) {
      pingErrors.add(1);
    }

    sleep(randomThinkTime(0.3, 0.7));
  });

  group("Server Time", function () {
    const timeRes = http.get(timeUrl(), { ...params, tags: { name: "time" } });
    timeDuration.add(timeRes.timings.duration);

    if (
      !check(timeRes, {
        "time status is 200": (r) => r.status === 200,
        "time has serverTime": (r) => r.json("serverTime") !== undefined,
      })
    ) {
      timeErrors.add(1);
    }

    sleep(randomThinkTime(0.3, 0.7));
  });

  group("Exchange Info", function () {
    const exchangeInfoRes = http.get(exchangeInfoUrl(), {
      ...params,
      tags: { name: "exchangeInfo" },
    });
    exchangeInfoDuration.add(exchangeInfoRes.timings.duration);

    if (
      !check(exchangeInfoRes, {
        "exchangeInfo status is 200": (r) => r.status === 200,
        "exchangeInfo has symbols": (r) => {
          const symbols = r.json("symbols");
          return Array.isArray(symbols) && symbols.length > 0;
        },
      })
    ) {
      exchangeInfoErrors.add(1);
    }

    sleep(randomThinkTime(0.5, 1.5));
  });
}

function randomThinkTime(min, max) {
  return Math.random() * (max - min) + min;
}
