import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchStudentRecordByNickname,
  saveStudentRecord,
  StudentGameData,
  generateCertificateNo,
  getHonorBadge,
} from './lib/gameSync';
import { ORANGE3_ANALYSIS_SUMMARY, CLIMATE_DATA_2010_2022 } from './data/climateData';
import { GameCanvas } from './components/GameCanvas';
import { ScatterPlotModal } from './components/ScatterPlotModal';
import { IntroStoryModal } from './components/IntroStoryModal';
import { GameOverComicModal } from './components/GameOverComicModal';
import { HeroEndingModal } from './components/HeroEndingModal';
import { MasterShopModal } from './components/MasterShopModal';
import { CompletionCertificateModal } from './components/CompletionCertificateModal';
import { HallOfFameModal } from './components/HallOfFameModal';
import {
  TrendingUp,
  Award,
  Sparkles,
  ShoppingBag,
  RotateCcw,
  BookOpen,
  CloudSun,
  Flame,
  Trees,
  Download,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Trophy,
  Printer,
  ShieldCheck,
  User,
} from 'lucide-react';

export default function App() {
  // Screen routing
  const [screen, setScreen] = useState<'login' | 'game'>('login');

  // Student Nickname and progress state (No management code required)
  const [nickname, setNickname] = useState('');
  const [stage, setStage] = useState(1);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [inventory, setInventory] = useState<string[]>([]);
  const [treesPlanted, setTreesPlanted] = useState(0);
  const [certificateNo, setCertificateNo] = useState('');
  const [temperature, setTemperature] = useState(14.3);
  const [co2, setCo2] = useState(394.9);
  const [lastPlayedAt, setLastPlayedAt] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>('');

  // Modals state
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [showScatterModal, setShowScatterModal] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [showHeroEndingModal, setShowHeroEndingModal] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showHallOfFameModal, setShowHallOfFameModal] = useState(false);

  // Inspected certificate data (when viewing from Hall of Fame or self)
  const [inspectedCertData, setInspectedCertData] = useState<{
    nickname: string;
    stage: number;
    score: number;
    trees: number;
    certNo?: string;
  } | null>(null);

  // Auto-fill nickname from localStorage on load if available
  useEffect(() => {
    const savedNick = localStorage.getItem('last_eco_nickname');
    if (savedNick) {
      setNickname(savedNick);
    }
  }, []);

  // Sync Student Record when stage/score changes to Firebase Firestore (Hall of Fame)
  const persistProgress = useCallback(
    async (
      newStage: number,
      newScore: number,
      newCoins: number,
      newInventory?: string[],
      additionalTrees = 4
    ) => {
      const cleanNick = nickname.trim();
      if (!cleanNick) return;

      const updatedTemp = parseFloat((14.3 + (newStage - 1) * 0.04).toFixed(2));
      const updatedCo2 = parseFloat((394.9 + (newStage - 1) * 1.2).toFixed(1));
      const totalTrees = treesPlanted + additionalTrees;
      const certId = certificateNo || generateCertificateNo(cleanNick);

      setStage(newStage);
      setScore(newScore);
      setCoins(newCoins);
      setTemperature(updatedTemp);
      setCo2(updatedCo2);
      setTreesPlanted(totalTrees);
      setCertificateNo(certId);
      if (newInventory) setInventory(newInventory);

      const record: StudentGameData = {
        nickname: cleanNick,
        stage: newStage,
        score: newScore,
        coins: newCoins,
        inventory: newInventory || inventory,
        treesPlanted: totalTrees,
        temperature: updatedTemp,
        co2: updatedCo2,
        badge: getHonorBadge(newStage, newScore),
        certificateNo: certId,
        completed: newStage >= 5,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      setIsSyncing(true);
      const ok = await saveStudentRecord(record);
      setIsSyncing(false);
      if (ok) {
        setSyncStatus('파이어베이스 명예의 전당 실시간 누적 완료');
        setTimeout(() => setSyncStatus(''), 2500);
      }
    },
    [nickname, inventory, treesPlanted, certificateNo]
  );

  // Handle Login & Load Record
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNick = nickname.trim();
    if (!cleanNick) {
      alert('학생 닉네임(이름 또는 별명)을 입력해주세요.');
      return;
    }

    localStorage.setItem('last_eco_nickname', cleanNick);
    setIsSyncing(true);
    setSyncStatus('명예의 전당 기록 조회 중...');

    // Fetch existing record by nickname from Firebase
    const existing = await fetchStudentRecordByNickname(cleanNick);
    setIsSyncing(false);

    if (existing) {
      setStage(existing.stage || 1);
      setScore(existing.score || 0);
      setCoins(existing.coins || 0);
      setInventory(existing.inventory || []);
      setTreesPlanted(existing.treesPlanted || 10);
      setCertificateNo(existing.certificateNo || generateCertificateNo(cleanNick));
      setTemperature(existing.temperature || 14.3);
      setCo2(existing.co2 || 394.9);
      setLastPlayedAt(existing.updatedAt || '');
      setSyncStatus(`기존 기록 불러옴 (${existing.stage}단계, ${existing.score.toLocaleString()}점)`);
    } else {
      // First time player
      const certId = generateCertificateNo(cleanNick);
      setCertificateNo(certId);
      const initial: StudentGameData = {
        nickname: cleanNick,
        stage: 1,
        score: 0,
        coins: 0,
        inventory: [],
        treesPlanted: 5,
        temperature: 14.3,
        co2: 394.9,
        badge: '새싹 수호자',
        certificateNo: certId,
        completed: false,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      await saveStudentRecord(initial);
      setSyncStatus('명예의 전당 새 용사 등록 완료!');
    }

    // Show story intro before first game start
    setShowStoryModal(true);
  };

  const handleStartFromStory = () => {
    setShowStoryModal(false);
    setScreen('game');
  };

  // Level Complete Event
  const handleLevelComplete = (newScore: number, newCoins: number) => {
    const nextStage = stage + 1;
    persistProgress(nextStage, newScore, newCoins, undefined, 4);

    // If reached level 5 milestone or level 50 master milestone
    if (stage === 5 || stage === 50) {
      setShowHeroEndingModal(true);
    }
  };

  // Game Over Event
  const handleGameOver = (finalScore: number) => {
    persistProgress(stage, finalScore, coins);
    setShowGameOverModal(true);
  };

  // Retry from Game Over
  const handleRetry = () => {
    setShowGameOverModal(false);
    setScreen('game');
  };

  // Buy Shop Item
  const handleBuyShopItem = (itemId: string, price: number) => {
    if (coins < price) return;
    const newCoins = coins - price;
    const newInv = [...inventory, itemId];
    persistProgress(stage, score, newCoins, newInv, 0);
  };

  // Open Certificate for Current Student
  const handleOpenMyCertificate = () => {
    setInspectedCertData(null);
    setShowCertificateModal(true);
  };

  // Open Certificate from Hall of Fame row
  const handleOpenHallOfFameCertificate = (
    targetNick: string,
    targetStage: number,
    targetScore: number,
    targetTrees: number,
    targetCertNo?: string
  ) => {
    setInspectedCertData({
      nickname: targetNick,
      stage: targetStage,
      score: targetScore,
      trees: targetTrees,
      certNo: targetCertNo,
    });
    setShowCertificateModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 print:hidden">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 rounded-xl shadow-md font-bold text-lg">
              🌲
            </span>
            <div>
              <h1 className="text-base sm:text-lg font-black text-emerald-400 font-['DungGeunMo'] tracking-wide flex items-center gap-2">
                에코 가디언: 기후위기 탈출 대모험
                {stage >= 50 && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40">
                    MASTER
                  </span>
                )}
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                기상청·산림청 2010~2022 실측 데이터(Orange3) 연계 교육 게임
              </p>
            </div>
          </div>

          {/* Quick Action Navigation */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Hall of Fame Button */}
            <button
              onClick={() => setShowHallOfFameModal(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/40 flex items-center gap-1.5 transition cursor-pointer font-['DungGeunMo']"
              title="파이어베이스 실시간 누적 명예의 전당"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>명예의 전당</span>
            </button>

            {/* Certificate Print Button */}
            <button
              onClick={handleOpenMyCertificate}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-300 text-xs font-bold border border-emerald-400/40 flex items-center gap-1.5 transition cursor-pointer font-['DungGeunMo']"
              title="공식 기후행동 실천 교육 이수증 출력"
            >
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>이수증 출력</span>
            </button>

            {/* Scatter Data Analysis */}
            <button
              onClick={() => setShowScatterModal(true)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
            >
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">데이터 분석</span>
            </button>

            {stage >= 50 && (
              <button
                onClick={() => setShowShopModal(true)}
                className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/40 flex items-center gap-1.5 transition cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>에코 상점</span>
              </button>
            )}

            <button
              onClick={() => setShowStoryModal(true)}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1 transition cursor-pointer"
              title="게임 가이드 & 스토리"
            >
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span className="hidden md:inline">가이드</span>
            </button>
          </div>
        </div>
      </header>

      {/* Real-time Orange3 Key Finding Headline Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-rose-950 border-b border-emerald-500/30 px-4 py-2 print:hidden">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-bold text-amber-300 font-['DungGeunMo']">
              &ldquo;{ORANGE3_ANALYSIS_SUMMARY.headline}&rdquo;
            </span>
            <span className="text-slate-400 hidden md:inline">
              (산림 64%→63% 제자리, CO2 394.9→425.0ppm 급증)
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-300">
            <span className="flex items-center gap-1">
              <CloudSun className="w-3.5 h-3.5 text-amber-400" />
              지구온도: <strong className="text-amber-300">{temperature}°C</strong>
            </span>
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              CO2: <strong className="text-rose-400">{co2} ppm</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 flex flex-col justify-center print:p-0 print:m-0">
        {screen === 'login' ? (
          /* Student Nickname-Only Entry Screen (No Management Code!) */
          <div className="max-w-lg w-full mx-auto my-auto bg-slate-900 border-2 border-emerald-500/60 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="text-center mb-6">
              <div className="inline-block p-4 bg-emerald-950/80 rounded-2xl border border-emerald-500/40 shadow-lg mb-3">
                <span className="text-4xl animate-bounce inline-block">🌱🧑‍🌾</span>
              </div>
              <h2 className="text-2xl font-black text-emerald-300 font-['DungGeunMo']">
                기후 수호자 닉네임 입력
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                관리코드 없이 닉네임만 입력하면 파이어베이스 명예의 전당에 실시간 저장됩니다.
              </p>
            </div>

            {/* Analysis summary card */}
            <div className="mb-6 p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1.5">
              <div className="text-amber-300 font-bold flex items-center gap-1.5 font-['DungGeunMo']">
                <TrendingUp className="w-4 h-4 text-amber-400" /> Orange3 산점도 핵심 분석
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                &ldquo;산림면적은 제자리인데 탄소는 계속 늘고 있어요!&rdquo;
                <br />
                대기 중 탄소를 흡수할 숲이 정체되어 해수면이 차오르고 있습니다.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>학생 닉네임 (이름 또는 별명)</span>
                  <span className="text-[11px] text-emerald-400 font-normal">이수증에 출력됩니다</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="예: 김환경, 3반민지, 숲의요정"
                    maxLength={24}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-400 focus:outline-none text-slate-100 font-bold text-sm transition placeholder:text-slate-600"
                    required
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  * 닉네임으로 언제든 이전 클리어 기록과 점수가 자동 연결됩니다.
                </span>
              </div>

              {/* Pass Assurance Banner */}
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5 font-['DungGeunMo']">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  초보자·학생 안심 통과 보장
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  누구나 5단계를 무사히 클리어하고 공식 교육 이수증을 발급받을 수 있도록 자동 구조 드론과 2단 점프가 기본 지원됩니다.
                </p>
              </div>

              {syncStatus && (
                <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{syncStatus}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSyncing}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-xl text-base shadow-xl shadow-emerald-500/20 font-['DungGeunMo'] transition transform active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSyncing ? '기록 확인 중...' : '기후위기 탈출 작전 시작하기'}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <button
                type="button"
                onClick={() => setShowHallOfFameModal(true)}
                className="text-amber-300 hover:underline flex items-center gap-1"
              >
                <Trophy className="w-3.5 h-3.5" />
                명예의 전당 순위표 보기
              </button>

              <button
                type="button"
                onClick={() => setShowScatterModal(true)}
                className="text-slate-400 hover:text-emerald-300 underline underline-offset-4"
              >
                기후 데이터 보기
              </button>
            </div>
          </div>
        ) : (
          /* Active Game View */
          <div className="space-y-3.5 print:hidden">
            {/* Student In-Game Profile Banner */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-300">
              <div className="flex items-center gap-3">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  용사: <strong className="text-white text-sm">{nickname}</strong>
                </span>
                <span className="text-slate-500">|</span>
                <span className="text-amber-300 font-bold">
                  {getHonorBadge(stage, score)}
                </span>
                <span className="text-slate-500 hidden sm:inline">|</span>
                <span className="text-teal-300 hidden sm:inline">
                  🌲 심은 나무: {treesPlanted} 그루
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenMyCertificate}
                  className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-xs font-bold border border-amber-500/40 flex items-center gap-1 transition cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>내 이수증</span>
                </button>

                <button
                  onClick={() => setShowHallOfFameModal(true)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 text-xs transition cursor-pointer"
                >
                  명예의 전당
                </button>

                <button
                  onClick={() => setScreen('login')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 text-xs transition cursor-pointer"
                >
                  닉네임 변경
                </button>
              </div>
            </div>

            {/* Canvas Game Platformer */}
            <GameCanvas
              stage={stage}
              score={score}
              coins={coins}
              inventory={inventory}
              onLevelComplete={handleLevelComplete}
              onGameOver={handleGameOver}
            />

            {/* Bottom Status / Educational Tips */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center gap-2.5">
                <span className="text-2xl">🌱</span>
                <div>
                  <div className="font-bold text-emerald-400">씨앗 심기 & 바닷물 낮추기</div>
                  <div className="text-slate-400 text-[11px]">
                    씨앗을 먹으면 바닷물 높이가 즉시 낮아지고, [Z]키로 탄소공장과 자동차를 정화할 수 있습니다!
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center gap-2.5">
                <span className="text-2xl">🚁</span>
                <div>
                  <div className="font-bold text-cyan-400">에코 자동 구조 드론</div>
                  <div className="text-slate-400 text-[11px]">
                    물에 오래 잠기거나 위험할 경우 구조 드론이 출동하여 안전한 발판으로 인양해 줍니다!
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center gap-2.5">
                <span className="text-2xl">🎓</span>
                <div>
                  <div className="font-bold text-amber-400">5단계 완료 시 이수증 수여</div>
                  <div className="text-slate-400 text-[11px]">
                    5단계를 클리어하면 본인 닉네임이 새겨진 공식 기후행동 교육 이수증을 인쇄/PDF 저장할 수 있습니다.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {showScatterModal && (
        <ScatterPlotModal onClose={() => setShowScatterModal(false)} />
      )}

      {showStoryModal && (
        <IntroStoryModal onStartGame={handleStartFromStory} />
      )}

      {showGameOverModal && (
        <GameOverComicModal
          stage={stage}
          score={score}
          onRetry={handleRetry}
          onOpenCertificate={handleOpenMyCertificate}
        />
      )}

      {showHeroEndingModal && (
        <HeroEndingModal
          stage={stage}
          score={score}
          coins={coins}
          nickname={nickname}
          onContinue={() => setShowHeroEndingModal(false)}
          onOpenShop={() => {
            setShowHeroEndingModal(false);
            setShowShopModal(true);
          }}
          onOpenCertificate={handleOpenMyCertificate}
        />
      )}

      {showShopModal && (
        <MasterShopModal
          coins={coins}
          inventory={inventory}
          onBuyItem={handleBuyShopItem}
          onClose={() => setShowShopModal(false)}
        />
      )}

      {/* Hall of Fame Modal */}
      {showHallOfFameModal && (
        <HallOfFameModal
          currentNickname={nickname}
          onClose={() => setShowHallOfFameModal(false)}
          onOpenCertificate={handleOpenHallOfFameCertificate}
        />
      )}

      {/* Completion Certificate Modal */}
      {showCertificateModal && (
        <CompletionCertificateModal
          nickname={inspectedCertData?.nickname || nickname || '기후수호자'}
          stage={inspectedCertData?.stage || stage}
          score={inspectedCertData?.score || score}
          treesPlanted={inspectedCertData?.trees || Math.max(12, stage * 4)}
          certificateNo={inspectedCertData?.certNo || certificateNo}
          onClose={() => {
            setShowCertificateModal(false);
            setInspectedCertData(null);
          }}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-3 px-4 text-center text-xs text-slate-500 print:hidden">
        <p>
          기상청 기후변화감시센터 & 산림청 산림통계연보 2010~2022 실측 데이터 기반 | Orange3 데이터 분석 교육 플랫폼 게임
        </p>
      </footer>
    </div>
  );
}
