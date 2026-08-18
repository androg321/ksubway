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
  경의중앙: "#77C4A3",
  공항: "#0090D2",
  공항철도: "#0090D2",
  신분당: "#D4003B",
  경춘: "#0C8E72",
  우이신설: "#B0CE18",
  서해: "#81A914",
  "GTX-A": "#9A1E46",
  경강: "#0066B3",
  신림: "#6789CA",
  인천1: "#7CA8D5",
  인천2: "#ED8B00",
  일반열차: "#585858",
};

/* 모든 노선 정보를 포함한 전체 환승역 데이터베이스 */
const ALL_STATION_TRANSFERS = {
  시청: ["1", "2"],
  종로3가: ["1", "3", "5"],
  동대문: ["1", "4"],
  창동: ["1", "4"],
  도봉산: ["1", "7"],
  서울역: ["1", "4", "경의중앙", "공항철도", "KTX", "일반열차"],
  용산: ["1", "경의중앙", "KTX", "일반열차"],
  노량진: ["1", "9"],
  신도림: ["1", "2"],
  가산디지털단지: ["1", "7"],
  온수: ["1", "7"],
  부평: ["1", "인천1"],
  인천: ["1", "수인분당"],
  금정: ["1", "4"],
  수원: ["1", "수인분당", "KTX", "일반열차"],
  청량리: ["1", "수인분당", "경의중앙", "경춘", "KTX", "일반열차"],
  회기: ["1", "경의중앙", "경춘"],
  석계: ["1", "6"],
  신설동: ["1", "2", "우이신설"],
  동묘앞: ["1", "6"],
  소사: ["1", "서해"],
  초지: ["4", "수인분당", "서해"],
  교대: ["2", "3"],
  고속터미널: ["3", "7", "9"],
  합정: ["2", "6"],
  사당: ["2", "4"],
  왕십리: ["2", "5", "경의중앙", "수인분당"],
};

/**
 * 역 정보와 현재 페이지의 노선 정보를 받아 해당 노선을 제외한 환승 배지 HTML을 생성
 * @param {Object} station - 역 객체 ({ name: '시청' })
 * @param {string|number} currentLine - 현재 페이지 노선 (예: "1", "1호선", "2" 등)
 * @returns {string} 환승 배지 HTML
 */
function getTransferBadgesHtml(station, currentLine) {
  // 현재 노선 문자열 정규화 ("1호선" -> "1")
  const normalizedCurrentLine = String(currentLine).replace("호선", "").trim();

  // 역 자체 설정 정보가 없으면 전체 DB 참조
  const allTransfers = station.transfers || ALL_STATION_TRANSFERS[station.name];

  if (!allTransfers || allTransfers.length === 0) return "";

  // 현재 페이지의 노선 제외
  const filteredTransfers = allTransfers.filter(
    (line) => String(line).replace("호선", "").trim() !== normalizedCurrentLine
  );

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
    const isLongText = line.length > 1;
    const badgeClass = isLongText ? "transfer-badge pill" : "transfer-badge";
    return `<span class="${badgeClass}" style="background-color: ${color};">${line}</span>`;
  });

  return `<div class="transfer-badges">${badges.join("")}</div>`;
}
