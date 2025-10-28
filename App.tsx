import React, { useState, useMemo, useCallback } from 'react';
import { ControlsPanel } from './components/ControlsPanel';
import { PreviewPanel } from './components/PreviewPanel';
import { SpinnerConfig, ShapeType, AnimationType, EasingType, SizeVariation, RadiusVariation, PlaybackMode, GradientType, ColorStop } from './types';
import { Header } from './components/Header';

const App: React.FC = () => {
  const [config, setConfig] = useState<SpinnerConfig>({
    shape: ShapeType.Circle,
    count: 12,
    size: 15,
    radius: 80,
    colors: ['#6366f1', '#a5b4fc'],
    gradientStops: [
      { id: crypto.randomUUID(), color: '#6366f1', position: 0 },
      { id: crypto.randomUUID(), color: '#a5b4fc', position: 100 },
    ],
    animationType: AnimationType.None,
    duration: 1.5,
    stagger: 0.1,
    easing: EasingType.EaseInOut,
    copies: 2,
    copySpread: 10,
    sizeVariation: SizeVariation.None,
    radiusVariation: RadiusVariation.Even,
    gradientType: GradientType.PerDuplicate,
    playbackMode: PlaybackMode.Loop,
    repeatCount: 3,
    shadow: false,
    shadowOffsetX: 2,
    shadowOffsetY: 3,
    shadowBlur: 3,
    shadowColor: '#000000',
    shadowOpacity: 0.3,
    backgroundBlur: 0,
    stroke: false,
    strokeWidth: 2,
    strokeColor: '#ffffff',
  });

  const handleConfigChange = useCallback(<K extends keyof SpinnerConfig>(key: K, value: SpinnerConfig[K]) => {
    setConfig(prev => {
        const newConfig = { ...prev, [key]: value };

        // Sync colors array with copies count
        if (key === 'copies') {
            const newCopies = value as number;
            const oldCopies = prev.copies;
            const currentColors = [...newConfig.colors];
            if (newCopies > oldCopies) {
                const lastColor = currentColors[currentColors.length - 1] || '#ffffff';
                for (let i = 0; i < newCopies - oldCopies; i++) {
                    currentColors.push(lastColor);
                }
            } else {
                currentColors.length = newCopies;
            }
            newConfig.colors = currentColors;
        }

        // Handle transitions between gradient and non-gradient modes
        if (key === 'gradientType') {
            const newType = value as GradientType;
            const oldType = prev.gradientType;
            const isEnteringGradientMode = (newType === GradientType.Linear || newType === GradientType.Radial);
            const wasInGradientMode = (oldType === GradientType.Linear || oldType === GradientType.Radial);

            if (isEnteringGradientMode && !wasInGradientMode) {
                // transitioning from non-gradient to gradient: create stops from colors
                newConfig.gradientStops = prev.colors.map((color, index, arr) => ({
                    id: crypto.randomUUID(),
                    color,
                    position: arr.length > 1 ? Math.round((index / (arr.length - 1)) * 100) : 50
                })).sort((a,b) => a.position - b.position);
            } else if (!isEnteringGradientMode && wasInGradientMode) {
                // transitioning from gradient to non-gradient: update colors from stops
                const newColors = prev.gradientStops.map(stop => stop.color);
                newConfig.colors = newColors.slice(0, newConfig.copies);
                 if (newColors.length < newConfig.copies) {
                    const lastColor = newColors[newColors.length - 1] || '#ffffff';
                    for (let i = 0; i < newConfig.copies - newColors.length; i++) {
                        newColors.push(lastColor);
                    }
                }
                newConfig.colors = newColors;
            }
        }

        return newConfig;
    });
  }, []);

  const handleColorChange = useCallback((index: number, color: string) => {
    setConfig(prev => {
        const newColors = [...prev.colors];
        newColors[index] = color;
        return { ...prev, colors: newColors };
    });
  }, []);

  const handleGradientStopChange = useCallback((id: string, newStopData: Partial<Omit<ColorStop, 'id'>>) => {
    setConfig(prev => ({
        ...prev,
        gradientStops: prev.gradientStops
            .map(stop => stop.id === id ? { ...stop, ...newStopData } : stop)
            .sort((a, b) => a.position - b.position)
    }));
  }, []);
  
  const handleAddGradientStop = useCallback(() => {
    setConfig(prev => {
        if (prev.gradientStops.length >= 10) return prev; // Limit stops
        const newStop = { id: crypto.randomUUID(), color: '#ffffff', position: 50 }; // Add in middle
        const newStops = [...prev.gradientStops, newStop].sort((a, b) => a.position - b.position);
        return { ...prev, gradientStops: newStops };
    });
  }, []);

  const handleRemoveGradientStop = useCallback((id: string) => {
    setConfig(prev => {
        if (prev.gradientStops.length <= 2) return prev; // Keep at least 2
        return { ...prev, gradientStops: prev.gradientStops.filter(stop => stop.id !== id) };
    });
  }, []);


  const memoizedControlsPanel = useMemo(() => (
    <ControlsPanel 
        config={config} 
        onConfigChange={handleConfigChange} 
        onColorChange={handleColorChange} 
        onGradientStopChange={handleGradientStopChange}
        onAddGradientStop={handleAddGradientStop}
        onRemoveGradientStop={handleRemoveGradientStop}
    />
  ), [config, handleConfigChange, handleColorChange, handleGradientStopChange, handleAddGradientStop, handleRemoveGradientStop]);

  return (
    <div className="min-h-screen bg-gray-900 font-sans flex flex-col">
      <Header />
      <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 lg:p-6">
        <div className="lg:col-span-1 h-full min-h-[500px]">
          {memoizedControlsPanel}
        </div>
        <div className="lg:col-span-2 h-full min-h-[500px]">
          <PreviewPanel config={config} />
        </div>
      </main>
    </div>
  );
};

export default App;