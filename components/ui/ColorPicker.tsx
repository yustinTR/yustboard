'use client';

import { useRef } from 'react';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  defaultColor?: string;
}

export default function ColorPicker({ label, value, onChange, defaultColor = '#3B82F6' }: ColorPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleColorClick = () => {
    inputRef.current?.click();
  };

  const handleReset = () => {
    onChange(defaultColor);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>

      <div className="flex gap-2 items-center">
        {/* Color Preview Box */}
        <button
          type="button"
          onClick={handleColorClick}
          className="relative w-16 h-16 rounded-lg border-2 border-white/20 dark:border-gray-700/30 shadow-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform"
          style={{ backgroundColor: value || defaultColor }}
        >
          <div className="absolute inset-0 backdrop-blur-sm bg-black/5 hover:bg-black/0 transition-all" />
        </button>

        {/* Hidden native color input */}
        <input
          ref={inputRef}
          type="color"
          value={value || defaultColor}
          onChange={(e) => onChange(e.target.value)}
          className="sr-only"
        />

        {/* Color Code Display and Input */}
        <div className="flex-1">
          <input
            type="text"
            value={value || defaultColor}
            onChange={(e) => {
              const val = e.target.value;
              // Validate hex color format
              if (/^#[0-9A-F]{0,6}$/i.test(val) || val === '') {
                onChange(val);
              }
            }}
            placeholder="#3B82F6"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono text-sm uppercase"
            maxLength={7}
          />
        </div>

        {/* Reset Button */}
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-700/50 transition-all text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Reset
        </button>
      </div>

      {/* Preview with text */}
      <div
        className="px-4 py-3 rounded-lg text-white text-sm font-medium backdrop-blur-sm shadow-md"
        style={{ backgroundColor: value || defaultColor }}
      >
        Voorbeeld van deze kleur
      </div>
    </div>
  );
}
