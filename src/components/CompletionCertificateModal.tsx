import React, { useRef, useState, useEffect } from 'react';
import {
  Award,
  FileDown,
  Image as ImageIcon,
  Copy,
  Printer,
  CheckCircle2,
  X,
  Loader2,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  CertificateData,
  generateCertificateCanvas,
  downloadCertificatePdf,
  downloadCertificatePng,
  copyCertificateToClipboard,
} from '../lib/certificateGenerator';

interface CompletionCertificateModalProps {
  nickname: string;
  stage: number;
  score: number;
  treesPlanted?: number;
  certificateNo?: string;
  onClose: () => void;
}

export const CompletionCertificateModal: React.FC<CompletionCertificateModalProps> = ({
  nickname,
  stage,
  score,
  treesPlanted = Math.max(12, stage * 4),
  certificateNo,
  onClose,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'info'>('success');
  const [certificateDataUrl, setCertificateDataUrl] = useState<string>('');

  const certNumber =
    certificateNo ||
    `ECO-2026-KR-${Math.abs(
      (nickname || 'HERO').split('').reduce((acc, char) => acc + char.charCodeAt(0), 1000)
    )}`;

  const certificateData: CertificateData = {
    nickname: nickname || '기후수호자',
    stage,
    score,
    treesPlanted,
    certificateNo: certNumber,
  };

  // Generate crisp canvas and dataURL on mount for instant visual preview
  useEffect(() => {
    try {
      const canvas = generateCertificateCanvas(certificateData);
      setCertificateDataUrl(canvas.toDataURL('image/png'));
    } catch (e) {
      console.warn('Certificate canvas generation notice:', e);
    }
  }, [nickname, stage, score, treesPlanted, certNumber]);

  // 1. Download PDF
  const handlePdfDownload = async () => {
    setIsExporting(true);
    setExportMessage('PDF 파일 생성 중...');
    setMessageType('info');

    const ok = await downloadCertificatePdf(certificateData);
    setIsExporting(false);

    if (ok) {
      setMessageType('success');
      setExportMessage('✅ PDF 다운로드가 시작되었습니다! (다운로드 폴더를 확인하세요)');
    } else {
      setMessageType('info');
      setExportMessage('⚠️ PDF 다운로드가 제한된 경우 아래 [이미지 다운로드] 또는 [클립보드 복사]를 이용하세요.');
    }
    setTimeout(() => setExportMessage(''), 5000);
  };

  // 2. Download PNG
  const handlePngDownload = () => {
    setIsExporting(true);
    const ok = downloadCertificatePng(certificateData);
    setIsExporting(false);

    if (ok) {
      setMessageType('success');
      setExportMessage('✅ 고화질 이수증 이미지(PNG)가 저장되었습니다!');
    } else {
      setMessageType('info');
      setExportMessage('이수증 이미지를 우클릭하여 "이미지를 다른 이름으로 저장"할 수 있습니다.');
    }
    setTimeout(() => setExportMessage(''), 5000);
  };

  // 3. Copy to Clipboard
  const handleCopyClipboard = async () => {
    setIsExporting(true);
    const ok = await copyCertificateToClipboard(certificateData);
    setIsExporting(false);

    if (ok) {
      setMessageType('success');
      setExportMessage('📋 이수증 이미지가 클립보드에 복사되었습니다! (한글, 워드, PPT, 카톡에 Ctrl+V로 붙여넣기 가능)');
    } else {
      setMessageType('info');
      setExportMessage('클립보드 복사가 지원되지 않는 환경입니다. 이미지를 길게 누르거나 우클릭하여 복사하세요.');
    }
    setTimeout(() => setExportMessage(''), 6000);
  };

  // 4. Print
  const handlePrint = () => {
    try {
      window.print();
    } catch {
      handlePdfDownload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-5 overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border-2 border-amber-400/80 rounded-2xl shadow-2xl p-4 sm:p-6 text-slate-100 flex flex-col max-h-[95vh] print:border-none print:shadow-none print:p-0 print:max-w-none">
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800 gap-2 print:hidden">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-500/40">
              <Award className="w-5 h-5 text-amber-400" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-amber-300 font-['DungGeunMo']">
                  기후행동 교육 이수증 발급
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                  공식 인증
                </span>
              </div>
              <p className="text-xs text-slate-400">
                수료자: <strong className="text-emerald-300 font-bold">{nickname || '기후수호자'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Button Bar - Highlighted for Easy Access */}
        <div className="my-2.5 p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-2 print:hidden">
          <div className="flex flex-wrap items-center gap-2">
            {/* Primary PDF Download */}
            <button
              onClick={handlePdfDownload}
              disabled={isExporting}
              className="px-4 py-2.5 bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 hover:from-red-400 hover:to-amber-400 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-red-500/20 transition flex items-center gap-2 cursor-pointer font-['DungGeunMo'] disabled:opacity-50"
            >
              <FileDown className="w-4 h-4" />
              <span>📄 PDF 파일 저장</span>
            </button>

            {/* High-Res PNG Download */}
            <button
              onClick={handlePngDownload}
              disabled={isExporting}
              className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <ImageIcon className="w-4 h-4" />
              <span>🖼️ 이미지(PNG) 저장</span>
            </button>

            {/* Copy to Clipboard */}
            <button
              onClick={handleCopyClipboard}
              disabled={isExporting}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 text-xs sm:text-sm font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="클립보드에 이미지 복사 (Ctrl+V로 바로 붙여넣기)"
            >
              <Copy className="w-4 h-4" />
              <span>📋 클립보드 복사</span>
            </button>

            {/* Print */}
            <button
              onClick={handlePrint}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer hidden md:flex items-center gap-1 text-xs"
              title="인쇄"
            >
              <Printer className="w-4 h-4" />
              <span>인쇄</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 hidden lg:block">
            * PDF / 이미지 / 클립보드 3가지 방식으로 모두 저장 가능
          </div>
        </div>

        {/* Feedback Message Toast */}
        {exportMessage && (
          <div
            className={`my-1.5 p-2.5 rounded-xl border text-xs flex items-center gap-2 justify-center font-['DungGeunMo'] animate-in fade-in ${
              messageType === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                : 'bg-amber-950/80 border-amber-500/60 text-amber-300'
            }`}
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin text-amber-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{exportMessage}</span>
          </div>
        )}

        {/* Certificate Display Area (100% Reliable Rendered Image & Canvas) */}
        <div className="flex-1 overflow-y-auto my-1 flex flex-col items-center justify-center p-1 sm:p-2 bg-slate-950/60 rounded-xl border border-slate-800/80">
          {certificateDataUrl ? (
            <div className="relative group max-w-full">
              <img
                src={certificateDataUrl}
                alt={`기후행동 이수증 - ${nickname}`}
                className="max-h-[60vh] w-auto object-contain rounded-lg shadow-2xl border-2 border-amber-500/40 select-all"
              />
              <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded bg-black/75 text-[10px] text-slate-300 opacity-80 pointer-events-none">
                💡 마우스 우클릭 / 꾹 눌러서 바로 저장 가능
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400 space-y-2">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-400" />
              <p className="text-xs">이수증 서식 구성 중...</p>
            </div>
          )}
        </div>

        {/* Bottom Helper Info & Close */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 print:hidden">
          <div className="flex items-center gap-1.5">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              학교 컴퓨터나 아이프레임 환경에서도 <strong>[PDF 저장]</strong>, <strong>[이미지 저장]</strong>, 또는 <strong>[클립보드 복사]</strong>로 손쉽게 과제를 제출할 수 있습니다.
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition cursor-pointer font-['DungGeunMo']"
          >
            확인 완료
          </button>
        </div>
      </div>
    </div>
  );
};
