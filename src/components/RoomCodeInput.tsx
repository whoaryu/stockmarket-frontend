import React, { useRef, useState, useEffect } from 'react';
import styles from './RoomCodeInput.module.css';

interface RoomCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const RoomCodeInput: React.FC<RoomCodeInputProps> = ({ value, onChange, disabled = false }) => {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Sync value prop with local state
    const newDigits = Array(6).fill('');
    for (let i = 0; i < Math.min(value.length, 6); i++) {
      newDigits[i] = value[i].toUpperCase();
    }
    setDigits(newDigits);
  }, [value]);

  const handleChange = (index: number, newValue: string) => {
    if (disabled) return;
    
    // Only allow numbers
    if (newValue && !/^\d$/.test(newValue)) return;
    
    const newDigits = [...digits];
    newDigits[index] = newValue;
    setDigits(newDigits);
    
    const code = newDigits.join('');
    onChange(code);
    
    // Auto-focus next input
    if (newValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newDigits = Array(6).fill('');
    for (let i = 0; i < pastedData.length; i++) {
      newDigits[i] = pastedData[i];
    }
    setDigits(newDigits);
    onChange(newDigits.join(''));
    
    // Focus the next empty input or the last one
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div className={styles.container}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className={styles.input}
          disabled={disabled}
          autoFocus={index === 0 && !disabled}
        />
      ))}
    </div>
  );
};

export default RoomCodeInput;

