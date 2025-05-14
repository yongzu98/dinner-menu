import fs from "fs";
import fetch from "node-fetch";
import Papa from "papaparse";

// ✅ 시트 URL (CSV 형식)
const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSU0jsVP81fqHSu4D6Ag_3oIwgj8DXwDHiBl4sXVuNBXAozbbC33h6ewyCu4IWkrzGoHJA2r45V_sji/pub?gid=1614121062&single=true&output=csv";

// ✅ 메뉴 카드 하나 생성
function generateHTMLBlock(menu) {
  const link = `html_files/${menu['영문명']}.html`;
  return `
    <div class="menu-block">
      <h2><a href="${link}" target="_blank">${menu['메뉴명']}</a></h2>
      <p><strong>주요 재료:</strong> ${menu['주요재료']}</p>
      <p><strong>난이도:</strong> ${menu['난이도']}</p>
    </div>
  `;
}

// ✅ 전체 index.html 생성
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

// ✅ 실행 함수
async function run() {
  try {
    const res = await fetch(SHEET_URL);
    const csv = await res.text();
    const parsed = Papa.parse(csv, { header: true });

    const allRows = parsed.data;
    console.log("📊 전체 행 수:", allRows.length);

    // 유효한 행 필터링
    const menus = allRows.filter(m =>
      m['메뉴명'] &&
      m['영문명'] &&
      m['주요재료'] &&
      m['난이도']
    );

    console.log("✅ 유효한 메뉴 수:", menus.length);

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

    // ✅ 난이도 '하' 메뉴를 최소 1개 포함하도록 3개 선택
    let selected = [];
    let attempts = 0;
    while (attempts < 10) {
      const shuffled = menus.sort(() => 0.5 - Math.random());
      const candidates = shuffled.slice(0, 3);
      if (candidates.some(m => m['난이도'].trim() === '하')) {
        selected = candidates;
        break;
      }
      attempts++;
    }

    // 실패 시 가장 쉬운 메뉴 1개 + 나머지 2개 랜덤
    if (selected.length === 0) {
      const easy = menus.filter(m => m['난이도'].trim() === '하');
      const rest = menus.filter(m => m['난이도'].trim() !== '하');
      if (easy.length > 0 && rest.length > 1) {
        const easyPick = easy[Math.floor(Math.random() * easy.length)];
        const restPicks = rest.sort(() => 0.5 - Math.random()).slice(0, 2);
        selected = [easyPick, ...restPicks];
      } else {
        selected = menus.sort(() => 0.5 - Math.random()).slice(0, 3); // fallback
      }
    }

    const htmlBlocks = selected.map(generateHTMLBlock).join("\n");
    const finalHTML = generateFinalHTML(htmlBlocks);

    fs.writeFileSync("index.html", finalHTML, "utf-8");
    console.log("🎉 index.html 생성 완료!");
  } catch (err) {
    console.error("❌ 오류 발생:", err);
  }
}

run();
