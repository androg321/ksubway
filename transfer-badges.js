// ==========================================
// transfer-badges.js (문자 노선 및 환승 배지 정규화 지원 버전)
// ==========================================

/* 노선별 대표 고유 색상 매핑 */
const LINE_COLORS = {
  1: "#0052A4",
  2: "#00A84D",
  3: "#EF7C1C",
  4: "#00A5DE",
  5: "#996CAC",
  6: "#CD7C2F",
  7: "#747F00",
  8: "#E6186C",
  9: "#BDB092",
  김포골드: "#AD8605",
  수인분당: "#FABE00",
  신림: "#6789CA", // 신림선 색상
  경의중앙: "#77C4A3",
  공항: "#0090D2",
  공항철도: "#0090D2",
  신분당: "#D4003B",
  경춘: "#0C8E72",
  우이신설: "#B0CE18",
  의정부경전철: "#F39C00",
  서해: "#81A914",
  "GTX-A": "#9A1E46",
  경강: "#0066B3",
  인천1: "#7CA8D5",
  인천2: "#ED8B00",
  일반열차: "#585858",
  // 💡 [노선 추가 위치 1] 추후 신규 노선의 색상을 여기에 추가하세요.
  // 예: gyeonggang: "#0066B3",
};

/**
 * 노선명을 일관되게 정규화하는 헬퍼 함수
 * (영문 ID, '호선', '선' 접미사 등을 통일하여 동일 노선으로 인식하게 함)
 */
function normalizeLineName(lineStr) {
  if (!lineStr) return "";
  let clean = String(lineStr).trim();

  // 💡 [노선 추가 위치 2] 영문 ID를 한국어 대표 노선명으로 매핑
  // 문자로 이루어진 새로운 노선을 추가할 때 여기에 [영문ID]: "대표노선명" 을 등록하세요.
  const ID_MAP = {
    uisinseol: "우이신설",
    sillim: "신림",
    // 예: gyeongui: "경의중앙",
    // 예: sinbundang: "신분당",
  };

  if (ID_MAP[clean]) {
    clean = ID_MAP[clean];
  }

  // "line1" -> "1", "1호선" -> "1", "신림선" -> "신림", "우이신설선" -> "우이신설" 처럼 접미사 제거
  return clean
    .replace(/^line/i, "")
    .replace(/호선$/, "")
    .replace(/선$/, "")
    .trim();
}

/**
 * 역 정보(station)와 현재 페이지 노선(currentLine)을 받아 환승 배지 HTML 생성
 * @param {Object} station - 역 정보 객체 (예: { name: '신설동', line: '2/1/우이신설' })
 * @param {string|number} currentLine - 현재 페이지 노선 (예: "uisinseol", "sillim", "1" 등)
 * @returns {string} 환승 배지 HTML
 */
function getTransferBadgesHtml(station, currentLine) {
  if (!station) return "";

  // 1. 역 객체의 transfers 배열이 있거나, 구글 시트 E열(line: "1/4/경의중앙")을 슬래시 구분자로 파싱
  let rawTransfers = [];
  if (Array.isArray(station.transfers)) {
    rawTransfers = station.transfers;
  } else if (station.line) {
    rawTransfers = station.line.split("/").map((item) => item.trim());
  }

  if (rawTransfers.length === 0) return "";

  // 2. 현재 페이지 노선 정규화 (예: "uisinseol" -> "우이신설", "line1" -> "1")
  const normalizedCurrentLine = normalizeLineName(currentLine);

  // 3. 현재 페이지 노선 마크는 필터링에서 제외
  const filteredTransfers = rawTransfers.filter(
    (line) => normalizeLineName(line) !== normalizedCurrentLine
  );

  if (filteredTransfers.length === 0) return "";

  // 4. 환승 배지 HTML 동적 생성
  const badges = filteredTransfers.map((line) => {
    if (line === "KTX") {
      return `
        <span class="transfer-badge ktx-badge">
          <img src="ktx.svg" alt="KTX" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';" />
          <span style="display:none; font-size: 0.65rem; font-weight:700;">KTX</span>
        </span>
      `;
    }

    // 색상 적용 시 '선/호선'이 빠진 원본 이름도 함께 탐색
    const cleanName = normalizeLineName(line);
    const color = LINE_COLORS[line] || LINE_COLORS[cleanName] || "#666666";
    const isLongText = String(line).length > 1;
    const badgeClass = isLongText ? "transfer-badge pill" : "transfer-badge";
    return `<span class="${badgeClass}" style="background-color: ${color};">${line}</span>`;
  });

  return `<div class="transfer-badges">${badges.join("")}</div>`;
}
