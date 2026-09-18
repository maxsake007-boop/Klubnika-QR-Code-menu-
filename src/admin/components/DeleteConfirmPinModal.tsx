import React, { useState, useEffect, useCallback } from 'react';

export interface DeleteConfirmPinModalProps {
  isOpen: boolean;
  expectedPin: string;
  itemType: 'category' | 'product';
  itemName: string;
  itemDetails?: string;
  warningText?: string;
  onConfirm: () => void;
  onClose: () => void;
}

export const DeleteConfirmPinModal: React.FC<DeleteConfirmPinModalProps> = ({
  isOpen,
  expectedPin,
  itemType,
  itemName,
  itemDetails,
  warningText,
  onConfirm,
  onClose,
}) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isShaking, setIsShaking] = useState<boolean>(false);

  // Reset state on open/close
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

        // Auto-check on 4th digit
        if (next.length === 4) {
          if (next === expectedPin) {
            setTimeout(() => {
              onConfirm();
              onClose();
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
    [expectedPin, onConfirm, onClose],
  );

  const handleBackspace = useCallback(() => {
    setError('');
    setPin((prev) => prev.slice(0, -1));
  }, []);

  const handleClear = useCallback(() => {
    setError('');
    setPin('');
  }, []);

  const handleManualConfirm = useCallback(() => {
    if (pin.length < 4) {
      setError('Введите 4 цифры PIN-кода для подтверждения');
      return;
    }

    if (pin === expectedPin) {
      onConfirm();
      onClose();
    } else {
      setError(`Неверный PIN-код. (По умолчанию: ${expectedPin})`);
      setIsShaking(true);
      setTimeout(() => {
        setIsShaking(false);
        setPin('');
      }, 600);
    }
  }, [pin, expectedPin, onConfirm, onClose]);

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
        handleManualConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleDigit, handleBackspace, handleManualConfirm, onClose]);

  if (!isOpen) return null;

  const isCategory = itemType === 'category';
  const modalTitle = isCategory ? 'Удаление категории' : 'Удаление товара';
  const defaultWarning = isCategory
    ? 'Категория будет удалена из каталога. Для подтверждения введите PIN-код администратора.'
    : 'Позиция будет удалена из меню кассы. Для подтверждения введите PIN-код администратора.';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`bg-white rounded-2xl shadow-2xl border border-[#ffe2d8] w-full max-w-sm p-6 sm:p-7 flex flex-col items-center text-center gap-4 transition-transform ${
          isShaking ? 'animate-shake' : ''
        }`}
      >
        {/* Top bar with close button */}
        <div className="w-full flex items-center justify-between pb-1">
          <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-[#dc2626] bg-[#fff1ec] px-2.5 py-1 rounded-full border border-[#ffe2d8]">
            <span className="material-symbols-outlined text-[14px]">shield</span>
            <span>Защищенная операция</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[#fff1ec] text-[#5c403c] flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Delete Icon */}
        <div className="w-14 h-14 rounded-full bg-[#ffdad6] text-[#b70011] flex items-center justify-center border-2 border-[#ffb4ab] shadow-xs">
          <span className="material-symbols-outlined text-[30px]">
            {isCategory ? 'delete_forever' : 'delete'}
          </span>
        </div>

        {/* Title & Warning */}
        <div className="flex flex-col gap-1 w-full">
          <h2 className="text-xl font-black text-[#2a170f]">{modalTitle}</h2>
          <p className="text-xs text-[#5c403c] font-medium leading-relaxed">
            {warningText || defaultWarning}
          </p>
        </div>

        {/* Target Item Card */}
        <div className="w-full bg-[#fff8f6] p-3.5 rounded-xl border border-[#ffe2d8] flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-lg bg-[#fff1ec] text-[#dc2626] flex items-center justify-center shrink-0 border border-[#ffe2d8]">
            <span className="material-symbols-outlined text-[22px]">
              {isCategory ? 'category' : 'restaurant_menu'}
            </span>
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-black text-[#2a170f] truncate">{itemName}</span>
            {itemDetails && (
              <span className="text-xs font-bold text-[#5c403c] truncate">{itemDetails}</span>
            )}
          </div>
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

        {/* Error or Hint message */}
        {error ? (
          <p className="text-xs font-bold text-[#b70011] bg-[#dc2626]/10 px-3 py-1.5 rounded-lg w-full">
            {error}
          </p>
        ) : (
          <p className="text-[11px] text-[#916f6b]">
            Подсказка: PIN администратора — <span className="font-bold">{expectedPin}</span>
          </p>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2 w-full pt-1">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="py-3 rounded-xl bg-[#fff1ec] hover:bg-[#ffe9e2] text-[#2a170f] font-black text-lg transition-all active:scale-95 border border-[#ffe2d8] shadow-2xs cursor-pointer"
            >
              {digit}
            </button>
          ))}

          {/* Clear */}
          <button
            type="button"
            onClick={handleClear}
            className="py-3 rounded-xl bg-[#fff1ec] hover:bg-[#ffe9e2] text-[#5c403c] font-black text-xs transition-all active:scale-95 border border-[#ffe2d8] cursor-pointer"
          >
            Сброс
          </button>

          {/* 0 */}
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="py-3 rounded-xl bg-[#fff1ec] hover:bg-[#ffe9e2] text-[#2a170f] font-black text-lg transition-all active:scale-95 border border-[#ffe2d8] shadow-2xs cursor-pointer"
          >
            0
          </button>

          {/* Backspace */}
          <button
            type="button"
            onClick={handleBackspace}
            className="py-3 rounded-xl bg-[#fff1ec] hover:bg-[#ffe9e2] text-[#5c403c] font-black text-xs transition-all active:scale-95 border border-[#ffe2d8] flex items-center justify-center cursor-pointer"
            title="Удалить последнюю цифру"
          >
            <span className="material-symbols-outlined text-[19px]">backspace</span>
          </button>
        </div>

        {/* Action Buttons: Cancel and Delete */}
        <div className="w-full flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-[#fff1ec] hover:bg-[#ffe9e2] text-[#5c403c] font-bold text-xs transition-all border border-[#ffe2d8] cursor-pointer"
          >
            Отмена
          </button>
          <button
            type="button"
            disabled={pin.length < 4}
            onClick={handleManualConfirm}
            className={`flex-1 py-2.5 rounded-xl text-white font-black text-xs transition-all flex items-center justify-center gap-1 ${
              pin.length === 4
                ? 'bg-[#dc2626] hover:bg-[#b70011] shadow-md cursor-pointer active:scale-95'
                : 'bg-[#dc2626]/40 cursor-not-allowed'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
            <span>Удалить</span>
          </button>
        </div>
      </div>
    </div>
  );
};
