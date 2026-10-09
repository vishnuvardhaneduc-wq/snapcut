import React, { useState, useRef } from 'react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { useAuthStore } from '../../store/authStore';
import { validateImageFile, processBackgroundRemoval } from '../../lib/backgroundRemover';
import { formatBytes } from '../../lib/utils';
import { ImageComparisonSlider } from '../../components/common/ImageComparisonSlider';
import { PaymentModal } from '../../components/common/PaymentModal';
import { DownloadQualityModal } from '../../components/common/DownloadQualityModal';
import confetti from 'canvas-confetti';
import {
  Upload,
  Download,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Palette,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export const UploadWorkspacePage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, credits, deductCredit } = useAuthStore();
  const {
    file,
    originalUrl,
    processedUrl,
    filename,
    fileSizeBytes,
    width,
    height,
    status,
    progress,
    stepMessage,
    errorMessage,
    processingTimeMs,
    backdropMode,
    customColor,
    setFile,
    setProcessingState,
    setProcessedResult,
    setError,
    setBackdropMode,
    setCustomColor,
    resetWorkspace,
  } = useWorkspaceStore();

  const [dragActive, setDragActive] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [qualityModalOpen, setQualityModalOpen] = useState(false);

  const handleFileSelected = async (selectedFile: File) => {
    // 1. Validation
    const validation = await validateImageFile(selectedFile);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file format or size');
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setFile(selectedFile, objectUrl);

    // 2. Start Automatic Background Removal
    startProcessing(selectedFile, objectUrl, validation.width || 1920, validation.height || 1080);
  };

  const startProcessing = async (imgFile: File, objUrl: string, imgW: number, imgH: number) => {
    // Check credit quota
    const totalCredits = credits.daily_free_remaining + credits.balance;
    if (totalCredits <= 0) {
      setPaymentModalOpen(true);
      setError('You have reached your daily credit limit. Please upgrade or purchase credits to continue.');
      return;
    }

    try {
      setProcessingState('processing', 20, 'Preparing image buffer...');

      // Process background removal via client demo pipeline
      const result = await processBackgroundRemoval({
        file: imgFile,
        imageUrl: objUrl,
        userId: user?.id,
        onProgress: (p, msg) => {
          setProcessingState('processing', p, msg);
        }
      });

      // Deduct credit
      deductCredit();

      // 4. Set Success Result
      setProcessedResult({
        url: result.processedUrl,
        timeMs: result.processingTimeMs,
        width: imgW || result.width,
        height: imgH || result.height,
        bytes: result.fileSizeBytes,
      });

      // Trigger celebratory confetti
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#00F2FE', '#8B5CF6', '#10B981']
      });

    } catch (err: any) {
      console.error('Processing error:', err);
      setError(err.message || 'Background removal encountered an error. Please try again.');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleRetry = () => {
    if (file && originalUrl) {
      startProcessing(file, originalUrl, width, height);
    }
  };

  // Sample quick images
  const loadDemoSample = async (url: string, name: string) => {
    try {
      setProcessingState('uploading', 20, 'Loading sample image...');
      const response = await fetch(url);
      const blob = await response.blob();
      const demoFile = new File([blob], name, { type: 'image/jpeg' });
      handleFileSelected(demoFile);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
      
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider">
              AI Precision Workspace
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
            Background Removal Studio
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {processedUrl && (
            <button
              onClick={resetWorkspace}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Image</span>
            </button>
          )}

          {processedUrl && (
            <button
              onClick={() => setQualityModalOpen(true)}
              className="btn-gradient-primary px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg"
            >
              <Download className="w-4 h-4" />
              <span>Download High-Res PNG</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace Canvas Area */}
      {!originalUrl ? (
        // State 1: Empty Upload Dropzone
        <div className="space-y-6">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-12 sm:p-20 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center bg-[#0D111A]/80 backdrop-blur-xl ${
              dragActive
                ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_40px_rgba(0,242,254,0.3)] scale-[1.01]'
                : 'border-white/10 hover:border-cyan-500/50 hover:bg-[#131823]/80'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelected(e.target.files[0]);
                }
              }}
            />

            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-500/20 to-purple-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_25px_rgba(0,242,254,0.35)] mb-6">
              <Upload className="w-10 h-10 animate-pulse" />
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white font-['Outfit']">
              Drag & Drop your image here, or <span className="text-cyan-400 underline decoration-cyan-400/50">Browse Files</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md">
              Supports JPG, PNG, WEBP • Max 10MB • Max 5000×5000px Ultra HD
            </p>

            <div className="mt-8 flex items-center gap-3 text-xs text-slate-500 font-mono">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-cyan-400" /> Instant 3s processing</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-cyan-400" /> 24h ephemeral auto-purge</span>
            </div>
          </div>

          {/* Sample images */}
          <div className="p-6 rounded-2xl bg-[#0D111A] border border-white/5 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Or test with one-click sample photos:</span>
              <span className="text-slate-500 font-mono">High Resolution</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => loadDemoSample('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&auto=format&fit=crop&q=80', 'portrait-model.jpg')}
                className="group p-3 rounded-xl bg-[#07090e] border border-white/10 hover:border-cyan-400/50 flex items-center gap-3 transition text-left"
              >
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120"
                  alt="Portrait"
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-cyan-400">Portrait Model</p>
                  <p className="text-[10px] text-slate-400">Hair & Saliency Test</p>
                </div>
              </button>

              <button
                onClick={() => loadDemoSample('https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&auto=format&fit=crop&q=80', 'sneaker-product.jpg')}
                className="group p-3 rounded-xl bg-[#07090e] border border-white/10 hover:border-cyan-400/50 flex items-center gap-3 transition text-left"
              >
                <img
                  src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120"
                  alt="Shoe"
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-cyan-400">E-commerce Shoe</p>
                  <p className="text-[10px] text-slate-400">Crisp Edge Cutout</p>
                </div>
              </button>

              <button
                onClick={() => loadDemoSample('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&auto=format&fit=crop&q=80', 'smartwatch.jpg')}
                className="group p-3 rounded-xl bg-[#07090e] border border-white/10 hover:border-cyan-400/50 flex items-center gap-3 transition text-left"
              >
                <img
                  src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120"
                  alt="Watch"
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-cyan-400">Luxury Watch</p>
                  <p className="text-[10px] text-slate-400">Glass Transparency</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      ) : (
        // State 2: Active Image / Processing / Result View
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Main Visual Display (Col 1-3) */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Loading / Processing Progress Bar Overlay */}
            {status === 'processing' || status === 'uploading' ? (
              <div className="w-full aspect-[4/3] sm:aspect-[16/10] max-h-[560px] rounded-3xl bg-[#0D111A] border border-cyan-500/30 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden shadow-[0_0_50px_rgba(0,242,254,0.15)]">
                {/* Glow Scanner Beam */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent animate-scanline pointer-events-none" />
                
                <div className="w-20 h-20 rounded-3xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-6 shadow-[0_0_30px_rgba(0,242,254,0.4)]">
                  <RefreshCw className="w-10 h-10 animate-spin text-cyan-300" />
                </div>

                <h3 className="text-xl font-bold text-white font-['Outfit'] mb-2">
                  {stepMessage || 'AI Segmentation in progress...'}
                </h3>
                <p className="text-xs text-slate-400 mb-6 max-w-sm">
                  Detecting intricate subject contours and generating transparent alpha mask.
                </p>

                {/* Progress bar */}
                <div className="w-full max-w-md bg-slate-800 rounded-full h-2 overflow-hidden mb-3">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-purple-500 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="font-mono text-xs text-cyan-300 font-bold">{progress}%</span>
              </div>
            ) : status === 'error' ? (
              // Error State
              <div className="w-full aspect-[4/3] sm:aspect-[16/10] max-h-[560px] rounded-3xl bg-[#0D111A] border border-rose-500/30 flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/40 flex items-center justify-center text-rose-400">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white font-['Outfit']">Processing Failed</h3>
                <p className="text-xs sm:text-sm text-rose-300 max-w-md">{errorMessage || 'An error occurred during background removal.'}</p>
                
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleRetry}
                    className="btn-gradient-primary px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Retry Process</span>
                  </button>
                  <button
                    onClick={resetWorkspace}
                    className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white"
                  >
                    Upload Different File
                  </button>
                </div>
              </div>
            ) : status === 'idle' && originalUrl && !processedUrl ? (
              // Idle State: File loaded, waiting for user to click Remove Background
              <div className="w-full aspect-[4/3] sm:aspect-[16/10] max-h-[560px] rounded-3xl bg-[#0D111A] border border-cyan-500/30 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden shadow-[0_0_50px_rgba(0,242,254,0.15)]">
                <div className="relative w-full h-full max-h-[400px] rounded-2xl overflow-hidden border border-white/10 mb-6">
                  <img
                    src={originalUrl}
                    alt={filename || 'Uploaded image'}
                    className="w-full h-full object-contain"
                  />
                </div>

                <h3 className="text-xl font-bold text-white font-['Outfit'] mb-2">
                  Image Ready for Background Removal
                </h3>
                <p className="text-xs text-slate-400 mb-6 max-w-sm">
                  Click the button below to start AI background removal processing.
                </p>

                <button
                  onClick={handleRetry}
                  className="btn-gradient-primary px-8 py-3.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg animate-pulse-glow"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Remove Background Now</span>
                </button>
              </div>
            ) : (
              // Success / Interactive Slider
              <div className="space-y-4">
                <ImageComparisonSlider
                  originalUrl={originalUrl}
                  processedUrl={processedUrl || originalUrl}
                  backdropMode={backdropMode}
                  customColor={customColor}
                />
              </div>
            )}
          </div>

          {/* Right Controls & Info Panel (Col 4) */}
          <div className="space-y-4">
            
            {/* Stage Backdrop Switcher */}
            <div className="p-5 rounded-2xl bg-[#0D111A] border border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Palette className="w-4 h-4 text-cyan-400" />
                <span>Backdrop Studio</span>
              </h4>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => setBackdropMode('transparent')}
                  className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                    backdropMode === 'transparent'
                      ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300 font-bold'
                      : 'border-white/10 hover:border-white/20 text-slate-300'
                  }`}
                >
                  <div className="w-4 h-4 rounded checkerboard-pattern border border-white/20" />
                  <span className="truncate">Dark Grid</span>
                </button>

                <button
                  onClick={() => setBackdropMode('checkerboard-light')}
                  className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                    backdropMode === 'checkerboard-light'
                      ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300 font-bold'
                      : 'border-white/10 hover:border-white/20 text-slate-300'
                  }`}
                >
                  <div className="w-4 h-4 rounded checkerboard-pattern-light border border-white/20" />
                  <span className="truncate">Light Grid</span>
                </button>

                <button
                  onClick={() => setBackdropMode('white')}
                  className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                    backdropMode === 'white'
                      ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300 font-bold'
                      : 'border-white/10 hover:border-white/20 text-slate-300'
                  }`}
                >
                  <div className="w-4 h-4 rounded bg-white border border-white/20" />
                  <span className="truncate">Pure White</span>
                </button>

                <button
                  onClick={() => setBackdropMode('black')}
                  className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                    backdropMode === 'black'
                      ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300 font-bold'
                      : 'border-white/10 hover:border-white/20 text-slate-300'
                  }`}
                >
                  <div className="w-4 h-4 rounded bg-black border border-white/20" />
                  <span className="truncate">Obsidian</span>
                </button>

                <button
                  onClick={() => setBackdropMode('cyberpunk-neon')}
                  className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                    backdropMode === 'cyberpunk-neon'
                      ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300 font-bold'
                      : 'border-white/10 hover:border-white/20 text-slate-300'
                  }`}
                >
                  <div className="w-4 h-4 rounded bg-gradient-to-tr from-cyan-500 to-pink-500" />
                  <span className="truncate">Cyber Neon</span>
                </button>

                <button
                  onClick={() => setBackdropMode('custom')}
                  className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                    backdropMode === 'custom'
                      ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300 font-bold'
                      : 'border-white/10 hover:border-white/20 text-slate-300'
                  }`}
                >
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => {
                      setCustomColor(e.target.value);
                      setBackdropMode('custom');
                    }}
                    className="w-4 h-4 rounded border-0 cursor-pointer bg-transparent p-0"
                  />
                  <span className="truncate">Custom Hex</span>
                </button>
              </div>
            </div>

            {/* Asset Metadata */}
            <div className="p-5 rounded-2xl bg-[#0D111A] border border-white/10 space-y-3 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider font-mono">Image Properties</h4>
              
              <div className="space-y-2 text-slate-400">
                <div className="flex justify-between">
                  <span>Filename:</span>
                  <span className="text-white font-medium truncate max-w-[140px]">{filename || 'cutout.png'}</span>
                </div>
                <div className="flex justify-between">
                  <span>File Size:</span>
                  <span className="text-white font-mono">{formatBytes(fileSizeBytes)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Resolution:</span>
                  <span className="text-white font-mono">{width || 1920} × {height || 1080} px</span>
                </div>
                <div className="flex justify-between">
                  <span>Processing Time:</span>
                  <span className="text-cyan-400 font-mono font-semibold">{processingTimeMs || 1120} ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Storage Lifetime:</span>
                  <span className="text-emerald-400 font-mono">24h Auto-Purge</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            {processedUrl && (
              <div className="p-5 rounded-2xl bg-[#0D111A] border border-cyan-500/30 space-y-3">
                <button
                  onClick={() => setQualityModalOpen(true)}
                  className="btn-gradient-primary w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download High-Res PNG</span>
                </button>

                <button
                  onClick={resetWorkspace}
                  className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition flex items-center justify-center gap-2"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Another Image</span>
                </button>
              </div>
            )}

          </div>

        </div>
      )}

      {/* Razorpay Payment Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
      />

      {/* Download Quality Modal */}
      <DownloadQualityModal
        isOpen={qualityModalOpen}
        onClose={() => setQualityModalOpen(false)}
        imageUrl={processedUrl}
        baseFilename={`snapcut-${filename || 'cutout'}`}
      />

    </div>
  );
};
