import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import type { SpinnerConfig } from '../types';
import { AnimationType, PlaybackMode } from '../types';
import { SpinnerDisplay } from './SpinnerDisplay';
import { Button } from './ui/Button';
import { DownloadIcon, CodeIcon, FullScreenIcon, ExitFullScreenIcon } from './icons/Icons';
import { exportSvg, exportGif, exportPng, exportJpg, qualityMap } from '../utils/export';
import { ExportModal, ExportOptions, ExportQuality } from './ExportModal';
import { CodeExportModal } from './CodeExportModal';
import { PerformanceMonitor } from './PerformanceMonitor';

interface PreviewPanelProps {
  config: SpinnerConfig;
}

const backgrounds = [
  { id: 'dark_solid', name: 'Dark Solid', style: { background: '#111827' } },
  { id: 'light_solid', name: 'Light Solid', style: { background: '#f3f4f6' } },
  { id: 'dark_grad', name: 'Dark Gradient', style: { background: 'radial-gradient(circle, #4a0e90, #000000)' } },
  { id: 'light_grad', name: 'Light Gradient', style: { background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' } },
  { id: 'sunset_grad', name: 'Sunset', style: { background: 'linear-gradient(to right, #ff7e5f, #feb47b)' } },
  { id: 'blueprint', name: 'Blueprint', style: { backgroundColor: '#2a4365', backgroundImage: `linear-gradient(rgba(255,255,255,.07) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,.07) 2px, transparent 2px), linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)`, backgroundSize: '100px 100px, 100px 100px, 20px 20px, 20px 20px' } },
  { id: 'carbon', name: 'Carbon Fiber', style: { backgroundColor: '#1a202c', backgroundImage: `linear-gradient(45deg, rgba(0, 0, 0, 1) 25%, transparent 25%, transparent 75%, rgba(0, 0, 0, 1) 75%, rgba(0, 0, 0, 1)), linear-gradient(-45deg, rgba(0, 0, 0, 1) 25%, transparent 25%, transparent 75%, rgba(0, 0, 0, 1) 75%, rgba(0, 0, 0, 1))`, backgroundSize: `10px 10px` } },
  { id: 'light_pattern', name: 'Light Pattern', style: { background: `url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23a0aec0' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M5 0h1L0 6V5zM6 5v1H5z'/%3E%3C/g%3E%3C/svg%3E"), #edf2f7` } },
];

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ config }) => {
  const spinnerRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const [activeBgId, setActiveBgId] = useState(backgrounds[0].id);
  const [customBg, setCustomBg] = useState('#111827');

  const activeBg = useMemo(() => {
      if (activeBgId === 'custom') {
          return { id: 'custom', name: 'Custom', style: { background: customBg } };
      }
      return backgrounds.find(bg => bg.id === activeBgId) || backgrounds[0];
  }, [activeBgId, customBg]);
  
  const defaultBgColor = '#111827';
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    quality: 'medium',
    gifBackgroundColor: defaultBgColor,
    pngTransparent: true,
  });

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleOpenFileExportModal = () => {
    const currentBg = activeBg.style.background || defaultBgColor;
    const isSolidColor = /^#([0-9A-F]{3,8})$/i.test(String(currentBg));
    setExportOptions(prev => ({...prev, gifBackgroundColor: isSolidColor ? String(currentBg) : defaultBgColor}));
    setIsExportModalOpen(true);
  };

  const doExportSvg = useCallback(() => {
    if (spinnerRef.current) {
      const svgElement = spinnerRef.current.querySelector('svg');
      if (svgElement) {
        exportSvg(svgElement.outerHTML, 'spinner.svg');
        showNotification('SVG exported!');
      }
    }
  }, []);

  const doExportPng = useCallback(() => {
    if (spinnerRef.current) {
      const scale = qualityMap[exportOptions.quality].res / 250;
      exportPng(spinnerRef.current, 'spinner.png', { transparent: exportOptions.pngTransparent, scale });
      showNotification('PNG exported!');
    }
  }, [exportOptions]);

  const doExportJpg = useCallback(() => {
    if (spinnerRef.current) {
      const scale = qualityMap[exportOptions.quality].res / 250;
      exportJpg(spinnerRef.current, 'spinner.jpg', { backgroundColor: exportOptions.gifBackgroundColor, scale });
      showNotification('JPG exported!');
    }
  }, [exportOptions]);


  const doExportGif = useCallback(() => {
    if (spinnerRef.current && config.animationType !== AnimationType.None) {
      setIsRecording(true);
      showNotification('Recording GIF... please wait.');
      
      let exportDuration = config.duration;
      if (config.playbackMode === PlaybackMode.Alternate) {
        exportDuration *= 2;
      } else if (config.playbackMode === PlaybackMode.Repeat) {
        exportDuration *= config.repeatCount;
      }

      exportGif(spinnerRef.current, exportDuration * 1000, 'spinner.gif', 
      () => {
        setIsRecording(false);
        showNotification('GIF export finished!');
      },
      {
        backgroundColor: exportOptions.gifBackgroundColor,
        quality: exportOptions.quality,
      });
    } else {
        showNotification('Cannot export GIF with "None" animation.');
    }
  }, [config, exportOptions]);

  const toggleFullScreen = useCallback(() => {
    if (!document.fullscreenElement) {
        previewContainerRef.current?.requestFullscreen().catch(err => {
            alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    } else {
        document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const onFullScreenChange = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullScreenChange);
  }, []);


  return (
    <div ref={previewContainerRef} className={`bg-gray-800/50 p-6 rounded-lg shadow-lg flex flex-col h-full ${isFullScreen ? '!p-0' : ''}`}>
      {notification && (
        <div className="absolute top-5 right-5 bg-indigo-500 text-white px-4 py-2 rounded-md shadow-lg animate-pulse z-20">
          {notification}
        </div>
      )}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        isRecording={isRecording}
        options={exportOptions}
        onOptionChange={setExportOptions}
        onExportSvg={doExportSvg}
        onExportPng={doExportPng}
        onExportJpg={doExportJpg}
        onExportGif={doExportGif}
        isAnimated={config.animationType !== AnimationType.None}
      />
      <CodeExportModal 
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        config={config}
      />
      <div className="flex-grow flex flex-col">
        <div className="flex justify-between items-center mb-4">
            <div />
            <div className="flex items-center gap-2 bg-gray-900/50 p-1 rounded-lg">
                {backgrounds.map(bg => (
                    <button 
                        key={bg.id}
                        title={bg.name}
                        onClick={() => setActiveBgId(bg.id)} 
                        className={`w-6 h-6 rounded-md transition-transform duration-150 border border-white/10 ${activeBgId === bg.id ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-indigo-400 scale-110' : ''}`}
                        style={bg.style}
                        aria-label={`Set background to ${bg.name}`}
                    ></button>
                ))}
                 <div
                    title="Custom Color"
                    className={`relative w-6 h-6 rounded-md transition-transform duration-150 border border-white/10 overflow-hidden cursor-pointer ${activeBgId === 'custom' ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-indigo-400 scale-110' : ''}`}
                >
                    <div className="w-full h-full" style={{ background: customBg }} />
                    <input
                        type="color"
                        value={customBg}
                        onChange={(e) => {
                            setCustomBg(e.target.value);
                            setActiveBgId('custom');
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        aria-label="Custom background color"
                    />
                </div>
            </div>
        </div>
        <div className={`relative flex-grow rounded-md flex items-center justify-center overflow-hidden`}>
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              ...activeBg.style,
              filter: `blur(${config.backgroundBlur}px)`,
              transform: 'scale(1.1)',
              transition: 'filter 0.3s ease-in-out, background 0.3s ease-in-out',
            }}
          />
          <div className="absolute top-2 right-2 z-10">
              <button onClick={toggleFullScreen} className="p-2 bg-black/30 rounded-full text-white/70 hover:text-white hover:bg-black/50 transition" aria-label="Toggle Fullscreen">
                  {isFullScreen ? <ExitFullScreenIcon className="w-5 h-5" /> : <FullScreenIcon className="w-5 h-5" />}
              </button>
          </div>
          <PerformanceMonitor />
          <div ref={spinnerRef} className="relative">
            <SpinnerDisplay config={config} />
          </div>
        </div>
      </div>
      <div className="pt-6 mt-6 border-t border-gray-700/50 flex flex-wrap justify-center items-center gap-4">
          <Button onClick={handleOpenFileExportModal}><DownloadIcon className="w-4 h-4 mr-2"/>Export Files</Button>
          <Button onClick={() => setIsCodeModalOpen(true)}><CodeIcon className="w-4 h-4 mr-2"/>Export Code</Button>
      </div>
    </div>
  );
};