# Binance WebSocket & API Performance Testing Framework

🚧 Work in Progress 🚧

This project is currently under active development and is not yet ready for production use.

## Status
 
- Core functionality is being implemented
- Features may change without notice
- Documentation is incomplete

## About the Project

This project was created to demonstrate a modern approach to complex performance testing in a containerized environment. As performance testers, we often face the challenge of creating a testing infrastructure that is scalable, repeatable, and easily integrable into CI/CD pipelines. That's why I decided to create this framework, which combines the power of k6 with the flexibility of Docker containers.

The framework tests real Binance API - specifically REST endpoints and WebSocket streams. I chose Binance intentionally because it provides a publicly available API with predictable behavior, which is ideal for demonstration purposes. The project shows how to properly structure performance tests, how to centralize configuration, and how to set thresholds based on real metrics.

### Technical Specifications

| Technology | Purpose |
|------------|---------|
| **k6** | Performance testing engine |
| **Node.js + Webpack** | Build toolchain for bundling tests |
| **Docker** | Containerization of testing environment |
| **GitHub Actions** | CI/CD pipeline with matrix strategy |

---

## Project Architecture

The project architecture is designed with emphasis on separation of concerns and centralization of configuration. Tests are divided into two main categories - API tests for REST endpoints and WebSocket tests for real-time streams. Each category has its specific metrics and thresholds, but they share a common configuration layer.

Centralized configuration is the heart of the entire framework. All metrics, scenarios, and environment settings are stored in JSON files in the `config/` directory. This means that if I need to change a threshold for response time, I do it in one place and the change automatically reflects in all tests.

```
┌─────────────────────────────────────────────────────────────────┐
│                        CI/CD Pipeline                            │
│                   (GitHub Actions + Docker)                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Docker Container                            │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                     k6 Runtime                             │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│         ┌────────────────────┼────────────────────┐             │
│         ▼                    ▼                    ▼             │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐       │
│  │  WS Tests   │     │  API Tests  │     │   Config    │       │
│  │ - aggTrade  │     │ - smoke     │     │ - metrics   │       │
│  │ - depth     │     │ - load      │     │ - scenarios │       │
│  │ - ticker    │     │             │     │ - envs      │       │
│  │ - kline     │     │             │     │             │       │
│  └─────────────┘     └─────────────┘     └─────────────┘       │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
      ┌─────────────┐                 ┌─────────────┐
      │  Production │                 │   Testnet   │
      │   Binance   │                 │   Binance   │
      └─────────────┘                 └─────────────┘
```

### Directory Structure

```
binance-websocket-k6-tests/
├── config/
│   ├── envs.json          # Environment configuration (URLs, timeouts)
│   ├── metrics.json       # Thresholds and metrics per environment
│   ├── scenarios.json     # Test scenarios (smoke, load, stress...)
│   └── index.js           # Config loader and helper functions
├── tests/
│   ├── api/               # REST API tests
│   │   ├── restMarketSmoke.test.js
│   │   └── restMarketLoad.test.js
│   └── ws/                # WebSocket tests
│       ├── aggTradeTest.test.js
│       ├── depthTest.test.js
│       ├── klineTest.test.js
│       └── tickerTest.test.js
├── utils/                 # Helper functions
├── .github/workflows/     # CI/CD pipelines
├── Dockerfile             # Multi-stage build
└── docker-compose.yml     # Local execution
```

### Supported Environments

| Environment | Description | Usage |
|-------------|-------------|-------|
| `production` | Real Binance API | Default, stricter thresholds |
| `testnet` | Binance Testnet | Development, more lenient thresholds |

---

## Quick Start Guide

This section will guide you from zero to running your first test. I assume you have basic knowledge of Node.js and Docker. If not, don't worry - the commands are simple and well documented. The entire setup should take you no more than 5 minutes.

### Prerequisites

- Node.js 20+ (LTS version recommended)
- k6 installed locally (for direct execution)
- Docker and Docker Compose (for containerized execution)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd binance-websocket-k6-tests

# Install dependencies
npm ci

# Build tests (webpack bundle)
npm run bundle
```

### Running via k6 (directly)

```bash
# Smoke tests - all
npm run test:smoke

# Individual tests
npm run test:aggTrade
npm run test:depth

# With custom parameters
k6 run --env ENV=production --env PROFILE=smoke dist/aggTradeTest.test.js
```

### Running via Docker Compose (locally)

```bash
# Build Docker image
docker-compose build

# Smoke tests
docker-compose run k6-smoke

# Load tests
docker-compose run k6-load

# Stress tests
docker-compose run k6-stress

# Testnet environment
docker-compose run k6-testnet
```

### Verifying Successful Execution

After running a test, you should see output similar to this:

```
     ✓ WebSocket status is 101
     ✓ event type
     ✓ symbol
     ✓ price

     checks.........................: 100.00% ✓ 48  ✗ 0
     ws_connecting..................: avg=245ms min=230ms max=280ms
     ws_msgs_received...............: 12      1.2/s
