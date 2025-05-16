import fs from "fs";
import fetch from "node-fetch";
import Papa from "papaparse";

// ✅ CSV 주소
const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSU0jsVP81fqHSu4DcIUmrrDghvmjbK0SgD0lZfJt9ISPrZrgwP79FT3v2XliTZrjcQQAvDQZFTcIBR/pub?output=csv";

// ✅ Google Sheet 데이터 불러오기
async function fetchSheetData() {
  const response = await fetch(SHEET_URL);
  const csvText = await response.text();
  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  });
  return parsed.data;
}

// ✅ 조건 없이 랜덤 3개 선택
function selectRandomMenus(data) {
  return [...data].sort(() => Math.random() - 0.5).slice(0, 3);
}

// ✅ index.html 생성
function generateHTML(menus) {
  const cards = menus
    .map((row) => {
      const name = row["메뉴명"];
      const eng = row["영문명"];
      const thumb = row["썸네일링크"];
      const category = row["소분류"];
      const link = `./html_files/${eng}.html`;

      return `
        <div class="card">
          <a href="${link}" target="_blank">
            <img src="${thumb}" alt="${name}" />
            <h2>${name}</h2>
            <p>#${category}</p>
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
        h1 { margin-bottom: 30px; }
        .card {
          border: 1px solid #ddd;
          border-radius: 12px;
          padding: 16px;
          background: #fff;
          margin-bottom: 20px;
          text-align: center;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }
        .card img {
          width: 100%;
          max-width: 300px;
          border-radius: 12px;
          margin-bottom: 10px;
        }
        .card a {
          text-decoration: none;
          color: inherit;
          display: block;
        }
        h2 {
          margin: 0;
          font-size: 22px;
        }
        p {
          margin-top: 8px;
          font-size: 14px;
          color: #777;
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

// ✅ 실행
(async () => {
  try {
    const data = await fetchSheetData();
    const selectedMenus = selectRandomMenus(data);
    const html = generateHTML(selectedMenus);
    fs.writeFileSync("index.html", html, "utf-8");
    console.log("✅ index.html 생성 완료 (무작위 3개 메뉴)");
  } catch (err) {
    console.error("❌ 오류 발생:", err.message);
  }
})();
