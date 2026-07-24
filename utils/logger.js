export function logTrade(msg) {
  console.log(`[TRADE] ${msg.s} | Price: ${msg.p} | Qty: ${msg.q} | Time: ${new Date(msg.T).toISOString()}`);
}

export function logKline(msg) {
  const k = msg.k;
  console.log(`[KLINE] ${msg.s} | O:${k.o} H:${k.h} L:${k.l} C:${k.c} | Vol:${k.v}`);
}

export function logDepth(msg) {
  const bids = Array.isArray(msg.b) ? msg.b : [];
  const asks = Array.isArray(msg.a) ? msg.a : [];
  const topBid = bids[0] || ["N/A", "N/A"];
  const topAsk = asks[0] || ["N/A", "N/A"];
  console.log(`[DEPTH] Bid: ${topBid[0]} (${topBid[1]}) | Ask: ${topAsk[0]} (${topAsk[1]})`);
}

export function logTicker(msg) {
  console.log(`[TICKER] ${msg.s} | Close: ${msg.c} | High: ${msg.h} | Low: ${msg.l} | Vol: ${msg.v}`);
}

export function logError(context, error) {
  console.error(`[ERROR] ${context}: ${error}`);
}

export function logConnection(stream, status) {
  console.log(`[WS] ${stream} - ${status}`);
}