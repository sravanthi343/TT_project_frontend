import { useEffect } from 'react';
import { Bell, CheckCheck, Info, AlertTriangle, CheckCircle, Clock, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { timeAgo } from '../utils/helpers';

const NOTIF_ICONS = {
  welcome:       { icon: Bell,          color: '#2563eb', bg: '#eff6ff' },
  status_change: { icon: CheckCircle,   color: '#059669', bg: '#ecfdf5' },
  urgent:        { icon: AlertTriangle, color: '#dc2626', bg: '#fef2f2' },
  new_complaint: { icon: Package,       color: '#7c3aed', bg: '#f5f3ff' },
  resolved:      { icon: CheckCircle,   color: '#059669', bg: '#ecfdf5' },
  default:       { icon: Info,          color: '#0891b2', bg: '#ecfeff' },
};

export default function Notifications() {
  const { notifications, markAllRead, unreadCount } = useAuth();

  useEffect(() => {
    // Mark all read after a short delay
    const t = setTimeout(() => markAllRead(), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ maxWidth: 700, animation: 'fadeIn .35s ease both' }}>
      <div style={{
        background: '#fff', border: '1px solid var(--gray-200)',
        borderRadius: 'var(--radius-md)', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 22px', borderBottom: '1px solid var(--gray-100)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Bell size={17} color="var(--gray-700)" />
            <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-900)' }}>Notifications</h2>
            {unreadCount > 0 && (
              <span style={{
                background: 'var(--blue-600)', color: '#fff',
                fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 99,
              }}>{unreadCount} new</span>
            )}
          </div>
          {notifications.length > 0 && (
            <button onClick={markAllRead} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'none', border: 'none',
              color: 'var(--blue-600)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
            }}>
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
        </div>

        {/* List */}
        {notifications.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔔</div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 6 }}>All caught up!</h3>
            <p style={{ fontSize: 13, color: 'var(--gray-400)' }}>No notifications yet. We'll notify you when your complaint status changes.</p>
          </div>
        ) : (
          <div>
            {notifications.map((n, i) => {
              const meta = NOTIF_ICONS[n.type] || NOTIF_ICONS.default;
              const Icon = meta.icon;
              return (
                <div key={n.id || i} style={{
                  display: 'flex', gap: 14, padding: '16px 22px',
                  borderBottom: i < notifications.length - 1 ? '1px solid var(--gray-100)' : 'none',
                  background: n.read ? '#fff' : '#f0f7ff',
                  transition: 'background .2s',
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={16} color={meta.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                      <p style={{ fontSize: 13.5, fontWeight: n.read ? 400 : 600, color: 'var(--gray-900)', lineHeight: 1.4 }}>
                        {n.title}
                      </p>
                      {!n.read && (
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#2563eb', flexShrink: 0, marginTop: 5 }} />
                      )}
                    </div>
                    {n.message && (
                      <p style={{ fontSize: 12.5, color: 'var(--gray-500)', marginTop: 2, lineHeight: 1.5 }}>{n.message}</p>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, color: 'var(--gray-400)', fontSize: 11.5 }}>
                      <Clock size={10} />
                      <span>{timeAgo(n.createdAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
