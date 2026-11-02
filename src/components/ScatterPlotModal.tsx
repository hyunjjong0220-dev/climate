import React from 'react';
import { CLIMATE_DATA_2010_2022, ORANGE3_ANALYSIS_SUMMARY } from '../data/climateData';
import { X, TrendingUp, AlertTriangle, Trees, Flame } from 'lucide-react';

interface ScatterPlotModalProps {
  onClose: () => void;
}

export const ScatterPlotModal: React.FC<ScatterPlotModalProps> = ({ onClose }) => {
  // Min / Max for scatter normalization
  const minCo2 = 390;
  const maxCo2 = 430;
  const minForest = 62.0;
  const maxForest = 64.0;
  const minTemp = 14.0;
  const maxTemp = 15.6;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border-2 border-emerald-500/80 rounded-2xl shadow-2xl p-6 text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <TrendingUp className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-emerald-300 font-['DungGeunMo'] tracking-wide">
                📊 기후 데이터 분석 리포트 (Orange3)
              </h2>
              <p className="text-xs text-slate-400">
                기상청 기후변화감시센터 & 산림청 산림통계 (2010 ~ 2022 실측)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Core Headline Banner */}
        <div className="my-5 p-4 rounded-xl bg-gradient-to-r from-amber-950/70 via-red-950/50 to-emerald-950/70 border border-amber-500/40">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-base font-bold text-amber-300 font-['DungGeunMo']">
                &ldquo;{ORANGE3_ANALYSIS_SUMMARY.headline}&rdquo;
              </div>
              <p className="text-xs sm:text-sm text-slate-200 mt-1 leading-relaxed">
                {ORANGE3_ANALYSIS_SUMMARY.findingText}
              </p>
              <div className="mt-2 text-xs text-emerald-300 font-semibold flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                {ORANGE3_ANALYSIS_SUMMARY.correlationText}
              </div>
            </div>
          </div>
        </div>

        {/* Visual Scatter Plot Canvas / Graph */}
        <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-300 mb-2 gap-2">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                산림 면적 비율 (64% ➔ 63% 제자리)
              </span>
              <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
                CO2 농도 (394.9 ➔ 425.0 ppm 폭증)
              </span>
            </div>
            <div className="text-slate-400">
              상관계수: <span className="text-amber-400 font-bold">r = +0.94</span> (강한 양의 상관)
            </div>
          </div>

          {/* SVG Scatter Plot */}
          <div className="w-full h-64 sm:h-72 relative">
            <svg viewBox="0 0 700 280" className="w-full h-full">
              {/* Grid Lines */}
              {[60, 110, 160, 210].map((y) => (
                <line
                  key={y}
                  x1="50"
                  y1={y}
                  x2="670"
                  y2={y}
                  stroke="#334155"
                  strokeDasharray="4 4"
                  strokeWidth="0.8"
                />
              ))}

              {/* Axes */}
              <line x1="50" y1="230" x2="670" y2="230" stroke="#64748b" strokeWidth="1.5" />
              <line x1="50" y1="30" x2="50" y2="230" stroke="#64748b" strokeWidth="1.5" />
              <line x1="670" y1="30" x2="670" y2="230" stroke="#64748b" strokeWidth="1.5" />

              {/* Y Axis Labels */}
              <text x="15" y="45" fill="#f43f5e" fontSize="10" fontWeight="bold">CO2(ppm)</text>
              <text x="40" y="40" fill="#94a3b8" fontSize="9" textAnchor="end">430</text>
              <text x="40" y="130" fill="#94a3b8" fontSize="9" textAnchor="end">410</text>
              <text x="40" y="225" fill="#94a3b8" fontSize="9" textAnchor="end">390</text>

              <text x="675" y="45" fill="#10b981" fontSize="10" fontWeight="bold">산림률(%)</text>
              <text x="675" y="70" fill="#94a3b8" fontSize="9">64%</text>
              <text x="675" y="150" fill="#94a3b8" fontSize="9">63.5%</text>
              <text x="675" y="225" fill="#94a3b8" fontSize="9">62.5%</text>

              {/* Points & Trendlines */}
              {/* CO2 Line (Red) */}
              <path
                d={CLIMATE_DATA_2010_2022.map((d, i) => {
                  const x = 70 + (i / (CLIMATE_DATA_2010_2022.length - 1)) * 580;
                  const normCo2 = (d.co2Ppm - minCo2) / (maxCo2 - minCo2);
                  const y = 220 - normCo2 * 180;
                  return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                }).join(' ')}
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2.5"
              />

              {/* Forest Ratio Line (Green) */}
              <path
                d={CLIMATE_DATA_2010_2022.map((d, i) => {
                  const x = 70 + (i / (CLIMATE_DATA_2010_2022.length - 1)) * 580;
                  const normForest = (d.forestRatio - minForest) / (maxForest - minForest);
                  const y = 220 - normForest * 150;
                  return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                }).join(' ')}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeDasharray="5 3"
              />

              {/* Points on each year */}
              {CLIMATE_DATA_2010_2022.map((d, i) => {
                const x = 70 + (i / (CLIMATE_DATA_2010_2022.length - 1)) * 580;
                const normCo2 = (d.co2Ppm - minCo2) / (maxCo2 - minCo2);
                const yCo2 = 220 - normCo2 * 180;

                const normForest = (d.forestRatio - minForest) / (maxForest - minForest);
                const yForest = 220 - normForest * 150;

                return (
                  <g key={d.year}>
                    {/* X Axis year labels */}
                    <text x={x} y="248" fill="#cbd5e1" fontSize="9" textAnchor="middle">
                      {d.year % 2 === 0 ? `'${String(d.year).slice(2)}` : ''}
                    </text>

                    {/* CO2 red dot */}
                    <circle cx={x} cy={yCo2} r="4" fill="#f43f5e" stroke="#fff" strokeWidth="1" />
                    {/* Forest green dot */}
                    <circle cx={x} cy={yForest} r="4" fill="#10b981" stroke="#fff" strokeWidth="1" />
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Data Table Preview */}
        <div className="mt-4 border border-slate-800 rounded-xl overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800 text-slate-200">
              <tr>
                <th className="py-2 px-3">연도</th>
                <th className="py-2 px-3">산림 비율(%)</th>
                <th className="py-2 px-3">CO2 농도(ppm)</th>
                <th className="py-2 px-3">평균기온(°C)</th>
                <th className="py-2 px-3">핵심 현상</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {CLIMATE_DATA_2010_2022.filter((_, idx) => idx % 2 === 0 || idx === 12).map((item) => (
                <tr key={item.year} className="hover:bg-slate-800/50">
                  <td className="py-2 px-3 font-semibold text-emerald-400">{item.year}년</td>
                  <td className="py-2 px-3 text-emerald-300">{item.forestRatio}%</td>
                  <td className="py-2 px-3 text-rose-400 font-bold">{item.co2Ppm} ppm</td>
                  <td className="py-2 px-3 text-amber-300">{item.avgTempCelsius}°C</td>
                  <td className="py-2 px-3 text-slate-400">{item.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Educational Conclusion */}
        <div className="mt-5 p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-300">
            <div className="font-bold text-emerald-400 text-sm mb-1 flex items-center gap-1.5">
              <Trees className="w-4 h-4" /> 기후 게임 연계 규칙 안내
            </div>
            게임 속에서 탄소 배출물(차량·공장)을 피하지 못하면 온실가스가 누적되어 <span className="text-blue-400 font-bold">바닷물이 상승</span>합니다.
            <span className="text-emerald-300 font-bold"> 씨앗을 심으면</span> 숲의 탄소 흡수량이 늘어나 바닷물 높이가 낮아집니다!
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition shadow-lg shrink-0 font-['DungGeunMo']"
          >
            확인하고 게임하기
          </button>
        </div>
      </div>
    </div>
  );
};
