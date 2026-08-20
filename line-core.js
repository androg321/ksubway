let currentRoute = null;
let selectedStationId = null;
let isAdminMode = false;

const container = document.getElementById("stationList");
const modalOverlay = document.getElementById("stationModal");

// 노선명(정규화된 한글 표기) -> 해당 노선 페이지의 LINE_CONFIG.id 매핑
// (환승역 인증 시, 실제로 그 역이 지나는 노선의 저장소에만 동기화하기 위해 사용)
const LINE_NAME_TO_ID = {
  1: "line1",
  2: "line2",
  3: "line3",
  4: "line4",
  5: "line5",
  6: "line6",
  7: "line7",
  8: "line8",
  9: "line9",
  우이신설: "uisinseol",
  신림: "sillim",
  인천1: "incheon1",
  인천2: "incheon2",
  경의중앙: "gyeongjung",
  경춘: "gyeongchun",
  경강: "gyeonggang",
  수인분당: "suinbundang",
  신분당: "sinbundang",
  서해: "seohae",
  공항: "airport",
  공항철도: "airport",
  "GTX-A": "gtxa",
  김포골드: "gimpogold",
  에버라인: "everline",
  의정부: "uijeongbu",
};

/**
 * 현재 노선 계통 데이터를 동적으로 가져오는 헬퍼 함수
 * (구글 시트에서 로드된 lineRoutes가 우선 반영됨)
 */
function getRoutes() {
  if (typeof lineRoutes !== "undefined" && lineRoutes[LINE_CONFIG.id]) {
    return lineRoutes[LINE_CONFIG.id];
  }
  return LINE_CONFIG.routesData || {};
}

/**
 * 앱 초기화 (비동기로 구글 시트 데이터를 불러온 후 UI 및 화면 구성)
 */
async function initApp() {
  try {
    // 1. 구글 시트 데이터 불러오기 완료 시까지 대기
    if (typeof loadStationsFromGoogleSheet === "function") {
      await loadStationsFromGoogleSheet();
    }

    // 디버깅용 로그
    console.log("현재 설정된 LINE_CONFIG.id:", LINE_CONFIG.id);
    console.log("불러온 lineRoutes 목록:", lineRoutes);
    console.log("매칭된 계통 데이터:", lineRoutes[LINE_CONFIG.id]);

    // 2. 구글 시트에서 로드된 lineRoutes가 존재하면 LINE_CONFIG.routesData 갱신
    if (typeof lineRoutes !== "undefined" && lineRoutes[LINE_CONFIG.id]) {
      LINE_CONFIG.routesData = lineRoutes[LINE_CONFIG.id];
    }

    // 3. 설정된 객체(LINE_CONFIG)를 바탕으로 기본 UI 요소 구성
    document.title = `서울 ${LINE_CONFIG.name} 모바일 인증`;
    document.documentElement.style.setProperty(
      "--line-color",
      LINE_CONFIG.color
    );
    // document.getElementById(
    //   "headerTitle"
    // ).innerText = `🚇 ${LINE_CONFIG.name} 인증기`;
    document.getElementById(
      "progressTitle"
    ).innerText = `${LINE_CONFIG.name} 인증 진행도: `;

    const tabContainer = document.getElementById("tabContainer");
    tabContainer.innerHTML = "";

    LINE_CONFIG.tabs.forEach((tab, index) => {
      const btn = document.createElement("button");
      btn.className = `tab-btn ${index === 0 ? "active" : ""}`;
      btn.innerText = tab.name;
      btn.onclick = () => switchRoute(tab.id);
      tabContainer.appendChild(btn);
    });

    currentRoute = LINE_CONFIG.tabs[0].id;

    // 4. 기존 방문 기록(localStorage) 불러오기 및 스태이터스 업데이트
    loadProgress();

    // 5. 역 목록 화면 렌더링
    renderStations();

    console.log("앱 초기화 완료");
  } catch (err) {
    console.error("앱 초기화 중 오류 발생:", err);
  }
}

