const Nightmare = require("nightmare");
const nightmare = new Nightmare({
  show: true,
  openDevTools: true,
  // webPreferences: {
  //   javascript: false
  // }
});

(async () => {
  console.log("Getting number of pages...");
  const numberOfPages = await nightmare.goto("http://www.airstreamclassifieds.com/ad-category/airstream-trailers-for-sale")
  .wait(".page-numbers")
  .evaluate(() =>
    +[...document.querySelectorAll("[class='page-numbers']")].reverse()[0].innerHTML
  )
  .end();
  console.log("Number of Pages:", numberOfPages);
  
  const urls = new Array(numberOfPages).fill("").map((url, index) => `http://www.airstreamclassifieds.com/ad-category/airstream-trailers-for-sale/page/${index + 1}`);
  
  console.log(`Scraping ${urls[0]}...`);
  const aggregatedPosts = await nightmare.goto("http://www.airstreamclassifieds.com/ad-category/airstream-trailers-for-sale/")
  .wait(3000)
  .evaluate(() => {
    console.log(`Evaluating ${urls[0]}`);
    try {
      console.log("fetch");
      return [...document.querySelectorAll(".post-block-out")].map(el => {
        const fullTitle = el.querySelector("h3 > a").innerHTML;
        const matches = fullTitle.match(/(\d{4})\s([\w\d\s]+)\s(\d{1,2})\s-\s(\w+)/);
        return {
          price: +(el.querySelector(".post-price").innerHTML.replace("$", "").replace(/,/g, "")),
          thumbnail: el.querySelector(".attachment-ad-thumb").getAttribute("src"),
          link: el.querySelector("h3 > a").getAttribute("href"),
          listedTS: el.querySelector(".clock > span").innerHTML,
          fullTitle,
          year: +matches[1],
          model: matches[2],
          length: +matches[3],
          state: matches[4]
        }
      })
    } catch (e) {
      console.log("Error fetching posts", e);
      process.exit(0);
    }
  })
  .end();
  
  console.log("AGG", aggregatedPosts);
  process.exit(0);
})();