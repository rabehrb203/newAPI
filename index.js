const express = require("express");
const { chromium } = require("playwright");
const axios = require("axios");
const cheerio = require("cheerio");
const browserPath = process.env.BROWSER_PATH || "./browsers/chromium";
const { PlaywrightTestConfig } = require("@playwright/test");
const { devices } = require("playwright");

const app = express();

app.get("/mangas", async (req, res) => {
  try {
    // جلب محتوى صفحة العناوين باستخدام Axios
    const response = await axios.get("https://thunderscans.com/manga/?page=2");
    const html = response.data;

    // استخراج المعلومات باستخدام Cheerio
    const $ = cheerio.load(html);
    const dataList = [];

    // استخراج العناوين والصور والروابط والتقييم وحالة العمل
    $(".listupd .bs").each((index, element) => {
      const title = $(element).find(".tt").text().trim().replace("\t\t\t", "");
      const image = $(element).find(".ts-post-image").attr("src");
      const link = $(element)
        .find("a")
        .attr("href")
        .substring(31)
        .replace("/", "");
      const rating = $(element).find(".numscore").text();
      const status = $(element).find(".status i").text();

      dataList.push({ title, image, rating, status, link });
    });

    res.json(dataList);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get("/details/:link", async (req, res) => {
  try {
    const link = req.params.link;
    const url = `https://thunderscans.com/manga/${link}/`;

    // جلب محتوى صفحة التفاصيل
    const response = await axios.get(url);
    const html = response.data;

    // استخراج المعلومات باستخدام Cheerio
    const $ = cheerio.load(html);

    const mangaDetails = {};

    // استخراج العنوان
    mangaDetails.title = $(".entry-title").text().trim();

    // استخراج العنوان البديل
    mangaDetails.alternativeTitles = $(".alternative .desktop-titles")
      .text()
      .trim();

    // استخراج التقييم
    mangaDetails.rating = $(".numscore").text().trim();

    // استخراج حالة العمل
    mangaDetails.status = $(".imptdt .status i").text().trim();

    // استخراج الأنواع
    mangaDetails.genres = [];
    $(".genres-container .mgen a").each((index, element) => {
      mangaDetails.genres.push($(element).text().trim());
    });

    // استخراج الملخص
    mangaDetails.summary = $(".summary .entry-content p").text().trim();

    res.json(mangaDetails);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get("/chapters/:link", async (req, res) => {
  try {
    const link = req.params.link;
    const url = `https://thunderscans.com/manga/${link}/`;

    // جلب محتوى صفحة الفصول
    const response = await axios.get(url);
    const html = response.data;

    // استخراج المعلومات باستخدام Cheerio
    const $ = cheerio.load(html);

    const chaptersList = [];

    // العثور على عناصر الفصول واستخراج المعلومات
    $(".eplister ul li").each((index, element) => {
      const chapterNum = $(element)
        .find(".chapternum")
        .text()
        .trim()
        .replace("الفصل\t\t\t\t\t\t\t", "");

      const chapterLink = $(element)
        .find("a")
        .attr("href")
        .substring(25)
        .replace("/", "");
      const chapterDate = $(element).find(".chapterdate").text().trim();

      chaptersList.push({
        chapterNum,
        chapterDate,
        chapterLink,
      });
    });

    res.json(chaptersList);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/images/:link", async (req, res) => {
  try {
    const browserstackBrowser = await remote({
      browserName: "firefox",
      browserContext: "default",
      gridURL: "https://hub-cloud.browserstack.com/wd/hub",
      browserstack: {
        username: "Ykazeichi_VRdLU0",
        accessKey: "Q6tVtzzG5LTsdPDgqxkr",
      },
    });
    const link = req.params.link;

    const url = `https://thunderscans.com/${link}/`;

    const browser = await chromium.launch();

    const page = await browserstackBrowser.newPage();
    await page.goto(url);
    console.log("Title : " + url + " is loaded" + "\n");

    // انتظر حتى يتم تحميل الصور
    await page.waitForSelector(".ts-main-image", { timeout: 800000 });

    // استخراج روابط الصور
    const imageLinks = await page.$$eval(
      "#readerarea img.ts-main-image",
      (images) => images.map((img) => img.src)
    );

    console.log("روابط الصور:", imageLinks);

    await browser.close();

    res.json({ imageLinks });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Error" });
  }
});
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
