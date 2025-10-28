
import React from 'react';

interface SliderProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  displayValue: string | number;
}

export const Slider: React.FC<SliderProps> = ({ label, min, max, step, value, onChange, displayValue }) => {
  const percentage = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-300">{label}</label>
        <span className="text-sm font-mono bg-gray-700 text-indigo-300 px-2 py-0.5 rounded-md">{displayValue}</span>
      </div>
      <div className="relative">
        <div className="h-2 bg-gray-700 rounded-full">
            <div className="h-2 bg-indigo-500 rounded-full" style={{ width: `${percentage}%` }}></div>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={onChange}
            className="absolute w-full h-2 top-0 appearance-none bg-transparent cursor-pointer"
        />
      </div>
    </div>
  );
};