// 문서 로드 완료 시 initApp 실행
window.addEventListener("DOMContentLoaded", () => {
  initApp();
});

function loadProgress() {
  const savedData = localStorage.getItem(LINE_CONFIG.storageKey);
  if (savedData) {
    try {
      const parsedData = JSON.parse(savedData);
      Object.keys(parsedData).forEach((id) => {
        if (stationMaster[id]) {
          stationMaster[id].verified = parsedData[id];
        }
      });
    } catch (e) {
      console.error("데이터 불러오기 실패", e);
    }
  }
}

function saveProgress() {
  const verifiedData = {};
  const currentRoutes = getRoutes();
  const allStationIds = [...new Set(Object.values(currentRoutes).flat())];
  allStationIds.forEach((id) => {
    if (stationMaster[id]) {
      verifiedData[id] = stationMaster[id].verified;
    }
  });
  localStorage.setItem(LINE_CONFIG.storageKey, JSON.stringify(verifiedData));
}

function updateStats() {
  const currentRoutes = getRoutes();
  const allStationIds = [...new Set(Object.values(currentRoutes).flat())];
  const totalStations = allStationIds.length;
  const verifiedStations = allStationIds.filter(
    (id) => stationMaster[id] && stationMaster[id].verified
  ).length;

  const percentage =
    totalStations > 0
      ? Math.round((verifiedStations / totalStations) * 100)
      : 0;

  document.getElementById("totalCount").innerText = totalStations;
  document.getElementById("verifiedCount").innerText = verifiedStations;
  document.getElementById("percentageText").innerText = `${percentage}%`;
  document.getElementById("progressFill").style.width = `${percentage}%`;

  // 마이페이지 종합 진행도 계산을 위해 이 노선의 전체 역 개수를 별도 저장
  // (구글 시트 로딩이 끝난 시점의 실제 총 역 개수를 캐싱해 둠)
  if (totalStations > 0) {
    localStorage.setItem(`${LINE_CONFIG.id}_total_stations`, totalStations);
  }
}

function toggleAdminMode() {
  isAdminMode = !isAdminMode;
  const fab = document.getElementById("adminFab");
  const banner = document.getElementById("adminBanner");

  if (isAdminMode) {
    fab.classList.add("active");
    fab.innerHTML = "⚡ 관리자 ON";
    banner.classList.add("show");
  } else {
    fab.classList.remove("active");
    fab.innerHTML = "⚙️ 관리자 OFF";
    banner.classList.remove("show");
  }
}

function switchRoute(routeKey) {
  currentRoute = routeKey;
  const tabs = document.querySelectorAll(".tab-btn");
  LINE_CONFIG.tabs.forEach((tab, index) => {
    tabs[index].classList.toggle("active", tab.id === routeKey);
  });
  renderStations();
}

function renderStations() {
  container.innerHTML = "";
  const currentRoutes = getRoutes();
  const currentStationIds = currentRoutes[currentRoute] || [];

  currentStationIds.forEach((id) => {
    const station = stationMaster[id];
    // 구글 시트에 존재하지 않는 id일 경우 예외 처리
    if (!station) return;

    const btn = document.createElement("button");
    btn.className = `station-btn`;

    btn.innerHTML = `
      <div class="icon-col">
          <div class="icon-line"></div>
          <div class="icon-circle"></div>
      </div>
      <div class="text-col">
          <span class="station-name">${station.name}</span>
          ${
            typeof getTransferBadgesHtml === "function"
              ? getTransferBadgesHtml(station, LINE_CONFIG.id)
              : ""
          }
      </div>
      ${station.verified ? `<div class="visited-badge">✓ 방문함</div>` : ""}
    `;

    btn.onclick = () => openModal(id);
    container.appendChild(btn);
  });
  updateStats();
}

