import fs from "fs";
import fetch from "node-fetch";
import Papa from "papaparse";

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSU0jsVP81fqHSu4DcIUmrrDghvmjbK0SgD0lZfJt9ISPrZrgwP79FT3v2XliTZrjcQQAvDQZFTcIBR/pub?output=csv";

async function fetchSheetData() {
  const response = await fetch(SHEET_URL);
  const csvText = await response.text();
  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  });
  return parsed.data;
}

function selectRandomMenus(data) {
  return [...data].sort(() => Math.random() - 0.5).slice(0, 3);
}

function generateHTML(menus) {
  const cards = menus
    .map((row) => {
      const name = row["메뉴명"];
      const eng = row["영문명"];
      const thumb = row["썸네일링크"];
      const link = `./html_files/${eng}.html`;

      return `
        <div class="card">
          <a href="${link}" target="_blank">
            <img src="${thumb}" alt="${name}" />
            <h2>${name}</h2>
          </a>
        </div>
      `;
    })
    .join("\n");

  return `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8" />
      <title>오늘의 추천 메뉴</title>
      <style>
        body { font-family: sans-serif; padding: 20px; background: #f9f9f9; }
        .card {
          border: 1px solid #ccc;
          border-radius: 8px;
          padding: 10px;
          margin-bottom: 20px;
          background: #fff;
          text-align: center;
        }
        .card img {
          width: 100%;
          max-width: 300px;
          border-radius: 8px;
          margin-bottom: 10px;
        }
        .card a {
          text-decoration: none;
          color: inherit;
          display: block;
        }
        h2 {
          margin: 0;
          font-size: 20px;
        }
      </style>
    </head>
    <body>
      <h1>오늘의 추천 메뉴</h1>
      ${cards}
    </body>
    </html>
  `;
}

(async () => {
  try {
    const data = await fetchSheetData();
    const selectedMenus = selectRandomMenus(data);
    const html = generateHTML(selectedMenus);
    fs.writeFileSync("index.html", html, "utf-8");
    console.log("✅ index.html 생성 완료");
  } catch (err) {
    console.error("❌ 오류 발생:", err.message);
  }
})();
