# Binance WebSocket k6 Tests

Performance testy pre Binance WebSocket API.

## Setup

```bash
git clone https://github.com/johnnyForever/binance-websocket-k6-tests.git
cd binance-websocket-k6-tests
npm install
npm run bundle
```

## Available Scripts

```bash
npm run bundle
npm run test:all

# Single tests
npm run test:aggTrade
npm run test:depth
npm run test:ticker
npm run test:kline

# aggTrade
npm run aggTrade:smoke
npm run aggTrade:load
npm run aggTrade:stress
npm run aggTrade:soak

# depth
npm run depth:smoke
npm run depth:load

# ticker
npm run ticker:smoke
npm run ticker:load

# kline
npm run kline:smoke
npm run kline:load

# Testnet
npm run testnet:aggTrade
npm run testnet:aggTrade:load
```

## Architecture

```
config/         # Environments + test profiles
tests/          # k6 test files
utils/          # URL factory and logger
dist/           # Bundled tests (webpack)
```

## Env variables

- `K6_ENV` - production (default), testnet
- `K6_PROFILE` - smoke (default), load, stress, spike, soak

```powershell
$env:K6_PROFILE="load"; npm run test:aggTrade
```

## Configuration

### Environments

| Env | WebSocket URL | Use case |
|-----|---------------|----------|
| `production` | `wss://stream.binance.com:9443/ws` | Live Binance API |
| `testnet` | `wss://testnet.binance.vision/ws` | Testing without real data |

Set via `-e K6_ENV=testnet` or environment variable.

### Test Profiles

| Profile | VUs | Duration | Purpose |
|---------|-----|----------|---------|
| `smoke` | 3 | 10s | Quick validation |
| `load` | 5→30 | ~2min | Normal load simulation |
| `stress` | 10→60 | ~3min | Find breaking point |
| `spike` | 30→240 | ~1min | Sudden traffic burst |
| `soak` | 10→25 | ~12min | Long-term stability |
