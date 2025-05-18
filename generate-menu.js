import fs from "fs";
import fetch from "node-fetch";
import Papa from "papaparse";

// ✅ Google Sheets CSV 링크 (공유 설정: 누구나 보기)
const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1Gbjrg2d1orbmrYIR5FgMc2lEUVA-5yJuvXrmpeYzuOA/gviz/tq?tqx=out:csv";
const PREV_FILE = "prev.json";

// ✅ 배열에서 랜덤으로 N개 추출
function getRandomItems(arr, count) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

(async () => {
  try {
    // 📡 Step 1: CSV 요청
    console.log("📡 CSV 데이터 요청 중...");
    const res = await fetch(SHEET_URL);
    if (!res.ok) throw new Error(`📛 CSV 요청 실패: ${res.statusText}`);
    const csv = await res.text();

    // 📊 Step 2: 파싱 및 컬럼 키 정리
    console.log("📊 CSV 데이터 파싱 중...");
    const { data: rawData, errors } = Papa.parse(csv, { header: true });
    if (errors.length > 0) {
      console.error("❌ CSV 파싱 오류 발생:", errors);
      return;
    }

    // 열 이름 공백 제거 (ex: " 영문명 " → "영문명")
    const data = rawData.map(row => {
      const cleaned = {};
      for (const key in row) {
        cleaned[key.trim()] = row[key]?.trim(); // 값도 trim 처리
      }
      return cleaned;
    });

    // ✅ Step 3: 유효한 메뉴 필터링
    const validMenus = data.filter(
      (item) => item["영문명"] && item["난이도"] && item["영문명"] !== "-"
    );

    if (validMenus.length < 3) {
      console.error("❌ 유효한 메뉴가 3개 미만입니다. 데이터 시트를 확인해주세요.");
      return;
    }

    // ✅ Step 4: 전날 추천 메뉴 불러오기
    let prevMenus = [];
    if (fs.existsSync(PREV_FILE)) {
      try {
        prevMenus = JSON.parse(fs.readFileSync(PREV_FILE, "utf8"));
      } catch (e) {
        console.warn("⚠️ 이전 prev.json 파싱 실패. 무시하고 진행.");
      }
    }

    // ✅ Step 5: 오늘의 메뉴 선택
    let todaysMenus = [];
    let tries = 0;
    while (tries++ < 100) {
      const candidates = getRandomItems(validMenus, 3);
      const hasEasy = candidates.some((item) => item["난이도"] === "하");
      const noOverlap = candidates.every((item) => !prevMenus.includes(item["영문명"]));
      if (hasEasy && noOverlap) {
        todaysMenus = candidates;
        break;
      }
    }

    if (todaysMenus.length < 3) {
      console.error("❌ 조건을 만족하는 메뉴를 찾지 못했습니다. 메뉴 수가 부족하거나 중복 조건이 과도할 수 있습니다.");
      return;
    }

    // ✅ Step 6: prev.json 저장
    fs.writeFileSync(PREV_FILE, JSON.stringify(todaysMenus.map((m) => m["영문명"])), "utf8");

    // ✅ Step 7: index.html 생성
    console.log("🛠 index.html 생성 중...");
    const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>오늘의 추천 메뉴</title>
  <style>
    body { font-family: sans-serif; text-align: center; padding: 20px; }
    .menu { margin-bottom: 40px; }
    img { width: 300px; border-radius: 12px; cursor: pointer; }
    h2, p { margin: 10px 0; }
  </style>
  <script src="track-click.js"></script>
</head>
<body>
  <h1>🍽 오늘의 추천 메뉴</h1>
  ${todaysMenus
    .map((menu) => {
      const { 메뉴명, 영문명, 레시피영상링크, 난이도 } = menu;
      const imgSrc = `images/${영문명}.jpg`;
      const desc = `난이도: ${난이도}` + (레시피영상링크 && 레시피영상링크 !== "-" ? ` | 🎥 영상 있음` : "");
      return `
      <div class="menu">
        <a href="html_files/${영문명}.html" target="_blank" onclick="trackClick('${영문명}')">
          <img src="${imgSrc}" alt="${메뉴명}">
        </a>
        <h2><a href="html_files/${영문명}.html" target="_blank" onclick="trackClick('${영문명}')">${메뉴명}</a></h2>
        <p>${desc}</p>
      </div>`;
    })
    .join("\n")}
</body>
</html>`;

    fs.writeFileSync("index.html", html.trim(), "utf8");
    console.log("✅ index.html 생성 완료!");

  } catch (err) {
    console.error("❌ 전체 실행 중 오류 발생:", err.message);
  }
})();
