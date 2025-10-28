import React, { useEffect } from 'react';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { DownloadIcon, VideoIcon, ImageIcon } from './icons/Icons';
import { qualityMap } from '../utils/export';

export type ExportQuality = 'low' | 'medium' | 'high';

export interface ExportOptions {
  quality: ExportQuality;
  gifBackgroundColor: string;
  pngTransparent: boolean;
}

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  isRecording: boolean;
  options: ExportOptions;
  onOptionChange: (newOptions: ExportOptions) => void;
  onExportSvg: () => void;
  onExportPng: () => void;
  onExportJpg: () => void;
  onExportGif: () => void;
  isAnimated: boolean;
}

const ControlSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="space-y-4 border-b border-gray-600 pb-6 mb-6">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <div className="space-y-4 pl-2">{children}</div>
    </div>
);

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen, onClose, isRecording, options, onOptionChange, onExportSvg, onExportPng, onExportJpg, onExportGif, isAnimated
}) => {
    
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleQualityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onOptionChange({...options, quality: e.target.value as ExportQuality});
  };

  return (
    <div
      className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-gray-800 text-white rounded-lg shadow-2xl p-6 md:p-8 w-full max-w-md m-4 transform transition-all max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Export Files</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Close modal">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
            <ControlSection title="Vector">
                <Button onClick={() => { onExportSvg(); onClose(); }} className="w-full">
                    <DownloadIcon className="w-4 h-4 mr-2"/> Download SVG
                </Button>
            </ControlSection>

            <ControlSection title="Static Image">
                 <Select
                    label="Quality / Resolution"
                    value={options.quality}
                    onChange={handleQualityChange}
                    options={Object.entries(qualityMap).map(([key, val]) => ({ value: key, label: val.label.split(',')[0] }))}
                />
                <div className="flex items-center justify-between bg-gray-700/50 p-3 rounded-md">
                    <label htmlFor="png-transparent" className="text-sm font-medium text-gray-300">Transparent Background (PNG)</label>
                    <input
                        id="png-transparent"
                        type="checkbox"
                        checked={options.pngTransparent}
                        onChange={(e) => onOptionChange({...options, pngTransparent: e.target.checked})}
                        className="h-5 w-5 rounded bg-gray-600 border-gray-500 text-indigo-500 focus:ring-indigo-500"
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <Button onClick={() => { onExportPng(); onClose(); }} className="w-full">
                        <ImageIcon className="w-4 h-4 mr-2"/> Export PNG
                    </Button>
                     <Button onClick={() => { onExportJpg(); onClose(); }} className="w-full">
                        <ImageIcon className="w-4 h-4 mr-2"/> Export JPG
                    </Button>
                </div>
            </ControlSection>
            
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Animated GIF</h3>
                <div className={`space-y-4 pl-2 ${!isAnimated ? 'opacity-50' : ''}`}>
                    <Select
                        label="Quality / Resolution"
                        value={String(options.quality)}
                        onChange={handleQualityChange}
                        disabled={!isAnimated}
                        options={Object.entries(qualityMap).map(([key, val]) => ({ value: key, label: val.label }))}
                    />
                     <div className="flex flex-col space-y-2">
                        <label htmlFor="gif-bg-color" className="text-sm font-medium text-gray-300">Background Color</label>
                        <div className="flex items-center gap-2">
                            <input id="gif-bg-color" type="color" value={options.gifBackgroundColor} onChange={(e) => onOptionChange({...options, gifBackgroundColor: e.target.value})} className="w-10 h-10 p-1 bg-gray-700 border border-gray-600 rounded-md cursor-pointer" disabled={!isAnimated}/>
                            <input type="text" value={options.gifBackgroundColor} onChange={(e) => onOptionChange({...options, gifBackgroundColor: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white font-mono" disabled={!isAnimated}/>
                        </div>
                    </div>
                     <Button onClick={() => { onExportGif(); onClose(); }} disabled={isRecording || !isAnimated} className="w-full">
                        {isRecording ? 'Recording...' : <><VideoIcon className="w-4 h-4 mr-2"/>Export GIF</>}
                    </Button>
                    {!isAnimated && <p className="text-xs text-center text-yellow-400">Enable an animation type to export a GIF.</p>}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};