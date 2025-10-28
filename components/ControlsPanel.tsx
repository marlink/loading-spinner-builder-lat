import React from 'react';
import type { SpinnerConfig, ColorStop } from '../types';
import { ShapeType, AnimationType, EasingType, SizeVariation, RadiusVariation, GradientType, PlaybackMode } from '../types';
import { Slider } from './ui/Slider';
import { Select } from './ui/Select';
import { StepperInput } from './ui/StepperInput';
import { GradientEditor } from './ui/GradientEditor';

interface ControlsPanelProps {
  config: SpinnerConfig;
  onConfigChange: <K extends keyof SpinnerConfig>(key: K, value: SpinnerConfig[K]) => void;
  onColorChange: (index: number, color: string) => void;
  onGradientStopChange: (id: string, newStopData: Partial<Omit<ColorStop, 'id'>>) => void;
  onAddGradientStop: () => void;
  onRemoveGradientStop: (id: string) => void;
}

const ControlSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-4">
    <h3 className="text-sm font-medium text-indigo-300 uppercase tracking-wider">{title}</h3>
    <div className="space-y-5 pl-2 border-l-2 border-gray-700">{children}</div>
  </div>
);

export const ControlsPanel: React.FC<ControlsPanelProps> = ({ config, onConfigChange, onColorChange, onGradientStopChange, onAddGradientStop, onRemoveGradientStop }) => {
  const isGradientMode = config.gradientType === GradientType.Linear || config.gradientType === GradientType.Radial;
  
  return (
    <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg space-y-8 h-full overflow-y-auto">
      <ControlSection title="Shape & Layout">
        <Select
          label="Shape"
          value={config.shape}
          onChange={(e) => onConfigChange('shape', e.target.value as ShapeType)}
          options={Object.values(ShapeType).map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))}
        />
        <Slider
          label="Element Count"
          min={1}
          max={36}
          step={1}
          value={config.count}
          onChange={(e) => onConfigChange('count', Number(e.target.value))}
          displayValue={config.count}
        />
        <StepperInput
            label="Duplicates"
            min={1}
            max={15}
            value={config.copies}
            onChange={(value) => onConfigChange('copies', value)}
        />
         <Slider
          label="Duplicate Spread"
          min={0}
          max={50}
          step={1}
          value={config.copySpread}
          onChange={(e) => onConfigChange('copySpread', Number(e.target.value))}
          displayValue={config.copySpread}
        />
        <Slider
          label="Element Size"
          min={2}
          max={50}
          step={1}
          value={config.size}
          onChange={(e) => onConfigChange('size', Number(e.target.value))}
          displayValue={config.size}
        />
         <Select
          label="Size Variation"
          value={config.sizeVariation}
          onChange={(e) => onConfigChange('sizeVariation', e.target.value as SizeVariation)}
          options={[
            { value: SizeVariation.None, label: 'None' },
            { value: SizeVariation.SmallToLarge, label: 'Small to Large' },
            { value: SizeVariation.LargeToSmall, label: 'Large to Small' },
          ]}
        />
        <Slider
          label="Radius"
          min={20}
          max={150}
          step={1}
          value={config.radius}
          onChange={(e) => onConfigChange('radius', Number(e.target.value))}
          displayValue={config.radius}
        />
        <Select
          label="Radius Variation"
          value={config.radiusVariation}
          onChange={(e) => onConfigChange('radiusVariation', e.target.value as RadiusVariation)}
          options={[
            { value: RadiusVariation.Even, label: 'Even' },
            { value: RadiusVariation.Uneven, label: 'Uneven' },
            { value: RadiusVariation.Random, label: 'Random' },
          ]}
        />
      </ControlSection>

      <ControlSection title="Appearance">
         <div className="space-y-3">
            <label className="text-sm font-medium text-gray-300">Color Profile</label>
            <Select
                label=""
                value={config.gradientType}
                onChange={(e) => onConfigChange('gradientType', e.target.value as GradientType)}
                options={[
                    { value: GradientType.PerDuplicate, label: 'Per Duplicate' },
                    { value: GradientType.Linear, label: 'Linear Gradient' },
                    { value: GradientType.Radial, label: 'Radial Gradient' },
                    { value: GradientType.Sweep, label: 'Sweep (Per Element)' },
                    { value: GradientType.None, label: 'Single Color' },
                ]}
            />
            {isGradientMode ? (
                <GradientEditor 
                    stops={config.gradientStops}
                    onStopChange={onGradientStopChange}
                    onAddStop={onAddGradientStop}
                    onRemoveStop={onRemoveGradientStop}
                />
            ) : (
                <div className="space-y-2">
                    {config.colors.slice(0, config.gradientType === GradientType.None ? 1 : config.copies).map((color, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <label className="text-xs font-mono text-gray-400 w-8">{`#${index + 1}`}</label>
                            <input
                                type="color"
                                value={color}
                                onChange={(e) => onColorChange(index, e.target.value)}
                                className="w-10 h-10 p-1 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                            />
                            <input
                                type="text"
                                value={color}
                                onChange={(e) => onColorChange(index, e.target.value)}
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-md px-3 py-1 text-white font-mono"
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
        <div className="space-y-3">
            <label className="text-sm font-medium text-gray-300">Effects</label>
            <div className="grid grid-cols-2 gap-2">
                <button
                    onClick={() => onConfigChange('shadow', !config.shadow)}
                    className={`w-full text-center px-4 py-2 rounded-md text-sm transition-colors ${config.shadow ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                    {config.shadow ? '✓ Shadow' : 'Shadow'}
                </button>
                <button
                    onClick={() => onConfigChange('stroke', !config.stroke)}
                    className={`w-full text-center px-4 py-2 rounded-md text-sm transition-colors ${config.stroke ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                    {config.stroke ? '✓ Stroke' : 'Stroke'}
                </button>
            </div>

            {config.shadow && (
                <div className="pl-4 pt-4 border-l-2 border-indigo-500/50 space-y-5">
                    <Slider
                        label="Shadow X Offset"
                        min={-10} max={10} step={1}
                        value={config.shadowOffsetX}
                        onChange={(e) => onConfigChange('shadowOffsetX', Number(e.target.value))}
                        displayValue={config.shadowOffsetX}
                    />
                    <Slider
                        label="Shadow Y Offset"
                        min={-10} max={10} step={1}
                        value={config.shadowOffsetY}
                        onChange={(e) => onConfigChange('shadowOffsetY', Number(e.target.value))}
                        displayValue={config.shadowOffsetY}
                    />
                    <Slider
                        label="Shadow Blur"
                        min={0} max={20} step={1}
                        value={config.shadowBlur}
                        onChange={(e) => onConfigChange('shadowBlur', Number(e.target.value))}
                        displayValue={config.shadowBlur}
                    />
                     <Slider
                        label="Shadow Opacity"
                        min={0} max={1} step={0.05}
                        value={config.shadowOpacity}
                        onChange={(e) => onConfigChange('shadowOpacity', Number(e.target.value))}
                        displayValue={config.shadowOpacity.toFixed(2)}
                    />
                    <div className="flex flex-col space-y-2">
                        <label className="text-sm font-medium text-gray-300">Shadow Color</label>
                        <input
                            type="color"
                            value={config.shadowColor}
                            onChange={(e) => onConfigChange('shadowColor', e.target.value)}
                            className="w-full h-10 p-1 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                        />
                    </div>
                </div>
            )}
            {config.stroke && (
                <div className="pl-4 pt-4 border-l-2 border-indigo-500/50 space-y-5">
                    <Slider
                        label="Stroke Width"
                        min={1} max={10} step={0.5}
                        value={config.strokeWidth}
                        onChange={(e) => onConfigChange('strokeWidth', Number(e.target.value))}
                        displayValue={config.strokeWidth.toFixed(1)}
                    />
                    <div className="flex flex-col space-y-2">
                        <label className="text-sm font-medium text-gray-300">Stroke Color</label>
                        <input
                            type="color"
                            value={config.strokeColor}
                            onChange={(e) => onConfigChange('strokeColor', e.target.value)}
                            className="w-full h-10 p-1 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                        />
                    </div>
                </div>
            )}
        </div>
      </ControlSection>

      <ControlSection title="Preview Background">
        <Slider
          label="Background Blur"
          min={0}
          max={32}
          step={1}
          value={config.backgroundBlur}
          onChange={(e) => onConfigChange('backgroundBlur', Number(e.target.value))}
          displayValue={`${config.backgroundBlur}px`}
        />
      </ControlSection>

      <ControlSection title="Animation">
        <Select
          label="Animation Type"
          value={config.animationType}
          onChange={(e) => onConfigChange('animationType', e.target.value as AnimationType)}
          options={[
            { value: AnimationType.None, label: 'None (Static)' },
            ...Object.values(AnimationType).filter(a => a !== AnimationType.None).map(a => ({ value: a, label: a.charAt(0).toUpperCase() + a.slice(1) }))
          ]}
        />
       {config.animationType !== AnimationType.None && (
        <>
            <Slider
            label="Duration / Speed (s)"
            min={0.5}
            max={5}
            step={0.1}
            value={config.duration}
            onChange={(e) => onConfigChange('duration', Number(e.target.value))}
            displayValue={config.duration.toFixed(1)}
            />
            <Slider
            label="Stagger Delay (s)"
            min={0}
            max={0.5}
            step={0.01}
            value={config.stagger}
            onChange={(e) => onConfigChange('stagger', Number(e.target.value))}
            displayValue={config.stagger.toFixed(2)}
            />
            <Select
            label="Easing"
            value={config.easing}
            onChange={(e) => onConfigChange('easing', e.target.value as EasingType)}
            options={[
                { value: EasingType.Linear, label: 'Linear' },
                { value: EasingType.EaseIn, label: 'Ease In' },
                { value: EasingType.EaseOut, label: 'Ease Out' },
                { value: EasingType.EaseInOut, label: 'Ease In Out' },
                { value: EasingType.Spring, label: 'Spring' },
                { value: EasingType.EaseInBack, label: 'Ease In Back' },
            ]}
            />
            <Select
            label="Playback Mode"
            value={config.playbackMode}
            onChange={(e) => onConfigChange('playbackMode', e.target.value as PlaybackMode)}
            options={[
                { value: PlaybackMode.Loop, label: 'Loop' },
                { value: PlaybackMode.Once, label: 'Play Once' },
                { value: PlaybackMode.Repeat, label: 'Repeat X Times' },
                { value: PlaybackMode.Alternate, label: 'Alternate' },
            ]}
            />
            {config.playbackMode === PlaybackMode.Repeat && (
                <Slider
                label="Repeat Count"
                min={1}
                max={10}
                step={1}
                value={config.repeatCount}
                onChange={(e) => onConfigChange('repeatCount', Number(e.target.value))}
                displayValue={config.repeatCount}
                />
            )}
        </>
       )}
      </ControlSection>
    </div>
  );
};