/**
 * Configuration Loader
 */
import { environments, testProfiles } from "@/config/environments.js";

const envName = __ENV.K6_ENV || "testnet";
const profileName = __ENV.K6_PROFILE || "smoke";

// Validate environment
if (!environments[envName]) {
  throw new Error(`Unknown environment: ${envName}.`);
}

// Validate profile
if (!testProfiles[profileName]) {
  throw new Error(`Unknown profile: ${profileName}.`);
}

export const env = environments[envName];
export const profile = testProfiles[profileName];

export function buildThresholds(customMetrics = {}) {
  const t = env.thresholds;

  return {
    checks: [`rate>${t.checksRate}`],

    ws_connecting: [
      `p(50)<${t.wsConnecting.p50}`,
      `p(95)<${t.wsConnecting.p95}`,
      `p(99)<${t.wsConnecting.p99}`,
    ],

    ws_msgs_received: [`count>${t.minMessages}`],

    ...customMetrics,
  };
}

// Build test options
export function buildOptions(config = {}) {
  const { thresholds = {}, vus, duration, stages } = config;
  
  // Base options
  const options = {
    thresholds: buildThresholds(thresholds),
    tags: {
      env: envName,
      profile: profileName,
    },
  };

  if (stages || profile.stages) {
    options.stages = stages || profile.stages;
  } else {
    options.vus = vus || profile.vus || 1;
    options.duration = duration || profile.duration || "10s";
  }

  return options;
}

export { environments, testProfiles };
