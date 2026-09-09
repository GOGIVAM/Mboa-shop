import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';

export interface Account { name: string; email: string; }

interface AuthCtx {
  account: Account | null;
  isLoggedIn: boolean;
  login: (account: Account) => void;
  logout: () => void;
}

const STORAGE_KEY = 'mboa_account';

function readStored(): Account | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed.email === 'string' ? parsed : null;
  } catch {
    return null;
  }
}

const AuthContext = createContext<AuthCtx>({
  account: null, isLoggedIn: false, login: () => {}, logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account | null>(readStored);

  const login = useCallback((next: Account) => {
    setAccount(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* stockage indisponible */ }
  }, []);

  const logout = useCallback(() => {
    setAccount(null);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }, []);

  const value = useMemo<AuthCtx>(
    () => ({ account, isLoggedIn: !!account, login, logout }),
    [account, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
