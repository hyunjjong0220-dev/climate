import React from 'react';
import { RotateCcw, AlertOctagon, HeartHandshake, Award } from 'lucide-react';

interface GameOverComicModalProps {
  onRetry: () => void;
  stage: number;
  score: number;
  onOpenCertificate?: () => void;
}

export const GameOverComicModal: React.FC<GameOverComicModalProps> = ({
  onRetry,
  stage,
  score,
  onOpenCertificate,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border-2 border-rose-500/80 rounded-2xl shadow-2xl p-5 sm:p-6 text-slate-100 max-h-[95vh] overflow-y-auto">
        {/* Top Warning Banner */}
        <div className="flex items-center justify-between border-b border-rose-500/30 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/40">
              <AlertOctagon className="w-6 h-6" />
            </span>
            <div>
              <div className="text-xs uppercase tracking-wider text-rose-400 font-bold">
                CLIMATE CRISIS IMMERSION
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-rose-400 font-['DungGeunMo']">
                바닷물이 차올랐습니다! (재도전 가능)
              </h2>
            </div>
          </div>
          <div className="text-right text-xs text-slate-400">
            도달 단계: <strong className="text-amber-400 font-mono text-sm">{stage}단계</strong>
          </div>
        </div>

        {/* Core Phrase */}
        <div className="my-4 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-rose-950/80 border-2 border-emerald-500/60 text-center">
          <span className="text-xs text-emerald-400 tracking-widest font-semibold block uppercase">
            REMEMBER OUR PLANET
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-emerald-300 font-['DungGeunMo'] tracking-wide mt-0.5">
            🌲 &ldquo;우리가 지켜야 할 숲&rdquo; 🌲
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            숲이 줄어들면 바다가 차오릅니다. 현실의 지구를 지킬 시간은 바로 지금입니다.
          </p>
        </div>

        {/* 4-Cut Climate Crisis Educational Webtoon */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-3">
          {/* Cut 1 */}
          <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-1 border-b border-slate-800">
              <span className="font-bold text-rose-400 font-mono">CUT #1</span>
              <span>해수면 상승</span>
            </div>
            <div className="py-4 text-center">
              <div className="text-5xl my-1">🏙️🌊🚗</div>
              <div className="text-xs font-bold text-slate-200 mt-2">
                &ldquo;멈추지 않는 자가용과 해안 도시 침수&rdquo;
              </div>
            </div>
            <p className="text-[11px] text-slate-400 bg-slate-900 p-2 rounded-lg leading-relaxed">
              탄소 배출로 지구 온도가 상승하여 바닷물이 팽창하고 있습니다. 매년 높아지는 파도가 우리의 삶터를 위협합니다.
            </p>
          </div>

          {/* Cut 2 */}
          <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-1 border-b border-slate-800">
              <span className="font-bold text-cyan-400 font-mono">CUT #2</span>
              <span>극지방의 비명</span>
            </div>
            <div className="py-4 text-center">
              <div className="text-5xl my-1">🐻‍❄️🧊💧</div>
              <div className="text-xs font-bold text-slate-200 mt-2">
                &ldquo;녹아내린 얼음 위의 북극곰 가족&rdquo;
              </div>
            </div>
            <p className="text-[11px] text-slate-400 bg-slate-900 p-2 rounded-lg leading-relaxed">
              수천 년간 굳건했던 극지 빙하가 무너지며 서식지가 사라집니다. 깨어난 빙하거인의 분노는 결국 우리에게 돌아옵니다.
            </p>
          </div>

          {/* Cut 3 */}
          <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-1 border-b border-slate-800">
              <span className="font-bold text-amber-400 font-mono">CUT #3</span>
              <span>데이터의 경고</span>
            </div>
            <div className="py-4 text-center">
              <div className="text-5xl my-1">📉🔥🏭</div>
              <div className="text-xs font-bold text-slate-200 mt-2">
                &ldquo;숲은 63% 제자리, 탄소는 425ppm 돌파&rdquo;
              </div>
            </div>
            <p className="text-[11px] text-slate-400 bg-slate-900 p-2 rounded-lg leading-relaxed">
              우리가 분석한 Orange3 데이터처럼, 탄소를 흡수할 숲은 늘지 못하는데 공장과 화석연료 배출만 멈추지 않았습니다.
            </p>
          </div>

          {/* Cut 4 */}
          <div className="bg-slate-950 rounded-xl p-3.5 border border-emerald-500/40 flex flex-col justify-between bg-gradient-to-b from-slate-950 to-emerald-950/30">
            <div className="flex items-center justify-between text-xs text-emerald-400 pb-1 border-b border-emerald-800/40">
              <span className="font-bold text-emerald-300 font-mono">CUT #4</span>
              <span>우리의 실천</span>
            </div>
            <div className="py-4 text-center">
              <div className="text-5xl my-1 animate-bounce">🌱🤝🌍</div>
              <div className="text-xs font-bold text-emerald-300 mt-2">
                &ldquo;나무 한 그루 심기, 대중교통 이용하기&rdquo;
              </div>
            </div>
            <p className="text-[11px] text-emerald-200 bg-emerald-950/50 p-2 rounded-lg leading-relaxed">
              다시 도전하세요! 씨앗을 심어 숲을 가꾸고, 배출 요소를 정화하면 바다는 다시 안전해집니다!
            </p>
          </div>
        </div>

        {/* Retry Action Button */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>누적 점수: <strong className="text-yellow-400 font-mono text-sm">{score.toLocaleString()}점</strong> (클라우드 명예의 전당 저장됨)</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {onOpenCertificate && (
              <button
                onClick={onOpenCertificate}
                className="px-4 py-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold rounded-xl text-xs transition flex items-center gap-1.5 font-['DungGeunMo'] cursor-pointer"
              >
                <Award className="w-4 h-4" /> 내 이수증 보기
              </button>
            )}

            <button
              onClick={onRetry}
              className="flex-1 sm:flex-initial px-7 py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-sm shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 transition font-['DungGeunMo'] cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> 다시 숲을 지키러 가기 (재도전)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
