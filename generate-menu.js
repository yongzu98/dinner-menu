import fs from "fs";
import fetch from "node-fetch";
import Papa from "papaparse";

// 🔗 메뉴 데이터가 저장된 Google Sheets CSV 주소
const SHEET_URL = "https://docs.google.com/spreadsheets/d/1Gbjrg2d1orbmrYIR5FgMc2lEUVA-5yJuvXrmpeYzuOA/gviz/tq?tqx=out:csv&sheet=menu%20data";

function generateHTMLBlock(menu) {
  return `
    <div class="menu-block">
      <h2><a href="${menu['메뉴명']}.html">${menu['메뉴명']}</a></h2>
      <img src="${menu['이미지 URL']}" alt="${menu['메뉴명']}" style="max-width:300px;">
      <p><strong>재료:</strong> ${menu['재료']}</p>
      <p><strong>조리법:</strong> ${menu['레시피']}</p>
      ${menu['팁'] ? `<p><strong>팁:</strong> ${menu['팁']}</p>` : ""}
    </div>
  `;
}

function generateFinalHTML(innerBlocks) {
  const updateTime = new Date().toISOString();
  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>오늘의 저녁 메뉴</title>
  <style>
    body { font-family: sans-serif; max-width: 700px; margin: auto; padding: 1rem; }
    .menu-block { border-bottom: 1px solid #ccc; padding: 1rem 0; }
    img { display: block; margin-top: 0.5rem; }
  </style>
</head>
<body>
  <h1>오늘의 저녁 메뉴</h1>
  ${innerBlocks}
  <p style="color: #999; font-size: 0.9rem;">최종 업데이트: ${updateTime}</p>
</body>
</html>
  `;
}

async function run() {
  try {
    const res = await fetch(SHEET_URL);
    const csv = await res.text();
    const parsed = Papa.parse(csv, { header: true });
    const menus = parsed.data.filter(m => m['메뉴명'] && m['레시피']);

    const selected = menus.sort(() => 0.5 - Math.random()).slice(0, 3);
    const htmlBlocks = selected.map(generateHTMLBlock).join("\n");
    const finalHTML = generateFinalHTML(htmlBlocks);

    fs.writeFileSync("index.html", finalHTML, "utf-8");
    console.log("✅ index.html 생성 완료");
  } catch (err) {
    console.error("❌ 오류 발생:", err);
  }
}

run();
