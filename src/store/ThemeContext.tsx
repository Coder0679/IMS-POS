import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}
const ThemeContext = createContext<ThemeContextType | null>(null);
const THEME_KEY = "shriram_ims_theme";
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved !== null) return saved === "dark";
      // Check system preference
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      return false;
    }
  });
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    try {
      localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
    } catch { /* ignore */ }
  }, [isDark]);
  const toggleTheme = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);
  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}