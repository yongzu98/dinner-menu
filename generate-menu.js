import fs from "fs";
import fetch from "node-fetch";
import Papa from "papaparse";

// ✅ CSV export URL (공유 상태는 "링크 있는 모든 사용자 보기")
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

// ✅ 난이도 '하' 포함 3개 랜덤 선택
function selectMenusWithEasy(data) {
  const maxTries = 100;
  for (let i = 0; i < maxTries; i++) {
    const shuffled = [...data].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 3);
    const hasEasy = selected.some((row) => row["난이도"] === "하");
    if (hasEasy) return selected;
  }
  throw new Error("난이도 '하'가 포함된 3개 메뉴를 찾을 수 없습니다.");
}

// ✅ index.html 생성
function generateHTML(menus) {
  const cards = menus
    .map((row) => {
      const name = row["메뉴명"];
      const eng = row["영문명"];
      const thumb = row["썸네일링크"];
      const category = row["소분류"]; // 재료가 없는 상태에선 대체 정보로 활용
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

// ✅ 메인 실행
(async () => {
  try {
    const data = await fetchSheetData();
    const selectedMenus = selectMenusWithEasy(data);
    const html = generateHTML(selectedMenus);
    fs.writeFileSync("index.html", html, "utf-8");
    console.log("✅ index.html 생성 완료 (메뉴 + 이미지 + 링크 포함)");
  } catch (err) {
    console.error("❌ 오류 발생:", err.message);
  }
})();
