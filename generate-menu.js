import fs from "fs";
import fetch from "node-fetch";
import Papa from "papaparse";

// ✅ Google Sheet CSV URL
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSU0jsVP81fqHSu4DHUvLPyrCqgrKFd1ZTbdI_w4D4BGrONo-DQlcpwPGChNLGvTQ/pub?gid=0&single=true&output=csv";
const PREV_FILE = "prev.json";

function getRandomItems(arr, count) {
  const shuffled = arr.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

(async () => {
  try {
    // ✅ Step 1. 데이터 요청
    console.log("📡 CSV 데이터 요청 중...");
    const res = await fetch(SHEET_URL);
    if (!res.ok) throw new Error(`📛 CSV 요청 실패: ${res.statusText}`);
    const csv = await res.text();

    // ✅ Step 2. CSV 파싱
    console.log("📊 CSV 데이터 파싱 중...");
    const { data, errors } = Papa.parse(csv, { header: true });
    if (errors.length > 0) {
      console.error("❌ CSV 파싱 오류 발생:", errors);
      return;
    }

    const validMenus = data.filter(
      (item) => item["영문명"]?.trim() && item["난이도"]?.trim() && item["영문명"] !== "-"
    );

    if (validMenus.length < 3) {
      console.error("❌ 유효한 메뉴가 3개 미만입니다. 데이터 시트를 확인해주세요.");
      return;
    }

    // ✅ Step 3. 어제 메뉴 불러오기
    let prevMenus = [];
    if (fs.existsSync(PREV_FILE)) {
      try {
        prevMenus = JSON.parse(fs.readFileSync(PREV_FILE, "utf8"));
      } catch (e) {
        console.warn("⚠️ 이전 추천 파일을 파싱하는 데 실패했습니다. 무시하고 계속 진행합니다.");
      }
    }

    // ✅ Step 4. 오늘 메뉴 선택
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
      console.error("❌ 조건을 만족하는 메뉴를 찾지 못했습니다. 메뉴 수가 부족하거나 조건이 과도할 수 있습니다.");
      return;
    }

    // ✅ Step 5. prev.json 저장
    try {
      fs.writeFileSync(PREV_FILE, JSON.stringify(todaysMenus.map((m) => m["영문명"])), "utf8");
      console.log("📝 prev.json 저장 완료");
    } catch (e) {
      console.error("❌ prev.json 저장 실패:", e);
      return;
    }

    // ✅ Step 6. index.html 생성
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
