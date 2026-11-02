import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, Sparkles, ArrowRight, Printer, Trees, Flame } from 'lucide-react';

interface HeroEndingModalProps {
  stage: number;
  score: number;
  coins: number;
  nickname: string;
  onContinue: () => void;
  onOpenShop?: () => void;
  onOpenCertificate: () => void;
}

export const HeroEndingModal: React.FC<HeroEndingModalProps> = ({
  stage,
  score,
  coins,
  nickname,
  onContinue,
  onOpenShop,
  onOpenCertificate,
}) => {
  const isMaster = stage >= 50;

  useEffect(() => {
    // Joyful celebration confetti
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
      setTimeout(() => {
        confetti({
          particleCount: 80,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 80,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 350);
    } catch {}
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-emerald-400 rounded-2xl shadow-2xl p-6 text-slate-100 text-center animate-in fade-in zoom-in-95 duration-300">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-bold text-xs mb-3">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          {isMaster ? '🏆 기후위기 막기 마스터 달성!' : '🎉 5단계 클리어 & 이수 자격 획득!'}
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-300 font-['DungGeunMo']">
          {isMaster ? '기후위기 극복 마스터 레벨' : '기후 히어로 이수 완료'}
        </h1>

        <p className="text-sm text-slate-300 mt-2 max-w-lg mx-auto">
          {isMaster
            ? '모든 50단계를 극복하고 지구열화의 위협을 물리쳤습니다! 이제 무한 마스터 모드와 상점이 개방됩니다!'
            : '빙하거인의 파도를 뚫고 주요 기후 방어선을 사수했습니다! 위기 탈출 교육 이수증이 정식 발급되었습니다.'}
        </p>

        {/* Certificate Style Box */}
        <div className="my-5 p-5 bg-gradient-to-b from-slate-950 to-slate-900 rounded-xl border border-emerald-500/40 shadow-inner text-left space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-400" />
              <span className="font-['DungGeunMo'] text-emerald-300 font-bold text-base">
                기후 수호자 인증서 (Climate Guardian)
              </span>
            </div>
            <span className="text-xs font-mono text-slate-400">STAGE {stage}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2.5 bg-slate-800/80 rounded-lg">
              <span className="text-slate-400 block text-[11px]">수호용사</span>
              <strong className="text-emerald-400 text-sm font-semibold truncate block">
                {nickname || '기후용사'}
              </strong>
            </div>
            <div className="p-2.5 bg-slate-800/80 rounded-lg">
              <span className="text-slate-400 block text-[11px]">클리어 단계</span>
              <strong className="text-amber-400 text-sm font-mono">{stage}단계</strong>
            </div>
            <div className="p-2.5 bg-slate-800/80 rounded-lg">
              <span className="text-slate-400 block text-[11px]">누적 점수</span>
              <strong className="text-cyan-400 text-sm font-mono">{score.toLocaleString()}점</strong>
            </div>
            <div className="p-2.5 bg-slate-800/80 rounded-lg">
              <span className="text-slate-400 block text-[11px]">보유 에코 코인</span>
              <strong className="text-yellow-400 text-sm font-mono">🪙 {coins}개</strong>
            </div>
          </div>

          <p className="text-xs text-slate-300 italic pt-1 leading-relaxed">
            &ldquo;산림면적은 63% 수준으로 제자리였으나, 당신의 용기와 실천으로 탄소를 상쇄하고 바다를 안전하게 되돌려 놓았습니다.&rdquo;
          </p>
        </div>

        {/* Master Mode Announcement */}
        {isMaster && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 font-medium my-3">
            ✨ 기후위기 막기 마스터 특권: 모은 코인으로 태양광 레이저, 맹그로브 방파제, 탄소 드론 등 강력한 스킬과 무기를 해금하여 무한 챌린지에 도전하세요!
          </div>
        )}

        {/* Buttons */}
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onOpenCertificate}
            className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-sm transition font-['DungGeunMo'] shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>🎓 내 이수증 발급 & 출력하기</span>
          </button>

          {onOpenShop && isMaster && (
            <button
              onClick={onOpenShop}
              className="w-full sm:w-auto px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition font-['DungGeunMo'] shadow-lg cursor-pointer"
            >
              🛍️ 에코 상점 열기
            </button>
          )}

          <button
            onClick={onContinue}
            className="w-full sm:w-auto px-7 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-sm transition font-['DungGeunMo'] flex items-center justify-center gap-2 cursor-pointer"
          >
            {isMaster ? '무한 마스터 스테이지 계속하기' : '다음 단계 도전하기'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
