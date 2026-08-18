/**
 * 전체 역 데이터 베이스 (Master Data)
 */
const stationMaster = {
  // === 1호선 역 데이터 (기존) ===
  yeoncheon: {
    name: "연천",
    lat: 38.1074,
    lng: 127.0754,
    line: "1호선",
    verified: false,
  },
  cheongnyangni: {
    name: "청량리",
    lat: 37.5801,
    lng: 127.0436,
    line: "1호선",
    verified: false,
  },
  cityhall: {
    name: "시청",
    lat: 37.5647,
    lng: 126.9771,
    line: "1호선",
    verified: false,
  },
  seoul: {
    name: "서울역",
    lat: 37.5559,
    lng: 126.9723,
    line: "1호선",
    verified: false,
  },
  guro: {
    name: "구로",
    lat: 37.503,
    lng: 126.8825,
    line: "1호선",
    verified: false,
  },
  doksan: {
    name: "독산",
    lat: 37.465974,
    lng: 126.8894779,
    line: "1호선",
    verified: false,
  },
  geumcheon: {
    name: "금천구청",
    lat: 37.4559,
    lng: 126.8953,
    line: "1호선",
    verified: false,
  },
  byeongjeom: {
    name: "병점",
    lat: 37.2067,
    lng: 127.0331,
    line: "1호선",
    verified: false,
  },
  sinchang: {
    name: "신창",
    lat: 36.7696,
    lng: 126.9513,
    line: "1호선",
    verified: false,
  },
  bupyeong: {
    name: "부평",
    lat: 37.4895,
    lng: 126.7248,
    line: "1호선",
    verified: false,
  },
  incheon: {
    name: "인천",
    lat: 37.4764,
    lng: 126.6169,
    line: "1호선",
    verified: false,
  },
  gwangmyeong: {
    name: "광명",
    lat: 37.4162,
    lng: 126.8848,
    line: "1호선",
    verified: false,
  },
  seodongtan: {
    name: "서동탄",
    lat: 37.1993,
    lng: 127.0526,
    line: "1호선",
    verified: false,
  },

  // === 2호선 역 데이터 (신규 추가) ===
  // 본선 (순환선 주요역)
  cityhall: {
    name: "시청",
    lat: 37.5647,
    lng: 126.9771,
    line: "2호선",
    verified: false,
  },
  euljiro3: {
    name: "을지로3가",
    lat: 37.5663,
    lng: 126.9918,
    line: "2호선",
    verified: false,
  },
  dongdaemun_history: {
    name: "동대문역사문화공원",
    lat: 37.5657,
    lng: 127.0079,
    line: "2호선",
    verified: false,
  },
  wangsimni: {
    name: "왕십리",
    lat: 37.5615,
    lng: 127.0371,
    line: "2호선",
    verified: false,
  },
  seongsu: {
    name: "성수",
    lat: 37.5446,
    lng: 127.0559,
    line: "2호선",
    verified: false,
  },
  jamsil: {
    name: "잠실",
    lat: 37.5133,
    lng: 127.1001,
    line: "2호선",
    verified: false,
  },
  samseong: {
    name: "삼성",
    lat: 37.5088,
    lng: 127.0632,
    line: "2호선",
    verified: false,
  },
  gangnam: {
    name: "강남",
    lat: 37.4979,
    lng: 127.0276,
    line: "2호선",
    verified: false,
  },
  교대: {
    name: "교대",
    lat: 37.4934,
    lng: 127.0142,
    line: "2호선",
    verified: false,
  },
  sadang: {
    name: "사당",
    lat: 37.4765,
    lng: 126.9816,
    line: "2호선",
    verified: false,
  },
  sindorim: {
    name: "신도림",
    lat: 37.5087,
    lng: 126.8913,
    line: "2호선",
    verified: false,
  },
  hongdae: {
    name: "홍대입구",
    lat: 37.5575,
    lng: 126.9245,
    line: "2호선",
    verified: false,
  },
  sinchon: {
    name: "신촌",
    lat: 37.5551,
    lng: 126.9369,
    line: "2호선",
    verified: false,
  },

  // 성수지선
  yongdap: {
    name: "용답",
    lat: 37.5619,
    lng: 127.0508,
    line: "2호선",
    verified: false,
  },
  sinseoldong: {
    name: "신설동",
    lat: 37.5753,
    lng: 127.0248,
    line: "2호선",
    verified: false,
  },

  // 신정지선
  kkachi_san: {
    name: "까치산",
    lat: 37.5318,
    lng: 126.8467,
    line: "2호선",
    verified: false,
  },
};

/**
 * 호선/계통별 노선 구성 정보
 */
const lineRoutes = {
  line1: {
    main: [
      "yeoncheon",
      "cheongnyangni",
      "cityhall",
      "seoul",
      "guro",
      "doksan",
      "geumcheon",
      "byeongjeom",
      "sinchang",
    ],
    incheon: ["guro", "bupyeong", "incheon"],
    gwangmyeong: ["geumcheon", "gwangmyeong"],
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
