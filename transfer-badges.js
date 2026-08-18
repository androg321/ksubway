// ==========================================
// transfer-badges.js (구글 시트 E열 자동 연동 버전)
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
  수인분당: "#FABE00",
  신림: "#6789CA",
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
};

/**
 * 역 정보(station)와 현재 페이지 노선(currentLine)을 받아 환승 배지 HTML 생성
 * @param {Object} station - 역 정보 객체 (예: { name: '서울역', line: '1/4/경의중앙/공항철도/GTX-A/KTX/일반열차' })
 * @param {string|number} currentLine - 현재 페이지 노선 (예: "line1", "1", "1호선" 등)
 * @returns {string} 환승 배지 HTML
 */
function getTransferBadgesHtml(station, currentLine) {
  if (!station) return "";

  // 1. 역 객체의 transfers 배열이 있거나, 구글 시트 E열(line: "1/4/경의중앙")을 슬래시 구분자로 자동 파싱
  let rawTransfers = [];
  if (Array.isArray(station.transfers)) {
    rawTransfers = station.transfers;
  } else if (station.line) {
    rawTransfers = station.line.split("/").map((item) => item.trim());
  }

  if (rawTransfers.length === 0) return "";

  // 2. 현재 노선 문자열 정규화 ("line1" -> "1", "1호선" -> "1")
  const normalizedCurrentLine = String(currentLine)
    .replace("line", "")
    .replace("호선", "")
    .trim();

  // 3. 현재 페이지 노선 마크는 제외
  const filteredTransfers = rawTransfers.filter(
    (line) =>
      String(line).replace("line", "").replace("호선", "").trim() !==
      normalizedCurrentLine
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

    const color = LINE_COLORS[line] || "#666666";
    const isLongText = String(line).length > 1;
    const badgeClass = isLongText ? "transfer-badge pill" : "transfer-badge";
    return `<span class="${badgeClass}" style="background-color: ${color};">${line}</span>`;
  });

  return `<div class="transfer-badges">${badges.join("")}</div>`;
}
