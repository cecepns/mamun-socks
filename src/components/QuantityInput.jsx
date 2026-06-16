import React from 'react';

export const QuantityInput = ({ value, onChange, min = 1, max = 999, disabled = false, className = '' }) => {
  const handleChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (raw === '') {
      onChange(min);
      return;
    }
    const num = parseInt(raw, 10);
    if (!isNaN(num)) {
      onChange(Math.min(Math.max(num, min), max));
    }
  };

  const decrement = () => {
    if (value > min) onChange(value - 1);
  };

  const increment = () => {
    if (value < max) onChange(value + 1);
  };

  return (
    <div className={`flex items-center border border-slate-200 bg-white rounded-full overflow-hidden shadow-sm ${className}`}>
      <button
        type="button"
        disabled={disabled || value <= min}
        onClick={decrement}
        className="px-3 py-1.5 hover:bg-slate-50 text-slate-600 font-bold transition-colors disabled:opacity-30"
      >
        -
      </button>
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className="w-12 text-center text-xs font-bold text-slate-800 bg-transparent focus:outline-none"
      />
      <button
        type="button"
        disabled={disabled || value >= max}
        onClick={increment}
        className="px-3 py-1.5 hover:bg-slate-50 text-slate-600 font-bold transition-colors disabled:opacity-30"
      >
        +
      </button>
    </div>
  );
};
