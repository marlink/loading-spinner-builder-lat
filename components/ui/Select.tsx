
import React from 'react';

interface SelectProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  // FIX: Add optional disabled prop
  disabled?: boolean;
}

export const Select: React.FC<SelectProps> = ({ label, value, onChange, options, disabled }) => (
  <div className="flex flex-col space-y-2">
    <label className="text-sm font-medium text-gray-300">{label}</label>
    <select
      value={value}
      onChange={onChange}
      // FIX: Apply the disabled prop and add disabled styles
      disabled={disabled}
      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);
