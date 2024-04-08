const express = require("express");
const { chromium } = require("playwright");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();

app.get("/mangas/:page", async (req, res) => {
  try {
    const link = req.params.page;
    const url = `https://thunderscans.com/manga/?page=${link}/`;
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    const mangaTitles = {};

    // استخراج العنوان
    mangaTitles.title = $(".tt").text().trim();

    // استخراج العنوان البديل
    // mangaTitles.alternativeTitles = $(".alternative .desktop-titles")
    // .text()
    // .trim();

    // استخراج التقييم
    // mangaTitles.rating = $(".numscore").text().trim();

    // استخراج حالة العمل
    // mangaTitles.status = $(".imptdt .status i").text().trim();
    res.json(mangaTitles);

    // const browser = await chromium.launch();
    // const page = await browser.newPage();
    // await page.goto("https://thunderscans.com/manga/?page=2");

    // const data = await page.evaluate(() => {
    //   const dataList = [];
    //   const items = document.querySelectorAll(".listupd .bs");

    //   items.forEach((item) => {
    //     const title = item.querySelector(".tt").innerText;
    //     const image = item.querySelector(".ts-post-image").getAttribute("src");
    //     const link = item
    //       .querySelector("a")
    //       .getAttribute("href")
    //       .substring(31)
    //       .replace("/", "");
    //     // const linkParts = link.split("/");
    //     const rating = item.querySelector(".numscore").innerText;
    //     const status = item.querySelector(".status i").innerText;
    //     // const linkText = linkParts[linkParts.length - 1];

    //     dataList.push({ title, image, rating, status, link });
    //   });

    //   return dataList;
    // });

    // await browser.close();

    // res.json(data);
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
    const link = req.params.link;

    const url = `https://thunderscans.com/${link}/`;

    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(url);

    // انتظر حتى يتم تحميل الصور
    await page.waitForSelector(".ts-main-image", { timeout: 800000 });
    console.log("Title : " + page.title);

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
    res.status(500).json({ error: "Internal Server Error" });
  }
});
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
