import fs from "fs";
import fetch from "node-fetch";
import Papa from "papaparse";

// ✅ CSV 주소 (공개된 Google Sheet CSV export 링크)
const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSU0jsVP81fqHSu4DcIUmrrDghvmjbK0SgD0lZfJt9ISPrZrgwP79FT3v2XliTZrjcQQAvDQZFTcIBR/pub?output=csv";

// ✅ 시트 데이터 불러오기
async function fetchSheetData() {
  const response = await fetch(SHEET_URL);
  const csvText = await response.text();
  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  });
  return parsed.data;
}

// ✅ 난이도 '하'가 최소 1개 포함되도록 3개 메뉴 선택
function selectMenusWithEasy(data) {
  const easyMenus = data.filter((row) => row["난이도"] === "하");
  if (easyMenus.length === 0) {
    throw new Error("⚠️ 난이도 '하' 메뉴가 없습니다.");
  }

  const maxAttempts = 100;
  for (let i = 0; i < maxAttempts; i++) {
    const shuffled = [...data].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 3);
    const hasEasy = selected.some((row) => row["난이도"] === "하");
    if (hasEasy) return selected;
  }

  throw new Error("⚠️ 조건을 만족하는 3개 메뉴를 찾을 수 없습니다.");
}

// ✅ HTML 템플릿 생성
function generateHTML(menus) {
  const cards = menus
    .map((row) => {
      const menuName = row["메뉴명"];
      const engName = row["영문명"];
      const videoLink = row["레시피영상링크"];
      const imageUrl = `images/${engName}.jpg`;

      const videoHTML =
        videoLink && videoLink !== "-"
          ? `<a href="${videoLink}" target="_blank">레시피 영상 보기</a>`
          : "";

      return `
        <div class="card">
          <img src="${imageUrl}" alt="${menuName}" />
          <h2>${menuName}</h2>
          ${videoHTML}
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
        .card { border: 1px solid #ccc; border-radius: 8px; padding: 10px; background: #fff; margin-bottom: 20px; }
        img { width: 100%; max-width: 300px; display: block; margin-bottom: 10px; }
        h2 { margin: 0 0 10px; }
        a { color: #007BFF; text-decoration: none; }
      </style>
    </head>
    <body>
      <h1>오늘의 추천 메뉴</h1>
      ${cards}
    </body>
    </html>
  `;
}

// ✅ 메인 실행 함수
(async () => {
  try {
    const data = await fetchSheetData();
    const selectedMenus = selectMenusWithEasy(data);
    const html = generateHTML(selectedMenus);
    fs.writeFileSync("index.html", html, "utf-8");
    console.log("✅ index.html 파일 생성 완료!");
  } catch (err) {
    console.error("❌ 오류 발생:", err.message);
  }
})();
