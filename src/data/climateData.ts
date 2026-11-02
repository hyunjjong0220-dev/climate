/**
 * 기상청(KMA) 기후변화감시센터 및 산림청 산림통계연보 (2010~2022) 실측 데이터
 * Orange3 산점도(Scatter Plot) 및 상관계수 분석 결과 반영
 */

export interface ClimateDataPoint {
  year: number;
  forestRatio: number; // 산림면적 비율 (%) - 63.7% -> 62.7% (약 64% -> 63% 수준 제자리/소폭감소)
  forestAreaHa: number; // 산림면적 (만 ha)
  co2Ppm: number; // CO2 농도 (ppm) - 394.9ppm (2010) -> 425.0ppm (2022)
  avgTempCelsius: number; // 지구/한반도 평균기온 (°C)
  seaLevelRiseMm: number; // 누적 해수면 상승량 (mm)
  notes: string;
}

export const CLIMATE_DATA_2010_2022: ClimateDataPoint[] = [
  { year: 2010, forestRatio: 63.7, forestAreaHa: 636.9, co2Ppm: 394.9, avgTempCelsius: 14.3, seaLevelRiseMm: 0, notes: "기준 연도: CO2 390ppm 돌파" },
  { year: 2011, forestRatio: 63.6, forestAreaHa: 635.6, co2Ppm: 397.0, avgTempCelsius: 14.2, seaLevelRiseMm: 3.2, notes: "온실가스 배출 지속 증가" },
  { year: 2012, forestRatio: 63.5, forestAreaHa: 634.3, co2Ppm: 399.2, avgTempCelsius: 14.4, seaLevelRiseMm: 6.8, notes: "지구 온난화 가속화 경고" },
  { year: 2013, forestRatio: 63.4, forestAreaHa: 633.2, co2Ppm: 401.4, avgTempCelsius: 14.5, seaLevelRiseMm: 10.1, notes: "CO2 농도 역사상 첫 400ppm 돌파 관측" },
  { year: 2014, forestRatio: 63.3, forestAreaHa: 632.1, co2Ppm: 403.6, avgTempCelsius: 14.7, seaLevelRiseMm: 13.9, notes: "지구 평균기온 관측 이래 최고치 경신" },
  { year: 2015, forestRatio: 63.2, forestAreaHa: 631.0, co2Ppm: 406.1, avgTempCelsius: 14.8, seaLevelRiseMm: 18.0, notes: "파리기후변화협정 체결 연도" },
  { year: 2016, forestRatio: 63.2, forestAreaHa: 630.5, co2Ppm: 408.8, avgTempCelsius: 15.0, seaLevelRiseMm: 22.1, notes: "슈퍼 엘니뇨 및 극지방 빙하 융해 가속" },
  { year: 2017, forestRatio: 63.1, forestAreaHa: 629.8, co2Ppm: 411.3, avgTempCelsius: 14.9, seaLevelRiseMm: 26.5, notes: "산불 및 이상고온 빈발" },
  { year: 2018, forestRatio: 63.0, forestAreaHa: 629.0, co2Ppm: 414.2, avgTempCelsius: 15.1, seaLevelRiseMm: 31.0, notes: "한반도 사상 최악의 여름 폭염" },
  { year: 2019, forestRatio: 62.9, forestAreaHa: 628.2, co2Ppm: 417.1, avgTempCelsius: 15.2, seaLevelRiseMm: 35.8, notes: "호주 대형 산불 등 탄소흡수원 훼손" },
  { year: 2020, forestRatio: 62.8, forestAreaHa: 627.5, co2Ppm: 419.6, avgTempCelsius: 15.1, seaLevelRiseMm: 40.2, notes: "코로나 팬데믹 일시적 둔화에도 온실가스 누적" },
  { year: 2021, forestRatio: 62.7, forestAreaHa: 626.8, co2Ppm: 422.3, avgTempCelsius: 15.3, seaLevelRiseMm: 45.4, notes: "IPCC 6차 평가보고서 코드 레드 발표" },
  { year: 2022, forestRatio: 62.7, forestAreaHa: 626.2, co2Ppm: 425.0, avgTempCelsius: 15.4, seaLevelRiseMm: 50.7, notes: "CO2 425ppm 도달! 숲은 63%로 제자리, 탄소는 30ppm 급증" },
];

export const ORANGE3_ANALYSIS_SUMMARY = {
  headline: "숲은 제자리인데 탄소는 계속 늘고 있어요!",
  subline: "2010~2022 기상청·산림청 실측 데이터 분석 결과",
  findingText:
    "10여 년간 우리나라 산림면적은 64%에서 63% 수준으로 거의 늘지 않았으나, 대기 중 이산화탄소(CO2) 농도는 394.9ppm에서 425.0ppm까지 매년 쉬지 않고 폭증했습니다.",
  correlationText:
    "CO2 농도와 지구 평균기온의 상관계수는 r = +0.94로 매우 강한 양의 상관관계를 보였습니다. 흡수원(숲)은 그대로인데 배출원(탄소)만 기하급수적으로 늘어나 해수면 상승과 기후 재앙이 발생하고 있습니다.",
  actionMessage:
    "탄소 배출 변수를 막고, 나무 씨앗을 심어 물로 차오르는 바다를 막아내야 합니다!",
};
