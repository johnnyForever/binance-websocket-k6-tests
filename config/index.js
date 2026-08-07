import envs from "@/config/envs";
import scenarios from "@/config/scenarios";
import metrics from "@/config/metrics";

export const envKey = __ENV.ENV || "production";
export const scenarioKey = __ENV.PROFILE || "smoke";

export const envConfig = envs[envKey];
export const scenarioConfig = scenarios[scenarioKey];
export const metricsConfig = metrics[envKey];

if (!envConfig) {
  throw new Error(`Unknown environment: ${envKey}.`);
}

if (!scenarioConfig) {
  throw new Error(`Unknown scenario: ${scenarioKey}.`);
}

if (!metricsConfig) {
  throw new Error(`Missing metrics for environment: ${envKey}.`);
}

if (!metricsConfig.ws) {
  throw new Error(`Missing WS metrics for environment: ${envKey}.`);
}

if (!metricsConfig.api) {
  throw new Error(`Missing API metrics for environment: ${envKey}.`);
}

export const env = {
  ...envConfig,
};

export const profile = scenarioConfig;
export const wsMetrics = metricsConfig.ws;
export const apiMetrics = metricsConfig.api;

export function buildScenarioOptions(overrides = {}) {
  const { vus, duration, stages } = overrides;

  if (stages || scenarioConfig.stages) {
    return {
      stages: stages || scenarioConfig.stages,
    };
  }

  return {
    vus: vus || scenarioConfig.vus || 1,
    duration: duration || scenarioConfig.duration || "10s",
  };
}

export function buildOptions({
  scenarioOverrides = {},
  thresholds = {},
  scenario = scenarioOverrides,
  tags = {},
} = {}) {
  return {
    ...buildScenarioOptions(scenario),
    thresholds,
    tags: {
      env: envKey,
      ...tags,
    },
  };
}
