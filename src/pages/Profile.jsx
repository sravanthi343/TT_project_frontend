import { useState, useEffect } from 'react';
import { User, Mail, Phone, Shield, Edit2, Save, X, Clock, ClipboardList, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { complaintAPI, MOCK_COMPLAINTS } from '../services/api';
import { STATUS_META, PRIORITY_META, timeAgo } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateProfile, isAdmin } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [myComplaints, setMyComplaints] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await complaintAPI.getByEmail(user.email);
        setMyComplaints(res.data || res || []);
      } catch {
        setMyComplaints(MOCK_COMPLAINTS.filter(c => c.email === user.email));
      } finally { setLoading(false); }
    };
    if (user) load();
  }, [user]);

  const handleSave = () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    updateProfile({ name: form.name, phone: form.phone });
    setEditing(false);
    toast.success('Profile updated!');
  };

  const stats = {
    total: myComplaints.length,
    open: myComplaints.filter(c => c.status === 'OPEN').length,
    inProgress: myComplaints.filter(c => c.status === 'IN_PROGRESS').length,
    resolved: myComplaints.filter(c => c.status === 'RESOLVED').length,
  };

  return (
    <div style={{ maxWidth: 900, animation: 'fadeIn .35s ease both' }}>
      {/* Profile card */}
      <div style={{
        background: '#fff', border: '1px solid var(--gray-200)',
        borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 24,
      }}>
        {/* Banner */}
        <div style={{
          background: 'linear-gradient(135deg, var(--blue-700), var(--blue-900))',
          height: 100, position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,.04)' }} />
        </div>

        {/* Avatar + Info */}
        <div style={{ padding: '0 32px 28px', position: 'relative' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--blue-500), var(--blue-700))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 26,
            border: '4px solid #fff',
            position: 'absolute', top: -40,
            boxShadow: '0 4px 16px rgba(0,0,0,.15)',
          }}>{user?.avatar || user?.name?.[0] || 'U'}</div>

          <div style={{ paddingTop: 48 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                {editing ? (
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    style={{
                      fontSize: 22, fontWeight: 700, border: '1.5px solid var(--blue-400)',
                      borderRadius: 8, padding: '4px 10px', outline: 'none',
                      color: 'var(--gray-900)', fontFamily: 'var(--font-body)', marginBottom: 4,
                    }}
                  />
                ) : (
                  <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--gray-900)', letterSpacing: '-0.4px' }}>{user?.name}</h2>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99,
                    background: isAdmin ? '#ecfdf5' : '#eff6ff',
                    color: isAdmin ? '#059669' : '#2563eb',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <Shield size={10} /> {user?.role}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>
                    Member since {new Date(user?.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {editing ? (
                  <>
                    <button onClick={handleSave} style={btnStyle('primary')}>
                      <Save size={13} /> Save
                    </button>
                    <button onClick={() => { setEditing(false); setForm({ name: user.name, phone: user.phone || '' }); }} style={btnStyle('ghost')}>
                      <X size={13} /> Cancel
                    </button>
                  </>
                ) : (
                  <button onClick={() => setEditing(true)} style={btnStyle('secondary')}>
                    <Edit2 size={13} /> Edit Profile
                  </button>
                )}
              </div>
            </div>

            {/* Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 24 }} className="profile-grid">
              <InfoField icon={<Mail size={14} />} label="Email Address" value={user?.email} editable={false} />
              <InfoField icon={<Phone size={14} />} label="Phone Number"
                value={editing ? (
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="Enter phone number"
                    style={{ border: '1.5px solid var(--blue-400)', borderRadius: 6, padding: '4px 8px', fontSize: 13, outline: 'none', fontFamily: 'var(--font-body)', width: '100%' }}
                  />
                ) : (user?.phone || <span style={{ color: 'var(--gray-300)' }}>Not provided</span>)}
              />
              <InfoField icon={<User size={14} />} label="User ID" value={<code style={{ fontSize: 11, color: 'var(--gray-400)' }}>{user?.id}</code>} />
              <InfoField icon={<Clock size={14} />} label="Account Created" value={new Date(user?.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }} className="stats-4">
        {[
          { label: 'Total Complaints', value: stats.total, icon: ClipboardList, color: '#2563eb', bg: '#eff6ff' },
          { label: 'Open',             value: stats.open,      icon: AlertTriangle, color: '#d97706', bg: '#fffbeb' },
          { label: 'In Progress',      value: stats.inProgress,icon: Clock,         color: '#7c3aed', bg: '#f5f3ff' },
          { label: 'Resolved',         value: stats.resolved,  icon: CheckCircle,   color: '#059669', bg: '#ecfdf5' },
        ].map(s => (
          <div key={s.label} style={{
            background: '#fff', border: '1px solid var(--gray-200)',
            borderRadius: 'var(--radius-md)', padding: '18px 20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{s.label}</span>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={14} color={s.color} />
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--gray-900)', letterSpacing: '-1px' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* My Complaints */}
      {!isAdmin && (
        <div style={{ background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', padding: 22 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-800)', marginBottom: 16 }}>My Complaints</h3>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--gray-400)', fontSize: 13 }}>Loading…</div>
          ) : myComplaints.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-400)' }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
              <p style={{ fontSize: 13 }}>You haven't submitted any complaints yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {myComplaints.map(c => {
                const sm = STATUS_META[c.status] || STATUS_META.OPEN;
                const pm = PRIORITY_META[c.priority] || PRIORITY_META.MEDIUM;
                return (
                  <div key={c.id} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 16px', borderRadius: 8,
                    border: '1px solid var(--gray-100)', background: '#fafafa',
                  }}>
                    <div style={{ width: 3, height: 36, borderRadius: 99, background: pm.color, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--gray-900)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--gray-400)' }}>{timeAgo(c.createdAt)}</div>
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 99,
                      background: sm.bg, color: sm.color, whiteSpace: 'nowrap',
                    }}>{sm.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 700px) {
          .profile-grid { grid-template-columns: 1fr !important; }
          .stats-4 { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}

const InfoField = ({ icon, label, value }) => (
  <div style={{ background: 'var(--gray-50)', borderRadius: 8, padding: '12px 14px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, color: 'var(--gray-400)' }}>
      {icon}
      <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</span>
    </div>
    <div style={{ fontSize: 13.5, color: 'var(--gray-800)', fontWeight: 500 }}>{value}</div>
  </div>
);

const btnStyle = (type) => ({
  display: 'flex', alignItems: 'center', gap: 5,
  padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
  border: type === 'primary' ? 'none' : '1.5px solid var(--gray-200)',
  background: type === 'primary' ? 'var(--blue-600)' : type === 'ghost' ? '#fff' : 'var(--gray-50)',
  color: type === 'primary' ? '#fff' : 'var(--gray-700)',
  transition: 'all .15s',
});
