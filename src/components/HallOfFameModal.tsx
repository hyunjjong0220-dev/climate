import React, { useEffect, useState } from 'react';
import {
  Trophy,
  Award,
  Trees,
  Sparkles,
  Flame,
  CheckCircle2,
  X,
  RotateCcw,
  User,
  Medal,
} from 'lucide-react';
import { HallOfFameItem, subscribeHallOfFameList } from '../lib/gameSync';

interface HallOfFameModalProps {
  currentNickname: string;
  onClose: () => void;
  onOpenCertificate: (nick: string, stage: number, score: number, trees: number, certNo?: string) => void;
}

export const HallOfFameModal: React.FC<HallOfFameModalProps> = ({
  currentNickname,
  onClose,
  onOpenCertificate,
}) => {
  const [records, setRecords] = useState<HallOfFameItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Subscribe to live Firebase Hall of Fame updates
    const unsubscribe = subscribeHallOfFameList((items) => {
      setRecords(items);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border-2 border-amber-400/80 rounded-2xl shadow-2xl p-4 sm:p-6 text-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-500/40">
              <Trophy className="w-6 h-6 text-amber-400" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-amber-300 font-['DungGeunMo']">
                  명예의 전당 (Hall of Fame)
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold hidden sm:inline-block">
                  파이어베이스 실시간 누적 연동
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                기후위기 탈출 시뮬레이션에 참여한 모든 학생들의 누적 랭킹입니다.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Student Quick Status */}
        {currentNickname && (
          <div className="my-3 p-3 bg-gradient-to-r from-emerald-950/80 to-slate-900 rounded-xl border border-emerald-500/40 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-base">🧑‍🌾</span>
              <span>
                현재 접속 용사: <strong className="text-emerald-300 font-bold">{currentNickname}</strong>
              </span>
            </div>
            <span className="text-slate-400 text-[11px]">
              * 스테이지를 클리어하거나 점수를 획득하면 실시간으로 순위표에 반영됩니다!
            </span>
          </div>
        )}

        {/* Records Table / List */}
        <div className="flex-1 overflow-y-auto my-2 pr-1 space-y-2">
          {isLoading ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs">명예의 전당 기록을 실시간 불러오는 중...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-4xl">🌱</span>
              <p className="text-sm font-bold text-slate-300">
                아직 등록된 기후 영웅이 없습니다!
              </p>
              <p className="text-xs text-slate-500">
                게임을 시작하여 첫 번째로 명예의 전당에 이름을 새겨보세요!
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {records.map((item, index) => {
                const isTop3 = index < 3;
                const isCurrent =
                  item.nickname.trim().toLowerCase() ===
                  currentNickname.trim().toLowerCase();

                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 text-xs ${
                      isCurrent
                        ? 'bg-emerald-950/50 border-emerald-500/80 shadow-md shadow-emerald-500/10'
                        : isTop3
                        ? 'bg-slate-950/80 border-amber-500/40'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Rank & Nickname */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-black font-['DungGeunMo'] shrink-0 ${
                          index === 0
                            ? 'bg-yellow-400 text-slate-950 shadow-md shadow-yellow-500/30'
                            : index === 1
                            ? 'bg-slate-300 text-slate-950'
                            : index === 2
                            ? 'bg-amber-600 text-slate-950'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {index + 1}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <strong
                            className={`truncate block font-bold text-sm ${
                              isCurrent ? 'text-emerald-300' : 'text-slate-100'
                            }`}
                          >
                            {item.nickname}
                          </strong>
                          {isCurrent && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-slate-950 font-black text-[10px]">
                              나
                            </span>
                          )}
                          {item.completed && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold text-[10px] hidden sm:inline">
                              이수완료
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 block truncate">
                          {item.badge}
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-3 sm:gap-6 text-right shrink-0">
                      <div>
                        <span className="text-[10px] text-slate-400 block">단계</span>
                        <strong className="text-amber-300 font-mono text-xs sm:text-sm">
                          {item.stage >= 50 ? '마스터' : `${item.stage}단계`}
                        </strong>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block">점수</span>
                        <strong className="text-emerald-400 font-mono text-xs sm:text-sm">
                          {item.score.toLocaleString()}점
                        </strong>
                      </div>

                      <div className="hidden sm:block">
                        <span className="text-[10px] text-slate-400 block">심은 나무</span>
                        <strong className="text-teal-300 font-mono text-xs">
                          🌲 {item.treesPlanted || Math.max(10, item.stage * 4)}
                        </strong>
                      </div>

                      {/* Certificate Trigger Button */}
                      <button
                        onClick={() =>
                          onOpenCertificate(
                            item.nickname,
                            item.stage,
                            item.score,
                            item.treesPlanted || Math.max(10, item.stage * 4),
                            item.certificateNo
                          )
                        }
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg border border-amber-500/30 text-[11px] font-semibold flex items-center gap-1 transition"
                        title="이수증 확인"
                      >
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        <span className="hidden sm:inline">이수증</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            총 <strong className="text-amber-300 font-mono">{records.length}명</strong>의 기후 수호자가 등록되었습니다.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
