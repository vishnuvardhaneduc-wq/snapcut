import React, { useState, useRef, useEffect } from 'react';
import type { BackdropMode } from '../../store/workspaceStore';
import { ensureUrlHttps } from '../../lib/utils';
import { Sparkles, MoveHorizontal, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface ImageComparisonSliderProps {
  originalUrl: string;
  processedUrl: string;
  backdropMode?: BackdropMode;
  customColor?: string;
  initialPosition?: number; // 0 to 100
  className?: string;
}

export const ImageComparisonSlider: React.FC<ImageComparisonSliderProps> = ({
  originalUrl,
  processedUrl,
  backdropMode = 'transparent',
  customColor = '#00F2FE',
  initialPosition = 50,
  className = '',
}) => {
  const safeOriginalUrl = ensureUrlHttps(originalUrl);
  const safeProcessedUrl = ensureUrlHttps(processedUrl);
  const [sliderPos, setSliderPos] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const getBackdropStyle = () => {
    switch (backdropMode) {
      case 'transparent':
        return 'checkerboard-pattern';
      case 'checkerboard-light':
        return 'checkerboard-pattern-light';
      case 'white':
        return 'bg-white';
      case 'black':
        return 'bg-black';
      case 'cyberpunk-neon':
        return 'bg-gradient-to-tr from-cyan-600 via-purple-700 to-pink-600';
      case 'sunset':
        return 'bg-gradient-to-tr from-amber-500 via-rose-600 to-indigo-900';
      case 'custom':
        return '';
      default:
        return 'checkerboard-pattern';
    }
  };

  const handlePointerMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  };

  const onMouseDown = () => setIsDragging(true);

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) handlePointerMove(e.clientX);
    };
    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches[0]) handlePointerMove(e.touches[0].clientX);
    };
    const handleGlobalMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('touchmove', handleGlobalTouchMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
      window.addEventListener('touchend', handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('touchmove', handleGlobalTouchMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, [isDragging]);

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* Visual Canvas Container */}
      <div
        ref={containerRef}
        onMouseDown={onMouseDown}
        onTouchStart={onMouseDown}
        className="relative w-full aspect-[4/3] sm:aspect-[16/10] max-h-[560px] rounded-2xl overflow-hidden border border-white/10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] cursor-ew-resize group"
      >
        {/* Background Result Layer (Right / Base) */}
        <div
          className={`absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden ${getBackdropStyle()}`}
          style={backdropMode === 'custom' ? { backgroundColor: customColor } : undefined}
        >
          <img
            src={safeProcessedUrl}
            alt="SnapCut Processed Cutout"
            className="w-full h-full object-contain pointer-events-none transition-transform duration-100"
            style={{ transform: `scale(${zoom})` }}
          />
          <div className="absolute top-4 right-4 z-20 px-3 py-1 rounded-full bg-[#07090e]/80 backdrop-blur-md border border-cyan-500/40 text-[11px] font-semibold text-cyan-300 flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,242,254,0.3)]">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>AI Cutout</span>
          </div>
        </div>

        {/* Foreground Original Layer (Left / Clipped) */}
        <div
          className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden bg-[#07090e] border-r border-cyan-400/80 pointer-events-none"
          style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
        >
          <img
            src={safeOriginalUrl}
            alt="Original Upload"
            className="w-full h-full object-contain pointer-events-none transition-transform duration-100"
            style={{ transform: `scale(${zoom})` }}
          />
          <div className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full bg-[#07090e]/80 backdrop-blur-md border border-white/20 text-[11px] font-semibold text-slate-300 shadow-md">
            Original
          </div>
        </div>

        {/* Divider Slider Handle Line */}
        <div
          className="absolute top-0 bottom-0 z-30 pointer-events-none flex items-center justify-center -translate-x-1/2"
          style={{ left: `${sliderPos}%` }}
        >
          {/* Vertical Neon Line */}
          <div className="w-0.5 h-full bg-gradient-to-b from-cyan-400 via-white to-purple-500 shadow-[0_0_10px_#00F2FE]" />
          
          {/* Center Handle Button */}
          <div className="absolute w-8 h-8 rounded-full bg-[#0D111A] border-2 border-cyan-400 shadow-[0_0_16px_rgba(0,242,254,0.8)] flex items-center justify-center text-cyan-300">
            <MoveHorizontal className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Toolbar Zoom & Reset Controls */}
      <div className="mt-4 flex items-center justify-between w-full px-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span>Drag divider to inspect edge precision</span>
        </div>

        <div className="flex items-center gap-2 bg-[#131823] p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
            className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="px-2 font-mono text-[11px] text-slate-300">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(Math.min(2.5, zoom + 0.25))}
            className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setZoom(1); setSliderPos(50); }}
            className="p-1.5 rounded-lg hover:bg-white/10 hover:text-cyan-400 transition"
            title="Reset View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
