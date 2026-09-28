import React, { useState, useEffect, useCallback } from 'react';

interface PinModalProps {
  isOpen: boolean;
  expectedPin: string;
  mode?: 'verify' | 'change';
  title?: string;
  subtitle?: string;
  onSuccess: (newPin?: string) => void;
  onClose: () => void;
}

export const PinModal: React.FC<PinModalProps> = ({
  isOpen,
  expectedPin,
  mode = 'verify',
  title,
  subtitle,
  onSuccess,
  onClose,
}) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isShaking, setIsShaking] = useState<boolean>(false);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError('');
      setIsShaking(false);
    }
  }, [isOpen]);

  const handleDigit = useCallback(
    (digit: string) => {
      setError('');
      setPin((prev) => {
        if (prev.length >= 4) return prev;
        const next = prev + digit;

        // Auto-check on 4th digit in verify mode
        if (mode === 'verify' && next.length === 4) {
          if (next === expectedPin) {
            setTimeout(() => {
              onSuccess();
            }, 120);
          } else {
            setTimeout(() => {
              setError(`Неверный PIN-код. (По умолчанию: ${expectedPin})`);
              setIsShaking(true);
              setTimeout(() => {
                setIsShaking(false);
                setPin('');
              }, 600);
            }, 100);
          }
        }
        return next;
      });
    },
    [mode, expectedPin, onSuccess],
  );

  const handleBackspace = useCallback(() => {
    setError('');
    setPin((prev) => prev.slice(0, -1));
  }, []);

  const handleClear = useCallback(() => {
    setError('');
    setPin('');
  }, []);

  const handleConfirm = useCallback(() => {
    if (pin.length < 4) {
      setError('Введите все 4 цифры PIN-кода');
      return;
    }

    if (mode === 'change') {
      onSuccess(pin);
    } else {
      if (pin === expectedPin) {
        onSuccess();
      } else {
        setError(`Неверный PIN-код. (По умолчанию: ${expectedPin})`);
        setIsShaking(true);
        setTimeout(() => {
          setIsShaking(false);
          setPin('');
        }, 600);
      }
    }
  }, [pin, mode, expectedPin, onSuccess]);

  // Physical keyboard support
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleDigit, handleBackspace, handleConfirm, onClose]);

  if (!isOpen) return null;

  const defaultTitle =
    mode === 'change' ? 'Смена PIN-кода' : 'Вход в настройки меню';
  const defaultSubtitle =
    mode === 'change'
      ? 'Задайте новый 4-значный PIN-код для защиты настроек меню'
      : 'Введите 4-значный PIN-код администратора для доступа к меню';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`bg-white rounded-2xl shadow-2xl border border-[#ffe2d8] w-full max-w-sm p-6 sm:p-7 flex flex-col items-center text-center gap-5 transition-transform ${
          isShaking ? 'animate-shake' : ''
        }`}
      >
        {/* Header Icon */}
        <div className="w-14 h-14 rounded-full bg-[#fff1ec] text-[#dc2626] flex items-center justify-center border-2 border-[#ffe2d8] shadow-xs">
          <span className="material-symbols-outlined text-[30px]">
            {mode === 'change' ? 'key' : 'lock'}
          </span>
        </div>

        {/* Title & Subtitle */}
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-black text-[#2a170f]">
            {title || defaultTitle}
          </h2>
          <p className="text-xs text-[#5c403c] font-medium leading-relaxed px-2">
            {subtitle || defaultSubtitle}
          </p>
        </div>

        {/* 4-Dot Indicator */}
        <div className="flex items-center gap-4 my-1">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  isFilled
                    ? 'bg-[#dc2626] scale-125 shadow-xs'
                    : 'bg-[#ffdbcd] border border-[#e6bdb8]'
                }`}
              />
            );
          })}
        </div>

        {/* Error message */}
        {error ? (
          <p className="text-xs font-bold text-[#b70011] bg-[#dc2626]/10 px-3 py-1.5 rounded-lg">
            {error}
          </p>
        ) : (
          <p className="text-[11px] text-[#916f6b]">
            {mode === 'verify'
              ? `Подсказка: PIN по умолчанию — ${expectedPin}`
              : 'Введите 4 любые цифры'}
          </p>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2.5 w-full pt-1">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="py-3.5 rounded-xl bg-[#fff1ec] hover:bg-[#ffe9e2] text-[#2a170f] font-black text-xl transition-all active:scale-95 border border-[#ffe2d8] shadow-2xs"
            >
              {digit}
            </button>
          ))}

          {/* Clear / Backspace */}
          <button
            type="button"
            onClick={handleClear}
            className="py-3.5 rounded-xl bg-[#fff1ec] hover:bg-[#ffe9e2] text-[#5c403c] font-black text-xs transition-all active:scale-95 border border-[#ffe2d8]"
          >
            Сброс
          </button>

          {/* 0 */}
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="py-3.5 rounded-xl bg-[#fff1ec] hover:bg-[#ffe9e2] text-[#2a170f] font-black text-xl transition-all active:scale-95 border border-[#ffe2d8] shadow-2xs"
          >
            0
          </button>

          {/* Confirm or Backspace */}
          {mode === 'change' ? (
            <button
              type="button"
              disabled={pin.length < 4}
              onClick={handleConfirm}
              className={`py-3.5 rounded-xl text-white font-black text-xs transition-all active:scale-95 flex items-center justify-center gap-1 ${
                pin.length === 4
                  ? 'bg-[#dc2626] hover:bg-[#b70011] shadow-md cursor-pointer'
                  : 'bg-[#dc2626]/40 cursor-not-allowed'
              }`}
            >
              <span>Сохранить</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleBackspace}
              className="py-3.5 rounded-xl bg-[#fff1ec] hover:bg-[#ffe9e2] text-[#5c403c] font-black text-xs transition-all active:scale-95 border border-[#ffe2d8] flex items-center justify-center"
              title="Удалить последнюю цифру"
            >
              <span className="material-symbols-outlined text-[20px]">backspace</span>
            </button>
          )}
        </div>

        {/* Cancel button */}
        <button
          type="button"
          onClick={onClose}
          className="text-[#5c403c] hover:text-[#2a170f] text-xs font-bold transition-colors py-1"
        >
          Отмена (вернуться к заявкам)
        </button>
      </div>
    </div>
  );
};
