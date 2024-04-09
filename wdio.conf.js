exports.config = {
  // ... الإعدادات الأخرى لـ WebDriverIO

  services: ["browserstack"],
  user: process.env.BROWSERSTACK_USERNAME || "Ykazeichi_VRdLU0",
  key: process.env.BROWSERSTACK_ACCESS_KEY || "Q6tVtzzG5LTsdPDgqxkr",

  capabilities: [
    {
      browserName: "chrome",
      os: "Windows",
      os_version: "10",
      resolution: "1920x1080",
      "browserstack.selenium_version": "3.141.59",
    },
  ],

  // ... الإعدادات الأخرى لـ WebDriverIO
};
