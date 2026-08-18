// ==========================================
// stations.js (노선별 탭/CSV 동적 로딩 지원 버전)
// ==========================================

// 기본 공통 CSV URL (LINE_CONFIG.csvUrl이 없을 경우 사용되는 폴백 주소)
const GOOGLE_SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSsEzg3A43H5aeKr_s_LY4H-2l8tz-zqr8tDzkpF4JkRdKdg_tU9TM8cxraMQY8VqFHEPDiE3muUB-X/pub?output=csv";

let stationMaster = {};
let lineRoutes = {};

/**
 * 큰따옴표가 포함된 CSV 한 줄을 안전하게 split하는 함수
 */
function parseCSVLine(text) {
  const result = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(cell.trim());
      cell = "";
    } else {
      cell += char;
    }
  }
  result.push(cell.trim());
  return result;
}

/**
 * 현재 페이지의 노선 설정(LINE_CONFIG.csvUrl)에 맞는 CSV 데이터를 동적으로 로드
 */
async function loadStationsFromGoogleSheet() {
  try {
    // LINE_CONFIG.csvUrl이 정의되어 있으면 해당 URL을 사용하고, 없으면 기본 URL을 사용
    const targetUrl =
      typeof LINE_CONFIG !== "undefined" && LINE_CONFIG.csvUrl
        ? LINE_CONFIG.csvUrl
        : GOOGLE_SHEET_CSV_URL;

    const response = await fetch(targetUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const csvText = await response.text();

    // 줄바꿈 \r\n 제거 및 빈 줄 필터링
    const lines = csvText
      .replace(/\r/g, "")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    stationMaster = {};
    lineRoutes = {};

    const tempRoutes = {};

    // 첫 줄(헤더) 제외 후 반복 (A: id, B: name, C: lat, D: lng, E: line, F: routes)
    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i]);
      const [id, name, lat, lng, line, routesStr] = cols;

      if (id && name) {
        const cleanId = id.replace(/['"]/g, "").trim();

        // 1. stationMaster 구성
        stationMaster[cleanId] = {
          name: name.replace(/['"]/g, "").trim(),
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          line: line ? line.replace(/['"]/g, "").trim() : "",
          verified: false,
        };

        // 2. 계통 및 순서 파싱 (F열: "line1:main:37, line2:main:1")
        if (routesStr) {
          const rawRoutes = routesStr.replace(/['"]/g, "").split(",");
          rawRoutes.forEach((routeTarget) => {
            const parts = routeTarget.trim().split(":");
            const lineKey = parts[0] ? parts[0].trim() : "";
            const branchKey = parts[1] ? parts[1].trim() : "";
            // 순서값이 명시되지 않은 경우 기본값 999
            const orderVal = parts[2] ? parseInt(parts[2].trim(), 10) : 999;

            if (lineKey && branchKey) {
              if (!tempRoutes[lineKey]) tempRoutes[lineKey] = {};
              if (!tempRoutes[lineKey][branchKey])
                tempRoutes[lineKey][branchKey] = [];

              tempRoutes[lineKey][branchKey].push({
                id: cleanId,
                order: orderVal,
              });
            }
          });
        }
      }
    }

    // 3. 각 계통별로 order 숫자 기준 오름차순 정렬 후 lineRoutes 객체 완성
    Object.keys(tempRoutes).forEach((lineKey) => {
      lineRoutes[lineKey] = {};
      Object.keys(tempRoutes[lineKey]).forEach((branchKey) => {
        // order 기준 정렬
        tempRoutes[lineKey][branchKey].sort((a, b) => a.order - b.order);
        // 정렬된 ID만 추출
        lineRoutes[lineKey][branchKey] = tempRoutes[lineKey][branchKey].map(
          (item) => item.id
        );
      });
    });

    const lineName =
      typeof LINE_CONFIG !== "undefined" && LINE_CONFIG.name
        ? LINE_CONFIG.name
        : "역 데이터";

    console.log(`${lineName} 구글 시트 로드 완료:`, stationMaster);
    console.log("계통별 순서 정렬 완료된 lineRoutes:", lineRoutes);
  } catch (error) {
    console.error("구글 시트 데이터 로드 실패:", error);
  }
}
