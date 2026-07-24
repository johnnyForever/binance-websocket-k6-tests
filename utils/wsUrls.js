import { env } from "@/config";

const symbol = "btcusdt";

export function aggTradeUrl() {
  return `${env.wsUrl}/${symbol}@aggTrade`;
}

export function klineUrl(interval = "1m") {
  return `${env.wsUrl}/${symbol}@kline_${interval}`;
}

export function depthUrl() {
  return `${env.wsUrl}/${symbol}@depth`;
}

export function miniTickerUrl() {
  return `${env.wsUrl}/${symbol}@miniTicker`;
}
