import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  ClipboardList, CheckCircle, Clock, AlertTriangle,
  TrendingUp, Users, ArrowRight, Zap
} from 'lucide-react';
import { complaintAPI, MOCK_STATS, MOCK_COMPLAINTS } from '../services/api';
import ComplaintCard from '../components/ComplaintCard';

const StatCard = ({ label, value, icon: Icon, color, bg, sub, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: '#fff', border: '1px solid var(--gray-200)',
      borderRadius: 'var(--radius-md)', padding: '20px 22px',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all var(--transition)',
      position: 'relative', overflow: 'hidden',
    }}
    onMouseEnter={e => onClick && (e.currentTarget.style.boxShadow = 'var(--shadow-md)', e.currentTarget.style.transform = 'translateY(-2px)')}
    onMouseLeave={e => onClick && (e.currentTarget.style.boxShadow = 'none', e.currentTarget.style.transform = 'translateY(0)')}
  >
    <div style={{
      position: 'absolute', top: -20, right: -20, width: 80, height: 80,
      borderRadius: '50%', background: bg, opacity: .5,
    }} />
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</span>
      <div style={{ width: 34, height: 34, borderRadius: 9, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={16} color={color} strokeWidth={2.2} />
      </div>
    </div>
    <div style={{ fontSize: 30, fontWeight: 700, color: 'var(--gray-900)', letterSpacing: '-1px', lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: 11.5, color: 'var(--gray-400)', marginTop: 6 }}>{sub}</div>}
  </div>
);

const PIE_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#6b7280', '#ef4444', '#8b5cf6'];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [stats, setStats]       = useState(MOCK_STATS);
  const [recent, setRecent]     = useState(MOCK_COMPLAINTS.slice(0, 4));
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [s, r] = await Promise.all([
          complaintAPI.getStats(),
          complaintAPI.getRecent(4),
        ]);
        setStats(s.data || s);
        setRecent((r.data || r).recent || r.data || MOCK_COMPLAINTS.slice(0,4));
      } catch {
        // keep mock data
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const categoryData = Object.entries(stats.byCategory || {}).map(([name, value]) => ({ name, value }));
  const priorityData = Object.entries(stats.byPriority || {}).map(([name, value]) => ({ name, value }));

  const statusCards = [
    { label: 'Total',       value: stats.total,      icon: ClipboardList, color: '#2563eb', bg: '#eff6ff', sub: 'All complaints',        filter: null },
    { label: 'Open',        value: stats.open,       icon: AlertTriangle, color: '#d97706', bg: '#fffbeb', sub: 'Awaiting action',        filter: 'OPEN' },
    { label: 'In Progress', value: stats.inProgress, icon: Clock,         color: '#7c3aed', bg: '#f5f3ff', sub: 'Being worked on',        filter: 'IN_PROGRESS' },
    { label: 'Resolved',    value: stats.resolved,   icon: CheckCircle,   color: '#059669', bg: '#ecfdf5', sub: 'Successfully closed',    filter: 'RESOLVED' },
    { label: 'Urgent',      value: stats.urgentCount,icon: Zap,           color: '#dc2626', bg: '#fef2f2', sub: 'High/Critical priority', filter: null, onClick: () => navigate('/urgent') },
    { label: 'Unassigned',  value: stats.unassignedCount, icon: Users,   color: '#0891b2', bg: '#ecfeff', sub: 'Need assignment',         filter: null },
  ];

  return (
    <div style={{ animation: 'fadeIn .35s ease both' }}>
      {/* Welcome banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--blue-700) 0%, var(--blue-900) 100%)',
        borderRadius: 'var(--radius-lg)', padding: '24px 28px', marginBottom: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -20, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,.04)' }} />
        <div style={{ position: 'absolute', bottom: -30, right: 80, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,.03)' }} />
        <div>
          <div style={{ color: 'rgba(255,255,255,.6)', fontSize: 12, fontWeight: 500, marginBottom: 4 }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0] || 'there'} 👋
          </div>
          <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700, letterSpacing: '-0.4px' }}>
            Here's what's happening today
          </h2>
          <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 13, marginTop: 4 }}>
            {stats.open} open complaints need your attention
          </p>
        </div>
        <button
          onClick={() => navigate('/add')}
          style={{
            background: '#fff', color: 'var(--blue-700)',
            border: 'none', borderRadius: 9, padding: '10px 18px',
            fontWeight: 600, fontSize: 13, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            flexShrink: 0,
          }}
        >
          <span>+ New</span>
        </button>
      </div>

      {/* Stat cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 16, marginBottom: 24,
      }}>
        {statusCards.map((c) => (
          <StatCard
            key={c.label}
            {...c}
            onClick={c.onClick || (c.filter ? () => navigate(`/complaints?status=${c.filter}`) : undefined)}
          />
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }} className="chart-grid">

        {/* Category bar chart */}
        <div style={{ background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-800)' }}>By Category</h3>
            <TrendingUp size={14} color="var(--gray-400)" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={categoryData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
                cursor={{ fill: '#f9fafb' }}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Priority pie chart */}
        <div style={{ background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-800)' }}>By Priority</h3>
            <Zap size={14} color="var(--gray-400)" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={priorityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={72} innerRadius={36}>
                {priorityData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#6b7280' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent complaints */}
      <div style={{ background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', padding: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-800)' }}>Recent Complaints</h3>
          <button
            onClick={() => navigate('/complaints')}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: 'none', border: 'none',
              color: 'var(--blue-600)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
            }}
          >
            View all <ArrowRight size={13} />
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {recent.map(c => <ComplaintCard key={c.id} complaint={c} />)}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { .chart-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
