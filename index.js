const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
// const puppeteer = require("puppeteer");
const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");
const { Cluster } = require("puppeteer-cluster");

const app = express();

app.get("/mangas", async (req, res) => {
  try {
    const response = await axios.get("https://thunderscans.com/manga/?page=2");
    const html = response.data;
    const $ = cheerio.load(html);
    const dataList = [];

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
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    const mangaDetails = {};

    mangaDetails.title = $(".entry-title").text().trim();
    mangaDetails.alternativeTitles = $(".alternative .desktop-titles")
      .text()
      .trim();
    mangaDetails.rating = $(".numscore").text().trim();
    mangaDetails.status = $(".imptdt .status i").text().trim();
    mangaDetails.genres = [];

    $(".genres-container .mgen a").each((index, element) => {
      mangaDetails.genres.push($(element).text().trim());
    });

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
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    const chaptersList = [];

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
    console.log("Starting the scraping process...");
    const link = req.params.link;
    const url = `https://thunderscans.com/${link}/`;

    options = {
      headless: true,
      // executablePath: '/usr/bin/chromium-browser',
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-web-security",
        "--hide-scrollbars",
        "--font-render-hinting=none",
      ],
    };
    // browser = await puppeteer.launch({
    //   args: chromium.args,
    //   defaultViewport: chromium.defaultViewport,
    //   executablePath: await chromium.executablePath(),
    //   headless: chromium.headless,
    //   ignoreHTTPSErrors: true,
    // });

    const cluster = await Cluster.launch({
      concurrency: Cluster.CONCURRENCY_CONTEXT,
      maxConcurrency: 2, // تحديد عدد المتصفحات القابلة للاستخدام في نفس الوقت
    });
    // const page = await browser.newPage();
    // await page.goto(url);
    // await page.waitForSelector("#readerarea img.ts-main-image");

    await cluster.task(async ({ page, data: url }) => {
      await page.goto(url);
      await page.waitForSelector("#readerarea img.ts-main-image");
      const imageLinks = await page.$$eval(
        "#readerarea img.ts-main-image",
        (images) => images.map((img) => img.src)
      );
      res.json({ imageLinks });
    });

    const urls = [
      "https://thunderscans.com/my-younger-sister-was-a-genius-chapter-5/",
      "https://thunderscans.com/my-younger-sister-was-a-genius-chapter-5/",
      "https://thunderscans.com/my-younger-sister-was-a-genius-chapter-5/",
    ];

    // تشغيل المهام على الصفحات
    await Promise.all(urls.map((url) => cluster.queue(url)));

    // إيقاف العمليات
    await cluster.idle();
    await cluster.close();

    // res.json({ imageLinks });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Error" });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
