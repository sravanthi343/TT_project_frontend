import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

// ── Simulated user store (localStorage-based, works without backend) ──────────
const USERS_KEY = 'cms_users';
const SESSION_KEY = 'cms_session';
const NOTIFICATIONS_KEY = 'cms_notifications';

function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); } catch { return []; }
}
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; }
}
function saveSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}
function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function getNotifications(userId) {
  try {
    const all = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '{}');
    return all[userId] || [];
  } catch { return []; }
}
export function addNotification(userId, notification) {
  try {
    const all = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '{}');
    const userNotifs = all[userId] || [];
    userNotifs.unshift({ ...notification, id: Date.now(), read: false, createdAt: new Date().toISOString() });
    all[userId] = userNotifs.slice(0, 50); // keep last 50
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(all));
  } catch {}
}
export function markAllRead(userId) {
  try {
    const all = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '{}');
    if (all[userId]) all[userId] = all[userId].map(n => ({ ...n, read: true }));
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(all));
  } catch {}
}

// Seed a demo admin if no users exist
function seedDemoUsers() {
  const users = getUsers();
  if (!users.length) {
    const demo = [
      { id: 'admin_001', name: 'Admin User', email: 'admin@cms.io', password: 'admin123', role: 'ADMIN', createdAt: new Date().toISOString(), avatar: 'A' },
      { id: 'user_001',  name: 'Arjun Mehta',  email: 'arjun@example.com', password: 'password', role: 'USER', createdAt: new Date().toISOString(), avatar: 'AM' },
    ];
    saveUsers(demo);
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    seedDemoUsers();
    const session = getSession();
    if (session) {
      setUser(session);
      setNotifications(getNotifications(session.id));
    }
    setLoading(false);
  }, []);

  const refreshNotifications = useCallback(() => {
    if (user) setNotifications(getNotifications(user.id));
  }, [user]);

  const login = useCallback(async (email, password) => {
    const users = getUsers();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!found) throw new Error('Invalid email or password');
    const { password: _, ...safeUser } = found;
    saveSession(safeUser);
    setUser(safeUser);
    setNotifications(getNotifications(safeUser.id));
    return safeUser;
  }, []);

  const signup = useCallback(async (name, email, password) => {
    const users = getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists');
    }
    const newUser = {
      id: `user_${Date.now()}`,
      name, email, password,
      role: 'USER',
      createdAt: new Date().toISOString(),
      avatar: name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
    };
    users.push(newUser);
    saveUsers(users);
    const { password: _, ...safeUser } = newUser;
    saveSession(safeUser);
    setUser(safeUser);
    addNotification(safeUser.id, { type: 'welcome', title: 'Welcome to CMS!', message: `Hi ${name}, your account has been created successfully.` });
    setNotifications(getNotifications(safeUser.id));
    return safeUser;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setNotifications([]);
  }, []);

  const updateProfile = useCallback((updates) => {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates };
      saveUsers(users);
    }
    const updated = { ...user, ...updates };
    saveSession(updated);
    setUser(updated);
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AuthContext.Provider value={{
      user, loading, notifications, unreadCount,
      login, signup, logout, updateProfile, refreshNotifications,
      markAllRead: () => { markAllRead(user?.id); setNotifications(n => n.map(x => ({ ...x, read: true }))); },
      isAdmin: user?.role === 'ADMIN',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
