import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

interface AuthContextType {
  isAdmin: boolean;
  darkMode: boolean;
  toggleDarkMode: () => void;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);
const AUTH_KEY = "shriram_ims_auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(() => {
    try { return sessionStorage.getItem(AUTH_KEY) === "authenticated"; } catch { return false; }
  });

  const [darkMode, setDarkMode] = useState(false);

  // Firestore se theme fetch karein
  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const docRef = doc(db, "settings", "appearance");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const isDark = docSnap.data().darkMode;
          setDarkMode(isDark);
          if (isDark) document.documentElement.classList.add('dark');
          else document.documentElement.classList.remove('dark');
        }
      } catch (err) { console.error("Error fetching theme:", err); }
    };
    fetchTheme();
  }, []);

  const toggleDarkMode = useCallback(async () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    
    // UI Update
    if (newMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');

    // Firestore mein save karein
    try {
      await setDoc(doc(db, "settings", "appearance"), { darkMode: newMode });
    } catch (err) { console.error("Error saving theme:", err); }
  }, [darkMode]);

  const login = useCallback((username: string, password: string): boolean => {
    if (username === "admin" && password === "admin") {
      setIsAdmin(true);
      sessionStorage.setItem(AUTH_KEY, "authenticated");
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsAdmin(false);
    sessionStorage.removeItem(AUTH_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ isAdmin, darkMode, toggleDarkMode, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}