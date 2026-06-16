const { defineConfig } = require("cypress");
const commonConfigs = require('./cypress.config')

module.exports = defineConfig({
    ...commonConfigs,

    e2e: {
        ...commonConfigs.e2e,

        baseUrl: "http://localhost:5173/", // https://www.qa.saucedemo.com/ in real projects
        ApiBaseUrl: "http://localhost:5173/",
        environment: "qa",
    }
});

