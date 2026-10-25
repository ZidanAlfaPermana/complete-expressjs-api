// jest.integration.config.ts
import type { Config } from "jest";
import base from "./src/config/jest.config";

const config: Config = {
    ...base,
    testMatch: ["<rootDir>/tests/integration/**/*.test.ts"],
    setupFiles: ["<rootDir>/tests/integration/setup.ts"],
    coverageThreshold: undefined,
    testTimeout: 30000,
};

export default config;