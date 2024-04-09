module.exports = {
  projects: [
    {
      name: "Desktop Chrome",
      use: {
        browserName: "chromium",
        browserContext: "default",
        // إعدادات BrowserStack
        grid: "https://hub-cloud.browserstack.com/wd/hub",
        browserstack: {
          username: "Ykazeichi_VRdLU0",
          accessKey: "Q6tVtzzG5LTsdPDgqxkr",
        },
      },
    },
    {
      name: "Desktop Firefox",
      use: {
        browserName: "firefox",
        browserContext: "default",
        // إعدادات BrowserStack
        grid: "https://hub-cloud.browserstack.com/wd/hub",
        browserstack: {
          username: "Ykazeichi_VRdLU0",
          accessKey: "Q6tVtzzG5LTsdPDgqxkr",
        },
      },
    },
  ],
};
