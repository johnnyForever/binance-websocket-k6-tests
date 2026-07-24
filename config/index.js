import envs from "@/config/envs";
import scenarios from "@/config/scenarios";
import metrics from "@/config/metrics";

export const envKey = __ENV.ENV || "production";
export const scenarioKey = __ENV.PROFILE || "smoke";

function parsePositiveInteger(value, variableName) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(
      `Invalid ${variableName} value: "${value}". Expected a positive integer.`,
    );
  }

  return parsed;
}

const vusFromEnv = parsePositiveInteger(__ENV.VUS, "VUS");

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
  const resolvedVus = vusFromEnv !== undefined ? vusFromEnv : vus;

  if (stages || scenarioConfig.stages) {
    if (resolvedVus !== undefined) {
      throw new Error(
        `VUS override is not supported for staged profile "${scenarioKey}". Use a fixed-VU profile or provide custom stages.`,
      );
    }

    return {
      stages: stages || scenarioConfig.stages,
    };
  }

  return {
    vus: resolvedVus || scenarioConfig.vus || 1,
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
