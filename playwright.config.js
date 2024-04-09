module.exports = {
  projects: [
    {
      name: "Desktop Chrome",
      use: {
        browserName: "chromium",
        browserContext: "default",
        capabilities: {
          // إعدادات المتصفح
          "bstack:options": {
            os: "Windows",
            osVersion: "10",
            resolution: "1920x1080",
          },
        },
        // إعدادات BrowserStack
        grid: "https://hub-cloud.browserstack.com/wd/hub",
        browserstack: {
          username: "Ykazeichi_VRdLU0",
          accessKey: "Q6tVtzzG5LTsdPDgqxkr",
        },
      },
    },
    // إضافة المشروع الآخر هنا
  ],
};
