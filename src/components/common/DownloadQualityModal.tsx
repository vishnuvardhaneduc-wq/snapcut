import React, { useState } from 'react';
import {
  DOWNLOAD_QUALITY_OPTIONS,
  encodeImageBlob,
  extensionForFormat,
  ensureUrlHttps,
  type QualityOption,
} from '../../lib/utils';
import {
  X,
  Download,
  Check,
  Sparkles,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';

export interface DownloadQualityModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  baseFilename?: string;
}

export const DownloadQualityModal: React.FC<DownloadQualityModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  baseFilename = 'snapcut-cutout',
}) => {
  const [selectedId, setSelectedId] = useState<string>(
    DOWNLOAD_QUALITY_OPTIONS.find((o) => o.recommended)?.id || DOWNLOAD_QUALITY_OPTIONS[0].id,
  );
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedOption: QualityOption | undefined = DOWNLOAD_QUALITY_OPTIONS.find(
    (o) => o.id === selectedId,
  );

  const handleDownload = async (option: QualityOption) => {
    if (!imageUrl || processingId) return;
    const safeImageUrl = ensureUrlHttps(imageUrl);
    setProcessingId(option.id);
    try {
      let blob: Blob;
      if (option.id === 'png-original') {
        const res = await fetch(safeImageUrl, { mode: 'cors', credentials: 'omit' });
        if (res.ok) {
          blob = await res.blob();
        } else {
          blob = await encodeImageBlob(safeImageUrl, 'png');
        }
      } else {
        blob = await encodeImageBlob(safeImageUrl, option.format, option.quality);
      }

      const cleanName = baseFilename.replace(/\.[^.]+$/, '');
      const finalName = `${cleanName}-${option.label
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')}.${extensionForFormat(option.format)}`;

      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = finalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);

      setSuccessId(option.id);
      setTimeout(() => setSuccessId(null), 1200);
    } catch (err) {
      console.error('Quality download failed:', err);
      alert('Failed to prepare download. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0D111A] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,242,254,0.15)] overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Download Quality Studio</span>
          </div>
          <h3 className="text-2xl font-bold text-white font-['Outfit']">
            Choose Your Export Quality
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Select format and compression — PNG/WebP keep transparent backgrounds, JPEG uses a clean white backdrop.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {DOWNLOAD_QUALITY_OPTIONS.map((option) => {
            const isSelected = selectedId === option.id;
            const isProcessing = processingId === option.id;
            const isSuccess = successId === option.id;
            return (
              <button
                key={option.id}
                onClick={() => setSelectedId(option.id)}
                className={`relative text-left p-4 rounded-xl border transition group ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_20px_rgba(0,242,254,0.15)]'
                    : 'border-white/10 bg-[#07090e] hover:border-cyan-500/40 hover:bg-[#0a0e17]'
                }`}
              >
                {option.badge && (
                  <span className="absolute -top-2 right-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-[9px] font-bold uppercase tracking-wide">
                    {option.badge}
                  </span>
                )}

                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                          : 'bg-white/5 border-white/10 text-slate-400 group-hover:text-cyan-300 group-hover:border-cyan-500/30'
                      }`}
                    >
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h5
                        className={`text-sm font-bold ${
                          isSelected ? 'text-cyan-200' : 'text-white'
                        }`}
                      >
                        {option.label}
                      </h5>
                      {option.quality !== undefined && (
                        <span className="text-[10px] font-mono text-slate-500">
                          Q{Math.round(option.quality * 100)}
                        </span>
                      )}
                    </div>
                  </div>
                  {isSelected && !isProcessing && !isSuccess && (
                    <div className="w-5 h-5 rounded-full bg-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-slate-950" />
                    </div>
                  )}
                  {isProcessing && (
                    <Loader2 className="w-5 h-5 text-cyan-300 animate-spin shrink-0 mt-0.5" />
                  )}
                  {isSuccess && (
                    <div className="w-5 h-5 rounded-full bg-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-slate-950" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{option.subtitle}</p>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-white/5">
          <div className="text-xs text-slate-400">
            {selectedOption && (
              <span>
                Exporting as{' '}
                <span className="text-white font-mono uppercase">
                  {selectedOption.format === 'jpeg' ? 'JPG' : selectedOption.format.toUpperCase()}
                </span>{' '}
                {selectedOption.quality !== undefined && (
                  <span>
                    • Quality{' '}
                    <span className="text-cyan-300 font-mono">
                      {Math.round(selectedOption.quality * 100)}%
                    </span>
                  </span>
                )}
              </span>
            )}
          </div>

          <button
            disabled={!imageUrl || !!processingId || !selectedOption}
            onClick={() => selectedOption && handleDownload(selectedOption)}
            className="btn-gradient-primary px-6 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {processingId === selectedId ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Preparing Download...</span>
              </>
            ) : successId === selectedId ? (
              <>
                <Check className="w-4 h-4" />
                <span>Download Started!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Selected</span>
              </>
            )}
          </button>
        </div>

        <p className="mt-3 text-[10px] text-slate-500 font-mono text-right">
          Tip: PNG = lossless transparency • WebP = smaller files • JPEG = no alpha
        </p>
      </div>
    </div>
  );
};
