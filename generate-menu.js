import fs from "fs";
import fetch from "node-fetch";
import Papa from "papaparse";

// 🔗 외부 리소스
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSU0jsVP81fqHSu4D6Ag_3oIwgj8DXwDHiBl4sXVuNBXAozbbC33h6ewyCu4IWkrzGoHJA2r45V_sji/pub?gid=1614121062&single=true&output=csv";
const HISTORY_FILE = "recent_recommendations.json";

// ✅ 데이터 로드
async function loadMenuData() {
  const res = await fetch(SHEET_URL);
  const csv = await res.text();
  const parsed = Papa.parse(csv, { header: true }).data;
  return parsed.filter(m =>
    m['메뉴명'] && m['영문명'] && m['주요재료'] && m['난이도']
  );
}

// ✅ 최근 추천 이력
function loadRecentHistory() {
  if (!fs.existsSync(HISTORY_FILE)) return [];
  return JSON.parse(fs.readFileSync(HISTORY_FILE, "utf-8")).slice(-3).flat();
}

function saveRecommendationHistory(menus) {
  const history = loadRecentHistory();
  history.push(menus.map(m => m['영문명']));
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history.slice(-3), null, 2));
}

// ✅ 최근 추천된 메뉴 제외
function applyFilters(menus) {
  const recent = loadRecentHistory();
  return menus.filter(m => !recent.includes(m['영문명']));
}

// ✅ 변경된 추천 로직: 무작위 3개 중 반드시 난이도 '하' 하나 포함
function selectMenus(menus) {
  const maxAttempts = 10;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const shuffled = menus.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    const hasEasy = selected.some(m => m['난이도'] === '하');

    if (hasEasy) {
      return selected;
    }
  }

  throw new Error("조건을 만족하는 메뉴를 찾을 수 없습니다. 메뉴 수를 확인해주세요.");
}

// ✅ HTML 생성
function generateHTMLBlock(menu) {
  const link = `html_files/${menu['영문명']}.html`;
  const img = `images/${menu['영문명']}.jpg`;

  return `
    <div class="menu-block">
      <h2><a href="${link}" target="_blank">${menu['메뉴명']}</a></h2>
      <a href="${link}" target="_blank">
        <img src="${img}" alt="${menu['메뉴명']}" style="max-width:300px;">
      </a>
      <p><strong>주요 재료:</strong> ${menu['주요재료']}</p>
    </div>
  `;
}

function generateFinalHTML(blocks) {
  const updateTime = new Date().toISOString();
  return `
<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"><title>오늘의 저녁 메뉴</title>
<style>
body { font-family: sans-serif; max-width: 700px; margin: auto; padding: 1rem; }
.menu-block { border-bottom: 1px solid #ccc; padding: 1rem 0; }
img { display: block; margin-top: 0.5rem; }
</style></head>
<body>
  <h1>오늘의 저녁 메뉴</h1>
  ${blocks}
  <p style="color: #999; font-size: 0.9rem;">최종 업데이트: ${updateTime}</p>
</body></html>`;
}

async function generateAndSaveHTML(menus) {
  const blocks = menus.map(generateHTMLBlock).join("\n");
  const html = generateFinalHTML(blocks);
  fs.writeFileSync("index.html", html, "utf-8");
}

async function run() {
  try {
    const menus = await loadMenuData();
    const filtered = applyFilters(menus);
    const selected = selectMenus(filtered); // 🔁 이 부분만 교체됨
    await generateAndSaveHTML(selected);
    saveRecommendationHistory(selected);
    console.log("🎉 index.html 생성 완료!");
  } catch (err) {
    console.error("❌ 오류 발생:", err);
  }
}

run();
