import React, { useState, useEffect } from 'react';
import { Smartphone, Check, AlertCircle } from 'lucide-react';
import { compatibilityService } from '../services/compatibilityService';

interface ImeiInputProps {
  value: string;
  onChange: (value: string, isValid: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function ImeiInput({ value, onChange, placeholder = "Enter 15-digit IMEI", disabled = false }: ImeiInputProps) {
  const [displayValue, setDisplayValue] = useState('');
  const [isValidFormat, setIsValidFormat] = useState(false);

  // Format cleaner: strips non-digits and returns formatted XXXXXX-XX-XXXXXX-X
  const formatImei = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 15);
    
    // Groupings: 6 digits - 2 digits - 6 digits - 1 digit
    let formatted = '';
    if (clean.length > 0) {
      formatted += clean.substring(0, 6);
    }
    if (clean.length > 6) {
      formatted += '-' + clean.substring(6, 8);
    }
    if (clean.length > 8) {
      formatted += '-' + clean.substring(8, 14);
    }
    if (clean.length > 14) {
      formatted += '-' + clean.substring(14, 15);
    }
    
    return { clean, formatted };
  };

  useEffect(() => {
    const { clean, formatted } = formatImei(value);
    setDisplayValue(formatted);
    
    const valid = compatibilityService.validateImei(clean);
    setIsValidFormat(valid);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const { clean } = formatImei(rawVal);
    
    const valid = compatibilityService.validateImei(clean);
    setIsValidFormat(valid);
    onChange(clean, valid);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="text"
          disabled={disabled}
          value={displayValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`w-full bg-neutral-950/80 border rounded-lg px-4 py-3.5 pl-10 pr-10 text-sm font-mono focus:outline-none transition-all ${
            isValidFormat
              ? 'border-white focus:border-white text-white'
              : 'border-white/10 focus:border-white/30 text-brand-gray-300'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
        <Smartphone className="w-4 h-4 text-brand-gray-500 absolute left-3.5 top-4.5" />
        
        {displayValue.length > 0 && (
          <div className="absolute right-3.5 top-4">
            {isValidFormat ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <span className="text-[10px] font-mono text-brand-gray-500">
                {displayValue.replace(/[^0-9]/g, '').length}/15
              </span>
            )}
          </div>
        )}
      </div>
      <div className="flex justify-between items-center px-1">
        <span className="text-[9px] text-brand-gray-500 font-mono">
          Dial <strong className="text-white font-normal">*#06#</strong> on your device to display IMEI. We validate the 15-digit IMEI before lookup.
        </span>
      </div>
    </div>
  );
}
