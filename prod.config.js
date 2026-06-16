const { defineConfig } = require("cypress");
const commonConfigs = require('./cypress.config')

module.exports = defineConfig({
    ...commonConfigs,

    e2e: {
        ...commonConfigs.e2e,

        baseUrl: "http://localhost:5173/",
        ApiBaseUrl: "http://localhost:5173/",
        environment: "prod",
    }
});

