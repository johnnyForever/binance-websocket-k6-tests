import http from "k6/http";
import { check } from "k6";
import { Counter } from "k6/metrics";
import { buildOptions, apiMetrics, env } from "@/config";
import { pingUrl, timeUrl, exchangeInfoUrl } from "@/utils";

const apiCallsTotal = new Counter("api_calls_total");

const { checksRate, failedRate, httpReqDuration } = apiMetrics;

export const options = buildOptions({
  thresholds: {
    checks: [`rate>${checksRate}`],
    http_req_failed: [`rate<${failedRate}`],
    http_req_duration: [
      `p(50)<${httpReqDuration.p50}`,
      `p(95)<${httpReqDuration.p95}`,
      `p(99)<${httpReqDuration.p99}`,
    ],
  },
  scenarioOverrides: {
    vus: 5,
    duration: "20s",
  },
  tags: {
    type: "api",
  },
});

export default function () {
  const params = {
    timeout: `${env.timeout}ms`,
  };

  const pingRes = http.get(pingUrl(), params);
  if (
    check(pingRes, {
      "ping status is 200": (r) => r.status === 200,
    })
  ) {
    apiCallsTotal.add(1);
  }

  const timeRes = http.get(timeUrl(), params);
  if (
    check(timeRes, {
      "time status is 200": (r) => r.status === 200,
      "time has serverTime": (r) => r.json("serverTime") !== undefined,
    })
  ) {
    apiCallsTotal.add(1);
  }

  const exchangeInfoRes = http.get(exchangeInfoUrl(), params);
  if (
    check(exchangeInfoRes, {
      "exchangeInfo status is 200": (r) => r.status === 200,
      "exchangeInfo has symbols": (r) => {
        const symbols = r.json("symbols");
        return Array.isArray(symbols) && symbols.length > 0;
      },
    })
  ) {
    apiCallsTotal.add(1);
  }
}
