import React, { useState } from 'react';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Retrieve stored credentials or defaults
  const getExpectedCredentials = () => {
    try {
      const storedUser = localStorage.getItem('klubnika_admin_username') || 'admin';
      const storedPass = localStorage.getItem('klubnika_admin_password') || 'admin';
      return { username: storedUser, password: storedPass };
    } catch {
      return { username: 'admin', password: 'admin' };
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const expected = getExpectedCredentials();
      const enteredUser = username.trim();
      const enteredPass = password.trim();

      if (enteredUser === expected.username && enteredPass === expected.password) {
        try {
          if (rememberMe) {
            localStorage.setItem('klubnika_admin_auth', 'authenticated');
          } else {
            sessionStorage.setItem('klubnika_admin_auth', 'authenticated');
          }
        } catch {
          // ignore
        }
        setIsLoading(false);
        onLoginSuccess();
      } else {
        setIsLoading(false);
        setErrorMessage('Неверный логин или пароль');
      }
    }, 200);
  };

  const handleFillDemoCredentials = () => {
    const expected = getExpectedCredentials();
    setUsername(expected.username);
    setPassword(expected.password);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-[#fff8f6] text-[#2a170f]">
      {/* Login Card */}
      <div className="w-full max-w-sm bg-white rounded-3xl border border-[#ffe4dc] shadow-xl p-6 sm:p-8">
        {/* Top Icon & Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#dc2626] text-white shadow-md mb-3">
            <ShieldCheck className="w-7 h-7 stroke-[2.2]" />
          </div>
          <h1 className="text-xl font-bold text-[#2a170f]">
            Авторизация
          </h1>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div
            id="admin-login-error"
            className="mb-4 p-3 rounded-xl bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] flex items-center gap-2 text-xs font-semibold"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-[#dc2626]" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label
              htmlFor="admin-username"
              className="block text-xs font-bold text-[#5c403c] mb-1 uppercase tracking-wider"
            >
              Логин
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#a88d87]">
                <User className="w-4 h-4" />
              </div>
              <input
                id="admin-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Логин"
                required
                autoFocus
                className="w-full pl-9 pr-3 py-2.5 bg-[#fff9f8] border border-[#ffdcd2] rounded-xl text-sm font-semibold text-[#2a170f] focus:outline-none focus:ring-2 focus:ring-[#dc2626]/30 focus:border-[#dc2626] transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-bold text-[#5c403c] mb-1 uppercase tracking-wider"
            >
              Пароль
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#a88d87]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Пароль"
                required
                className="w-full pl-9 pr-10 py-2.5 bg-[#fff9f8] border border-[#ffdcd2] rounded-xl text-sm font-semibold text-[#2a170f] focus:outline-none focus:ring-2 focus:ring-[#dc2626]/30 focus:border-[#dc2626] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#a88d87] hover:text-[#2a170f] transition-colors"
                aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Remember me toggle */}
          <div className="flex items-center justify-between pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[#ffdcd2] text-[#dc2626] focus:ring-[#dc2626]/40 cursor-pointer accent-[#dc2626]"
              />
              <span className="text-xs font-medium text-[#786565]">
                Запомнить вход
              </span>
            </label>
          </div>

          {/* Submit button */}
          <button
            id="admin-login-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4 stroke-[2.5]" />
                <span>Войти</span>
              </>
            )}
          </button>
        </form>

        {/* Demo credentials helper card */}
        <div className="mt-5 p-2.5 rounded-xl bg-[#fff2ee] border border-[#ffded4] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-[#786565]">
            <Sparkles className="w-3.5 h-3.5 text-[#dc2626] shrink-0" />
            <span>
              Тест: <strong className="text-[#2a170f]">admin</strong> / <strong className="text-[#2a170f]">admin</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={handleFillDemoCredentials}
            className="text-[11px] font-bold text-[#dc2626] hover:underline cursor-pointer ml-2"
          >
            Заполнить
          </button>
        </div>
      </div>
    </div>
  );
};
