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

// ✅ 최근 추천 제외 필터
function applyFilters(menus) {
  const recent = loadRecentHistory();
  return menus.filter(m => !recent.includes(m['영문명']));
}

// ✅ 새로운 추천 로직: 난이도 '하' 포함 보장 + 중복 제거
function selectMenus(menus) {
  const easyMenus = menus.filter(m => m['난이도'] === '하');
  if (easyMenus.length === 0) {
    throw new Error("난이도 '하' 메뉴가 없습니다.");
  }

  const selected = [];

  // 1. '하' 난이도 1개 무조건 선택
  const easy = easyMenus[Math.floor(Math.random() * easyMenus.length)];
  selected.push(easy);

  // 2. 전체에서 easy 제외한 후 나머지 2개 무작위 선택
  const remaining = menus.filter(m => m['영문명'] !== easy['영문명']);
  const shuffled = remaining.sort(() => 0.5 - Math.random());
  selected.push(...shuffled.slice(0, 2));

  return selected;
}

// ✅ HTML 블록 생성
function generateHTMLBlock(menu) {
  if (!menu || !menu['메뉴명'] || !menu['영문명']) return '';

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

// ✅ index.html 생성 및 저장
async function generateAndSaveHTML(menus) {
  const validMenus
