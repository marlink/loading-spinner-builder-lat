import React, { useState, useMemo } from 'react';
import type { ColorStop } from '../../types';
import { Slider } from './Slider';

interface GradientEditorProps {
    stops: ColorStop[];
    onStopChange: (id: string, newStopData: Partial<Omit<ColorStop, 'id'>>) => void;
    onAddStop: () => void;
    onRemoveStop: (id: string) => void;
}

export const GradientEditor: React.FC<GradientEditorProps> = ({ stops, onStopChange, onAddStop, onRemoveStop }) => {
    const [activeStopId, setActiveStopId] = useState<string | null>(stops[0]?.id || null);

    const activeStop = useMemo(() => stops.find(s => s.id === activeStopId), [stops, activeStopId]);

    const gradientCss = useMemo(() => {
        const sortedStops = [...stops].sort((a,b) => a.position - b.position);
        return `linear-gradient(to right, ${sortedStops.map(s => `${s.color} ${s.position}%`).join(', ')})`;
    }, [stops]);

    return (
        <div className="space-y-4">
            <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Gradient Preview</label>
                <div className="relative h-8 bg-gray-700 rounded-md" style={{ background: gradientCss }}>
                    {stops.map(stop => (
                        <button
                            key={stop.id}
                            onClick={() => setActiveStopId(stop.id)}
                            className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 cursor-pointer transition-transform duration-150 ${activeStopId === stop.id ? 'border-indigo-400 scale-125 ring-2 ring-indigo-400 ring-offset-2 ring-offset-gray-800' : 'border-white/50'}`}
                            style={{ left: `${stop.position}%`, backgroundColor: stop.color }}
                            title={`Color Stop at ${stop.position}%`}
                        />
                    ))}
                </div>
            </div>
            
            {activeStop && (
                <div className="bg-gray-700/50 p-4 rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-white">Edit Color Stop</h4>
                        <button onClick={() => onRemoveStop(activeStop.id)} disabled={stops.length <= 2} className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed">
                            Remove
                        </button>
                    </div>
                    <div className="flex items-center gap-4">
                        <input
                            type="color"
                            value={activeStop.color}
                            onChange={(e) => onStopChange(activeStop.id, { color: e.target.value })}
                            className="w-12 h-12 p-1 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                        />
                        <div className="flex-grow">
                            <Slider 
                                label="Position"
                                min={0}
                                max={100}
                                step={1}
                                value={activeStop.position}
                                onChange={(e) => onStopChange(activeStop.id, { position: Number(e.target.value) })}
                                displayValue={`${activeStop.position}%`}
                            />
                        </div>
                    </div>
                </div>
            )}

            <button
                onClick={onAddStop}
                disabled={stops.length >= 10}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-md text-sm disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
                Add Color Stop
            </button>
        </div>
    );
};