function openModal(id) {
  selectedStationId = id;
  const station = stationMaster[id];

  if (station.verified) {
    alert("이미 방문 인증이 완료된 역입니다.");
    return;
  }

  document.getElementById("modalTitle").innerText = station.name;
  const mapUrl = `https://maps.google.com/maps?q=${station.lat},${station.lng}&z=16&output=embed`;
  document.getElementById("mapFrame").src = mapUrl;

  const verifyBtn = document.getElementById("verifyBtn");
  const calcBtn = document.getElementById("calcBtn");
  const distanceResult = document.getElementById("distanceResult");

  if (isAdminMode) {
    distanceResult.innerText = "⚡ 관리자 모드: 위치 제한 없음";
    calcBtn.style.display = "none";
    verifyBtn.style.display = "block";
  } else {
    distanceResult.innerText = "버튼을 눌러 거리를 측정하세요.";
    calcBtn.style.display = "block";
    verifyBtn.style.display = "none";
  }
  modalOverlay.classList.add("show");
}

function closeModal() {
  modalOverlay.classList.remove("show");
}

modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal();
});

function calcDistance() {
  document.getElementById("distanceResult").innerText = "GPS 신호 탐색 중...";
  const station = stationMaster[selectedStationId];

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const d = getDistanceFromLatLonInMeters(
        pos.coords.latitude,
        pos.coords.longitude,
        station.lat,
        station.lng
      );
      document.getElementById(
        "distanceResult"
      ).innerText = `현재 위치와의 거리: ${Math.round(d)}m`;

      if (d <= 1000) {
        document.getElementById("verifyBtn").style.display = "block";
      } else {
        document.getElementById("verifyBtn").style.display = "none";
        alert("1km 이내에 접근해야 인증할 수 있습니다.");
      }
    },
    () => {
      document.getElementById("distanceResult").innerText = "위치 권한 오류";
      alert("기기의 위치 권한을 허용해주세요.");
    }
  );
}

/**
 * 방문 인증 완료 처리 (환승역 타 노선 자동 연동 처리)
 */
function verifyStation() {
  const targetId = selectedStationId;
  const targetStation = stationMaster[targetId];

  if (!targetStation) return;

  // 1. 현재 메모리 상의 역 상태 변경 및 현재 노선 스토리지 저장
  targetStation.verified = true;
  saveProgress();

  // 2. 이 역이 실제로 지나가는 환승 노선만 골라서, 그 노선들의 스토리지에만 인증 상태 연동
  //    (station.line 예: "1/2/우이신설" 처럼 슬래시로 구분된 실제 환승 노선 목록)
  const rawTransfers = Array.isArray(targetStation.transfers)
    ? targetStation.transfers
    : targetStation.line
    ? targetStation.line.split("/").map((s) => s.trim())
    : [];

  rawTransfers.forEach((lineStr) => {
    const normalized =
      typeof normalizeLineName === "function"
        ? normalizeLineName(lineStr)
        : String(lineStr).trim();
    const targetLineId = LINE_NAME_TO_ID[normalized];

    // 현재 노선이거나, 매핑되지 않는(KTX 등) 노선은 건너뜀
    if (!targetLineId || targetLineId === LINE_CONFIG.id) return;

    const storageKey = `${targetLineId}_verified_stations`;
    try {
      const savedData = localStorage.getItem(storageKey);
      const parsedData = savedData ? JSON.parse(savedData) : {};

      parsedData[targetId] = true;
      localStorage.setItem(storageKey, JSON.stringify(parsedData));
    } catch (e) {
      console.error(`${storageKey} 연동 저장 실패:`, e);
    }
  });

  // 3. UI 갱신 및 모달 닫기
  renderStations();
  closeModal();

  setTimeout(() => {
    alert(
      `🎉 ${targetStation.name} 방문 인증이 완료되었습니다!\n(환승 노선에도 자동 연동 처리되었습니다.)`
    );
  }, 300);
}

function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
