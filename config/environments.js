/**
 * Centralized configuration for different environments and test profiles.
 */
export const environments = {
  production: {
    name: "Production",
    baseUrl: "https://api.binance.com/api/v3",
    wsUrl: "wss://stream.binance.com:9443/ws",
    timeout: 10000,
    thresholds: {
      checksRate: 0.99,
      wsConnecting: {
        p50: 200,
        p95: 500,
        p99: 1000,
      },
      minMessages: 10,
    },
  },
  testnet: {
    name: "Testnet",
    baseUrl: "https://testnet.binance.vision/api/v3",
    wsUrl: "wss://testnet.binance.vision/ws",
    timeout: 15000,
    thresholds: {
      checksRate: 0.95,
      wsConnecting: {
        p50: 600,
        p95: 1000,
        p99: 2000,
      },
      minMessages: 5,
    },
  },
};

// Test configuration profiles
export const testProfiles = {
  smoke: {
    vus: 3,
    duration: "10s",
    description: "Quick validation test",
  },
  // max 30 VUs and total duration of 1 minute 50 seconds
  load: {
    description: "Load test",
    stages: [
      { duration: "10s", target: 5 },
      { duration: "30s", target: 30 },
      { duration: "1m", target: 30 }, 
      { duration: "10s", target: 0 }, 
    ],
  },
  // max 60 VUs and total duration of 3 minutes 20 seconds
  stress: {
    description: "Stress test",
    stages: [
      { duration: "20s", target: 10 },
      { duration: "30s", target: 30 },
      { duration: "2m", target: 60 },
      { duration: "30s", target: 60 },
    ],
  },
  // max 240 VUs and total duration of 55 seconds
  spike: {
    description: "Spike test",
    stages: [
      { duration: "5s", target: 30 },
      { duration: "5s", target: 100 },
      { duration: "30s", target: 240 },
      { duration: "5s", target: 100 }, 
      { duration: "10s", target: 10 },
    ],
  },
    // max 25 VUs and total duration of 7 minutes
  soak: {
    description: "Long duration stability test",
    stages: [
      { duration: "1m", target: 10 },
      { duration: "10m", target: 25 },
      { duration: "1m", target: 10 },
    ],
  },
};

export const symbols = {
  primary: "btcusdt",
  secondary: "ethusdt",
};

export const defaultSymbol = symbols.primary;
