import React from 'react';

interface StepperInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

export const StepperInput: React.FC<StepperInputProps> = ({ label, value, min, max, onChange }) => {
    const handleIncrement = () => onChange(Math.min(max, value + 1));
    const handleDecrement = () => onChange(Math.max(min, value - 1));

    return (
         <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-300">{label}</label>
            <div className="flex items-center gap-2">
                <button onClick={handleDecrement} disabled={value <= min} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed">-</button>
                <input
                    type="text"
                    value={value}
                    readOnly
                    className="w-full bg-gray-900/50 text-center font-mono rounded-md py-1 border border-gray-700"
                />
                <button onClick={handleIncrement} disabled={value >= max} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed">+</button>
            </div>
        </div>
    );
};