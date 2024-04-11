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
    const response = await axios.get("https://lekmanga.net/manga/page/2");
    const html = response.data;
    const $ = cheerio.load(html);
    const dataList = [];

    $(".tab-content-wrap .page-item-detail.manga").each((index, element) => {
      const title = $(element).find(".h5").text().trim().replace("\t\t\t", "");
      const image = $(element).find(".img-responsive").attr("src");
      const link = $(element)
        .find("a")
        .attr("href")
        .substring(27)
        .replace("/", "");
      const rating = $(element).find(".chapter.font-meta").text();
      const status = $(element).find(".chapter.font-meta").text();

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

app.get("/images/:link/:page", async (req, res) => {
  try {
    const link = req.params.link;
    const page = req.params.page;
    const url = `https://lekmanga.net/manga/${link}/${page}`;
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const imageLinks = $(".reading-content img.wp-manga-chapter-img")
      .map((_, img) => $(img).attr("src"))
      .get();

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
