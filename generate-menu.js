import fs from "fs";
import fetch from "node-fetch";
import Papa from "papaparse";

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSU0jsVP81fqHSu4D6Ag_3oIwgj8DXwDHiBl4sXVuNBXAozbbC33h6ewyCu4IWkrzGoHJA2r45V_sji/pub?gid=1614121062&single=true&output=csv";
const PREV_FILE = "prev.json";

function getRandomItems(arr, count) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

(async () => {
  try {
    console.log("📡 CSV 데이터 요청 중...");
    const res = await fetch(SHEET_URL);
    if (!res.ok) throw new Error(`📛 CSV 요청 실패: ${res.statusText}`);
    const csv = await res.text();

    console.log("📊 CSV 데이터 파싱 중...");
    const { data: rawData, errors } = Papa.parse(csv, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim()
    });

    if (errors.length > 0) {
      console.error("❌ CSV 파싱 오류:", errors);
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

    console.log(`✅ 유효한 메뉴 수: ${validMenus.length}`);
    if (validMenus.length < 3) {
      console.error("❌ 유효한 메뉴가 3개 미만입니다.");
      return;
    }

    let prevMenus = [];
    if (fs.existsSync(PREV_FILE)) {
      try {
        prevMenus = JSON.parse(fs.readFileSync(PREV_FILE, "utf8"));
      } catch {
        console.warn("⚠️ prev.json 파싱 실패. 무시하고 진행.");
      }
    }

    const easyMenus = validMenus.filter((item) => item["난이도"] === "하");
    if (easyMenus.length === 0) {
      console.error("❌ '난이도 하' 메뉴가 없습니다.");
      return;
    }

    let todaysMenus = [];
    let tries = 0;
    while (tries++ < 100) {
      const easyPick = getRandomItems(easyMenus, 1)[0];
      const remaining = validMenus.filter(
        (item) =>
          item["영문명"] !== easyPick["영문명"] &&
          !prevMenus.includes(item["영문명"])
      );
      const others = getRandomItems(remaining, 2);
      const allMenus = [easyPick, ...others];
      const noOverlap = allMenus.every(
        (item) => !prevMenus.includes(item["영문명"])
      );
      if (others.length === 2 && noOverlap) {
        todaysMenus = allMenus;
        break;
      }
    }

    if (todaysMenus.length < 3) {
      console.error("❌ 조건 만족 실패: 메뉴 수 부족 또는 중복 조건 과도.");
      return;
    }

    fs.writeFileSync(
      PREV_FILE,
      JSON.stringify(todaysMenus.map((m) => m["영문명"])),
      "utf8"
    );

    console.log("🛠 index.html 생성 중...");
    const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>오늘의 추천 메뉴</title>
  <style>
    body {
      font-family: 'Pretendard', sans-serif;
      background-color: #f5f5f5;
      padding: 40px 20px;
      margin: 0;
    }
    h1 {
      text-align: center;
      font-size: 28px;
      color: #333;
      margin-bottom: 40px;
    }
    .menu {
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      max-width: 500px;
      margin: 0 auto 40px auto;
      padding: 20px;
      text-align: center;
    }
    .menu img {
      width: 100%;
      max-width: 420px;
      border-radius: 12px;
      margin-bottom: 12px;
    }
    .menu h2 {
      font-size: 20px;
      margin: 10px 0 6px;
      color: #222;
    }
    .menu p {
      font-size: 14px;
      color: #666;
    }
    @media (max-width: 600px) {
      body {
        padding: 20px 10px;
      }
      .menu {
        margin-bottom: 24px;
      }
    }
  </style>
  <script src="track-click.js"></script>
</head>
<body>
  <h1>🍽 오늘의 추천 메뉴</h1>
  ${todaysMenus
    .map((menu) => {
      const { 메뉴명, 영문명, 레시피영상링크, 난이도 } = menu;
      const imgSrc = `https://yongzu98.github.io/menu-images/image/${영문명}.jpg`;
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
