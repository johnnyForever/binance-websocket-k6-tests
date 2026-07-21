import { environments, defaultSymbol } from "@/config/environments.js";

const wsUrl = environments.production.wsUrl;

export function aggTradeUrl() {
  return `${wsUrl}/${defaultSymbol}@aggTrade`;
}

export function klineUrl(interval = "1m") {
  return `${wsUrl}/${defaultSymbol}@kline_${interval}`;
}

export function depthUrl() {
  return `${wsUrl}/${defaultSymbol}@depth`;
}

export function miniTickerUrl() {
  return `${wsUrl}/${defaultSymbol}@miniTicker`;
}