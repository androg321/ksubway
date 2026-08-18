// Google Sheet CSV URL (2단계에서 얻은 링크 대입)
const GOOGLE_SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSsEzg3A43H5aeKr_s_LY4H-2l8tz-zqr8tDzkpF4JkRdKdg_tU9TM8cxraMQY8VqFHEPDiE3muUB-X/pub?output=csv";

// dynamic stationMaster 객체 (비어있는 상태로 시작)
let stationMaster = {};

/**
 * 구글 시트에서 CSV 데이터를 받아와 stationMaster 자동 구성
 */
async function loadStationsFromGoogleSheet() {
  try {
    const response = await fetch(GOOGLE_SHEET_CSV_URL);
    const csvText = await response.text();

    // CSV 줄바꿈 단위 분할 및 파싱
    const lines = csvText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    // 첫 줄(헤더) 제외 후 반복 처리
    for (let i = 1; i < lines.length; i++) {
      const [id, name, lat, lng, line] = lines[i].split(",");

      if (id && name) {
        stationMaster[id.trim()] = {
          name: name.trim(),
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          line: line ? line.trim() : "",
          verified: false,
        };
      }
    }
    console.log("구글 시트 역 데이터 로드 완료:", stationMaster);
  } catch (error) {
    console.error("구글 시트 데이터 로드 실패:", error);
  }
}

/**
 * 호선/계통별 노선 구성 정보
 */
const lineRoutes = {
  line1: {
    main: [
      "yeoncheon",
      "jeongok",
      "cheongsan",
      "soyosan",
      "dongducheon",
      "bosan",
      "dongducheonJungang",
      "jihaeng",
      "deokjeong",
      "deokgye",
      "yangju",
      "nokyang",
      "ganeung",
      "uijeongbu",
      "hoeryong",
      "mangwolsa",
      "dobongsan",
      "dobong",
      "banghak",
      "changdong",
      "nokcheon",
      "wolgye",
      "kwangwoonUniv",
      "seokgye",
      "sinimun",
      "oedaeap",
      "hoegi",
      "cheongnyangni",
      "jegiDong",
      "sinseolDong",
      "dongmyo",
      "dongdaemun",
      "jongno5ga",
      "jongno3ga",
      "jonggak",
      "cityhall",
      "seoulStation",
      "namyeong",
      "yongsan",
      "noryangjin",
      "daebang",
      "singil",
      "yeongdeungpo",
      "sindorim",
      "guro",
      "gasanDigitalComplex",
      "doksan",
      "geumcheonGuOffice",
      "seoksu",
      "gwanak",
      "anyang",
      "myeonghak",
      "geumjeong",
      "gunpo",
      "dangjeong",
      "uiwang",
      "sungkyunkwanUniv",
      "hwaseo",
      "suwon",
      "seryu",
      "byeongjeom",
      "sema",
      "osanCollege",
      "osan",
      "jinwi",
      "songtan",
      "seojeongri",
      "pyeongtaekJije",
      "pyeongtaek",
      "seonghwan",
      "jiksan",
      "dujeong",
      "cheonan",
      "bongmyeong",
      "ssangyong",
      "asan",
      "tangjeong",
      "baebang",
      "onyangoncheon",
      "sinchang",
    ],
    incheon: [
      "guro",
      "guil",
      "gaebong",
      "oryudong",
      "onsu",
      "yeokgok",
      "sosa",
      "bucheon",
      "jungdong",
      "songnae",
      "bugae",
      "bupyeong",
      "baegun",
      "dongam",
      "ganseok",
      "juan",
      "dohwa",
      "jemulpo",
      "dowon",
      "dongincheon",
      "incheon",
    ],
    gwangmyeong: ["geumcheonGuOffice", "gwangmyeong"],
    seodongtan: ["byeongjeom", "seodongtan"],
  },
  line2: {
    main: [
      "cityhall",
      "euljiro3",
      "dongdaemun_history",
      "wangsimni",
      "seongsu",
      "jamsil",
      "samseong",
      "gangnam",
      "sadang",
      "sindorim",
      "hongdae",
      "sinchon",
      "cityhall",
    ],
    seongsu_branch: ["seongsu", "yongdap", "sinseoldong"],
    sinjeong_branch: ["sindorim", "kkachi_san"],
  },
};
