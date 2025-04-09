'use client';

import { useState, useEffect } from 'react';

interface OutputLengthSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
}

export default function OutputLengthSlider({
  value,
  onChange,
  min = 100,
  max = 1000,
  step = 50,
  label = 'Output Length'
}: OutputLengthSliderProps) {
  const [currentValue, setCurrentValue] = useState(value);
  
  // Update local state when prop changes
  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    setCurrentValue(newValue);
    onChange(newValue);
  };
  
  // Calculate the percentage for dynamic styling
  const percentage = ((currentValue - min) / (max - min)) * 100;
  
  // Labels for the slider
  const lengthLabels = {
    [min]: 'Brief',
    [max]: 'Detailed'
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          {label}
        </label>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {currentValue} characters
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentValue}
          onChange={handleChange}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
          style={{
            background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${percentage}%, var(--border) ${percentage}%, var(--border) 100%)`
          }}
        />
        <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
          <span>{lengthLabels[min]}</span>
          <span>{lengthLabels[max]}</span>
        </div>
      </div>
    </div>
  );
}