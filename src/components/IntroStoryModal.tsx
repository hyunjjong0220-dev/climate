import React, { useState } from 'react';
import {
  Flame,
  Waves,
  Shield,
  ArrowRight,
  ArrowLeft,
  Keyboard,
  Trees,
  CheckCircle2,
  Gamepad2,
  Sparkles,
} from 'lucide-react';

interface IntroStoryModalProps {
  onStartGame: () => void;
}

export const IntroStoryModal: React.FC<IntroStoryModalProps> = ({ onStartGame }) => {
  const [slide, setSlide] = useState(0);

  const slides = [
    {
      title: '🚨 프롤로그: 지구열화(Global Boiling)의 습격',
      badge: '위기의 지구',
      badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      icon: <Flame className="w-8 h-8 text-rose-400" />,
      content: (
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden border border-rose-500/30 bg-gradient-to-b from-slate-900 to-rose-950/40 p-5">
            <div className="text-4xl sm:text-5xl text-center py-4">
              🌊 🔥 🏭 🚗
            </div>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
              지구의 평균기온이 가파르게 치솟으며 남극과 북극의 빙하가 무서운 속도로 녹아내리고 있습니다.
              대기 중 <strong className="text-rose-400">CO2 농도는 425ppm</strong>을 넘어섰고,
              바다는 끝없이 팽창하여 해수면이 수직 상승하고 있습니다!
            </p>
          </div>
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs sm:text-sm text-slate-300">
            💡 우리가 Orange3로 분석한 결과: <strong className="text-amber-300">&ldquo;숲의 면적은 10여 년간 63% 수준으로 제자리인데, 탄소는 계속 늘어났다&rdquo;</strong>는 충격적인 진실을 발견했습니다!
          </div>
        </div>
      ),
    },
    {
      title: '❄️ 사악한 악당: 빙하거인의 탄생',
      badge: '보스 경보',
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      icon: <Waves className="w-8 h-8 text-cyan-400" />,
      content: (
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden border border-cyan-500/30 bg-gradient-to-b from-slate-900 to-cyan-950/40 p-5">
            <div className="text-4xl sm:text-5xl text-center py-4">
              👹 🌪️ 🧊 🌊
            </div>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
              녹아내린 극지방 빙하 속에서 지구 온난화의 분노로 빚어진 악당, <strong className="text-cyan-300">‘빙하거인(Glacier Titan)’</strong>이 눈을 떴습니다!
              빙하거인은 석탄 매연과 뜨거운 열풍을 일으키며 거대한 파도로 육지를 집어삼키려 합니다.
            </p>
          </div>
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs sm:text-sm text-slate-300">
            ⚠️ 5레벨마다 등장하는 빙하거인을 막지 못하면 바닷물이 급속도로 차오릅니다!
          </div>
        </div>
      ),
    },
    {
      title: '🛡️ 산림의 수호용사: 에코 가디언 출격!',
      badge: '플레이어의 사명',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      icon: <Shield className="w-8 h-8 text-emerald-400" />,
      content: (
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden border border-emerald-500/30 bg-gradient-to-b from-slate-900 to-emerald-950/40 p-5 text-center">
            {/* Cute Pixel Guardian Avatar */}
            <div className="inline-block p-4 bg-emerald-950/60 rounded-2xl border-2 border-emerald-400 shadow-lg shadow-emerald-500/20 mb-3">
              <div className="text-5xl animate-bounce">🧑‍🌾🌱✨</div>
            </div>
            <h4 className="text-lg font-bold text-emerald-300 font-['DungGeunMo']">에코 가디언 (Eco Guardian)</h4>
            <p className="text-xs sm:text-sm text-slate-200 mt-2 leading-relaxed">
              자연의 신비로운 힘을 간직한 수호용사!
              탄소 배출 변수를 재빠르게 피하고, 대지에 <strong className="text-emerald-400">생명의 씨앗</strong>을 심어
              차오르는 바닷물을 낮추는 유일한 희망입니다!
            </p>
          </div>
        </div>
      ),
    },
    {
      title: '🎮 조작키 & 핵심 규칙 가이드',
      badge: '게임 방법',
      badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      icon: <Gamepad2 className="w-8 h-8 text-indigo-400" />,
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700">
              <div className="font-bold text-amber-300 flex items-center gap-1.5 mb-1.5">
                <Keyboard className="w-4 h-4" /> PC 키보드 조작
              </div>
              <ul className="space-y-1 text-slate-200">
                <li>• <strong className="text-white">← → 또는 A D</strong> : 좌우 이동</li>
                <li>• <strong className="text-white">↑ 또는 스페이스바</strong> : 높이 점프</li>
                <li>• <strong className="text-white">Z 키</strong> : 씨앗/정화 빔 발사</li>
              </ul>
            </div>

            <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700">
              <div className="font-bold text-cyan-300 flex items-center gap-1.5 mb-1.5">
                <Sparkles className="w-4 h-4" /> 모바일 & 태블릿
              </div>
              <p className="text-slate-300">
                화면 하단에 표시되는 가상 방향 패드와 <strong className="text-white">[점프]</strong>, <strong className="text-white">[씨앗 발사]</strong> 터치 버튼으로 완벽 조작 지원!
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-900 rounded-xl border border-emerald-500/30 space-y-2 text-xs">
            <div className="font-bold text-emerald-400 flex items-center gap-1">
              <Trees className="w-4 h-4" /> 핵심 클리어 규칙
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-300">
              <div className="p-2 bg-slate-800 rounded-lg">
                <span className="text-rose-400 font-bold">🚫 탄소 변수 충돌:</span> 바닷물이 약간 차오르지만 부력 수영 & 에코 구조 드론이 안전 보호!
              </div>
              <div className="p-2 bg-slate-800 rounded-lg">
                <span className="text-emerald-400 font-bold">🌱 씨앗 획득:</span> 해수면 높이 즉각 감소 & 숲의 탄소 흡수력 강화
              </div>
              <div className="p-2 bg-slate-800 rounded-lg">
                <span className="text-blue-400 font-bold">🏁 등대 도착:</span> 레벨 클리어 (5단계 달성 시 공식 교육 이수증 발급!)
              </div>
              <div className="p-2 bg-slate-800 rounded-lg">
                <span className="text-yellow-400 font-bold">🪙 에코 코인:</span> 무기/스킬 상점에서 장비 구매 & 랭킹 등록
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const current = slides[slide];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-emerald-500/80 rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col justify-between min-h-[460px]">
        {/* Top Header */}
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-800 rounded-xl">{current.icon}</div>
              <div>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${current.badgeColor}`}
                >
                  {current.badge}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white font-['DungGeunMo'] mt-0.5">
                  {current.title}
                </h3>
              </div>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              {slide + 1} / {slides.length}
            </div>
          </div>

          {/* Slide Body */}
          <div className="mt-4">{current.content}</div>
        </div>

        {/* Bottom Nav Controls */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={() => setSlide((prev) => Math.max(0, prev - 1))}
            disabled={slide === 0}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition ${
              slide === 0
                ? 'opacity-30 cursor-not-allowed bg-slate-800 text-slate-500'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <ArrowLeft className="w-4 h-4" /> 이전
          </button>

          {/* Step dots */}
          <div className="flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSlide(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  idx === slide ? 'bg-emerald-400 w-6' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>

          {slide < slides.length - 1 ? (
            <button
              onClick={() => setSlide((prev) => Math.min(slides.length - 1, prev + 1))}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition font-['DungGeunMo'] shadow-lg shadow-emerald-500/20"
            >
              다음 <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onStartGame}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center gap-2 transition font-['DungGeunMo'] shadow-xl shadow-emerald-500/30 animate-pulse"
            >
              <CheckCircle2 className="w-5 h-5" /> 출동! 게임 시작하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
