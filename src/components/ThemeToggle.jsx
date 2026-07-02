import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full transition-all duration-300 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
      aria-label="Toggle Theme"
    >
      {isDark ? <Sun size={20} className="hover:text-amber-400 transition-colors" /> : <Moon size={20} className="hover:text-indigo-500 transition-colors" />}
    </button>
  );
}
