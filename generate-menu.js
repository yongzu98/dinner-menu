import fs from "fs";
import fetch from "node-fetch";
import Papa from "papaparse";

// ✅ CSV export URL
const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSU0jsVP81fqHSu4DcIUmrrDghvmjbK0SgD0lZfJt9ISPrZrgwP79FT3v2XliTZrjcQQAvDQZFTcIBR/pub?output=csv";

// ✅ 1. 시트 데이터 불러오기
async function fetchSheetData() {
  const response = await fetch(SHEET_URL);
  const csvText = await response.text();
  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  return parsed.data;
}

// ✅ 2. 유효한 메뉴만 골라서 랜덤으로 3개 선택
function selectValidMenus(data) {
  // 필수 값이 모두 있는 행만 필터링
  const validMenus = data.filter((row) =>
    row["메뉴명"] && row["영문명"] && row["썸네일링크"]
  );

  if (validMenus.length < 3) {
    throw new Error("❌ 유효한 메뉴가 3개 미만입니다. 시트를 확인하세요.");
  }

  // 셔플 후 상위 3개 추출
  const shuffled = validMenus.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

// ✅ 3. HTML 생성 함수
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
      </style>
    </head>
    <body>
      <h1>오늘의 추천 메뉴</h1>
      ${cards}
    </body>
    </html>
  `;
}

// ✅ 4. 메인 실행
(async () => {
  try {
    const data = await fetchSheetData();
    console.log("📦 전체 메뉴 수:", data.length);

    const selectedMenus = selectValidMenus(data);
    console.log("✅ 선택된 메뉴:", selectedMenus.map((m) => m["메뉴명"]));

    const html = generateHTML(selectedMenus);
    fs.writeFileSync("index.html", html, "utf-8");

    console.log("✅ index.html 생성 완료!");
  } catch (err) {
    console.error("❌ 에러:", err.message);
  }
})();
