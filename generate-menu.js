import fs from "fs";
import fetch from "node-fetch";
import Papa from "papaparse";

// ✅ 시트 이름: menu_data
const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1Gbjrg2d1orbmrYIR5FgMc2lEUVA-5yJuvXrmpeYzuOA/gviz/tq?tqx=out:csv&sheet=menu_data";

// 메뉴 카드 하나 만들기
function generateHTMLBlock(menu) {
  return `
    <div class="menu-block">
      <h2><a href="${menu['메뉴명']}.html">${menu['메뉴명']}</a></h2>
      <img src="${menu['썸네일링크']}" alt="${menu['메뉴명']}" style="max-width:300px;">
      <p><strong>주요 재료:</strong> ${menu['주요재료']}</p>
      ${
        menu['레시피영상링크'] && menu['레시피영상링크'].trim() !== '-'
          ? `<p><strong>레시피 영상:</strong> <a href="${menu['레시피영상링크']}" target="_blank">영상 보러가기</a></p>`
          : ''
      }
    </div>
  `;
}

// 전체 index.html 생성
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

    const allRows = parsed.data;

    // 유효한 메뉴만 필터링
    const menus = allRows.filter(m =>
      m['메뉴명'] && m['메뉴명'].trim() !== '-' &&
      m['썸네일링크'] && m['썸네일링크'].trim() !== '-' &&
      m['주요재료'] && m['주요재료'].trim() !== '-'
    );

    if (menus.length === 0) {
      const failHTML = `
        <!DOCTYPE html>
        <html lang="ko">
        <head><meta charset="UTF-8"><title>에러</title></head>
        <body>
          <h1>❌ 메뉴를 불러오지 못했습니다</h1>
          <p>Google Sheets에 유효한 메뉴가 없습니다.</p>
        </body>
        </html>
      `;
      fs.writeFileSync("index.html", failHTML);
      return;
    }

    // 3개 랜덤 선택
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
