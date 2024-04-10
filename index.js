const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const { remote } = require("webdriverio");
const webdriverio = require("webdriverio");

const app = express();

app.get("/mangas", async (req, res) => {
  try {
    const response = await axios.get("https://lekmanga.net/manga/");
    const html = response.data;
    const $ = cheerio.load(html);
    const dataList = [];

    $(".page-content-listing.item-default .col-12 col-md-6.badge-pos-1").each(
      (index, element) => {
        const title = $(element).find("h3 .h5").text().trim();
        // const image = $(element).find(".img-responsive").attr("src");
        // const link = $(element)
        // .find("a")
        // .attr("href")
        // .substring(31)
        // .replace("/", "");
        // const rating = $(element).find(".chapter.font-meta").text();
        // const status = $(element).find(".chapter.font-meta").text();
        // , image, rating, status, link
        dataList.push({ title });
      }
    );

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
    const browserstackBrowser = await remote({
      capabilities: {
        "browserstack.user": "Ykazeichi_VRdLU0",
        "browserstack.key": "Q6tVtzzG5LTsdPDgqxkr",
        browserName: "chrome",
        browser: "chrome",
      },
    });

    const link = req.params.link;
    const url = `https://thunderscans.com/${link}/`;
    const page = await browserstackBrowser.newPage();
    await page.goto(url);
    console.log("Title : " + url + " is loaded" + "\n");

    await page.waitForSelector(".ts-main-image", { timeout: 800000 });

    const imageLinks = await page.$$eval(
      "#readerarea img.ts-main-image",
      (images) => images.map((img) => img.src)
    );

    await browserstackBrowser.deleteSession();

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
