import fs from "fs";
import fetch from "node-fetch";
import Papa from "papaparse";

// ✅ Google Sheets CSV 링크 (공개 권한: 링크 있는 사용자 보기 가능)
const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1Gbjrg2d1orbmrYIR5FgMc2lEUVA-5yJuvXrmpeYzuOA/gviz/tq?tqx=out:csv";
const PREV_FILE = "prev.json";

// ✅ 랜덤 추출 함수
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

    // 📊 Step 2: CSV 파싱 및 정리
    console.log("📊 CSV 데이터 파싱 중...");
    const { data: rawData, errors } = Papa.parse(csv, { header: true });
    if (errors.length > 0) {
      console.error("❌ CSV 파싱 오류 발생:", errors);
      return;
    }

    const data = rawData.map(row => {
      const cleaned = {};
      for (const key in row) {
        cleaned[key.trim()] = row[key]?.trim();
      }
      return cleaned;
    });

    const validMenus = data.filter(
      (item) => item["영문명"] && item["난이도"] && item["영문명"] !== "-"
    );

    if (validMenus.length < 3) {
      console.error("❌ 유효한 메뉴가 3개 미만입니다. 데이터 시트를 확인해주세요.");
      return;
    }

    // 📁 Step 3: 이전 추천 메뉴 불러오기
    let prevMenus = [];
    if (fs.existsSync(PREV_FILE)) {
      try {
        prevMenus = JSON.parse(fs.readFileSync(PREV_FILE, "utf8"));
      } catch (e) {
        console.warn("⚠️ prev.json 파싱 실패. 무시하고 진행.");
      }
    }

    // 🎯 Step 4: 메뉴 선택 (난이도 '하' 1개 포함 보장)
    const easyMenus = validMenus.filter((item) => item["난이도"] === "하");
    let todaysMenus = [];
    let tries = 0;

    while (tries++ < 100) {
      const easyPick = getRandomItems(easyMenus, 1)[0];
      const remaining = validMenus.filter((item) =>
        item["영문명"] !== easyPick["영문명"] && !prevMenus.includes(item["영문명"])
      );
      const others = getRandomItems(remaining, 2);
      const allMenus = [easyPick, ...others];

      const noOverlap = allMenus.every((item) => !prevMenus.includes(item["영문명"]));
      if (others.length === 2 && noOverlap) {
        todaysMenus = allMenus;
        break;
      }
    }

    if (todaysMenus.length < 3) {
      console.error("❌ 조건 만족 실패: 메뉴 수 부족 또는 중복 조건 과도");
      return;
    }

    // 📝 Step 5: prev.json 저장
    fs.writeFileSync(PREV_FILE, JSON.stringify(todaysMenus.map((m) => m["영문명"])), "utf8");

    // 🧾 Step 6: index.html 생성
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