```

---

## Test Types and Metrics Configuration

As a senior performance tester, I know that proper metric setup is critical for successful testing. It's not enough to just run a test and hope everything will be fine. We need to know what is acceptable and what is not. That's why I implemented a centralized metrics system in this project, which can be easily adapted to different environments and requirements.

### Test Types

| Test Type | Purpose | Scenario |
|-----------|---------|----------|
| **Smoke** | Quick validation of basic functionality | 3 VUs, 10 seconds |
| **Load** | Testing under expected load | Ramp-up to 30 VUs, 2 minutes |
| **Stress** | Finding the breaking point | Ramp-up to 60 VUs, 3 minutes |
| **Spike** | Testing sudden traffic spikes | Jump to 240 VUs, 1 minute |
| **Soak** | Long-term stability | 25 VUs, 12 minutes |

### Where Configurations Are Stored

```
config/
├── scenarios.json    # VUs and stages definitions for each test type
├── metrics.json      # Thresholds divided by environment (production/testnet)
└── envs.json         # URLs and timeouts for each environment
```

### Scenario Configuration Example (`scenarios.json`)

```json
{
  "load": {
    "description": "Load test",
    "stages": [
      { "duration": "10s", "target": 5 },
      { "duration": "30s", "target": 30 },
      { "duration": "1m", "target": 30 },
      { "duration": "10s", "target": 0 }
    ]
  }
}
```

### Metrics Configuration Example (`metrics.json`)

```json
{
  "production": {
    "api": {
      "checksRate": 0.99,
      "failedRate": 0.01,
      "httpReqDuration": {
        "p50": 500,
        "p95": 1500,
        "p99": 3000
      },
      "endpoints": {
        "ping": { "p50": 300, "p95": 600, "p99": 1000, "maxErrors": 5 }
      }
    }
  }
}
```

### How to Derive Proper Metrics - Senior Performance Tester's Approach

Setting proper thresholds is not random. It's a process that requires understanding the system, its SLA, and user expectations. Here is my proven approach:

**1. Baseline Testing**
First, I run a series of smoke tests without thresholds to find out how the system actually behaves. I observe p50, p95, and p99 percentiles of response times.

**2. SLA Analysis**
If an SLA (Service Level Agreement) exists, I use it as the basis. For example, if the SLA states "99% of requests under 2 seconds", I set `p99 < 2000ms`.

**3. The 1.5x Rule**
For thresholds, I typically use the 1.5x rule from baseline. If baseline p95 is 400ms, I set the threshold at 600ms. This gives room for normal variations.

**4. Environment-Specific Values**
Production has stricter thresholds than testnet. Testnet may have higher latency due to shared infrastructure.

**5. Iterative Refinement**
After initial tests, I adjust values based on actual results. If the test consistently passes with a large margin, I tighten the threshold.

```
Baseline p95: 400ms
     ↓
SLA requirement: 99% < 1000ms
     ↓
Initial threshold: p95 < 600ms (1.5x baseline)
     ↓
After testing: p95 < 500ms (refined)
```

---

## CI/CD and Containerization

The entire CI/CD infrastructure is built on the principle of "what runs locally, runs in the pipeline". This means that tests in GitHub Actions run in the same Docker container as locally. This eliminates "works on my machine" problems and ensures consistent results.

The pipeline uses matrix strategy, which means each test runs in a separate job in parallel. This significantly reduces run time and allows better problem isolation. If one test fails, others continue (thanks to `fail-fast: false`).

### Where Configuration Is Located

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage build (Node.js builder → k6 runtime) |
| `docker-compose.yml` | Local execution of different test types |
| `.github/workflows/pr-check.yml` | Smoke tests on push/PR to main |
| `.github/workflows/load-test.yml` | Load tests on-demand |
| `.github/workflows/stress-test.yml` | Stress tests on-demand |
| `.github/workflows/spike-test.yml` | Spike tests on-demand |
| `.github/workflows/soak-test.yml` | Soak tests on-demand |

### Dockerfile - Multi-stage Build

```dockerfile
# Stage 1: Build
FROM node:22-alpine AS builder
# npm ci + webpack bundle

# Stage 2: Runtime
FROM grafana/k6:latest
# Only k6 + bundled tests (~50MB)
```

Benefits of multi-stage build:
- Small final image (only k6, no Node.js)
- Faster startup in CI
- Smaller attack surface

### GitHub Actions - Matrix Strategy

```yaml
jobs:
  load-test:
    strategy:
      fail-fast: false
      matrix:
        test: [aggTradeTest, depthTest, tickerTest, klineTest, restMarketLoad]
    steps:
      - name: Run k6 test
        run: docker run k6-tests dist/${{ matrix.test }}.test.js
```

### Workflow Triggers

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| PR Check | Push/PR to main | Automatic smoke tests |
| Load/Stress/Spike/Soak | `workflow_dispatch` | Manual execution with environment selection |

### Running On-Demand Workflow

1. Go to the **Actions** tab in GitHub
2. Select the desired workflow (e.g., "Load Tests")
3. Click **Run workflow**
4. Select environment (production/testnet)
5. Optionally enter number of VUs
6. Execute

---

## Conclusion

This project demonstrates a comprehensive approach to performance testing that combines modern tools and proven practices. I have shown how to create a scalable testing infrastructure that is:

- **Centralized** - all configurations in one place
- **Containerized** - consistent environment locally and in CI
- **Automated** - smoke tests on every PR, on-demand tests for load/stress
- **Flexible** - support for multiple environments and test types
- **Professional** - thresholds derived from real metrics and SLA

The framework is ready for extension - whether with new test types, integration with monitoring tools (Grafana, InfluxDB), or deployment to Kubernetes with k6-operator for distributed testing.

---

## License

MIT License - see [LICENSE](LICENSE)
