import { useState, useEffect } from 'react';
import { Zap, RefreshCw, AlertTriangle } from 'lucide-react';
import { complaintAPI, MOCK_COMPLAINTS } from '../services/api';
import ComplaintCard from '../components/ComplaintCard';

export default function Urgent() {
  const [complaints, setComplaints] = useState(
    MOCK_COMPLAINTS.filter(c => ['HIGH','CRITICAL'].includes(c.priority) && ['OPEN','IN_PROGRESS'].includes(c.status))
  );
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await complaintAPI.getUrgent();
      const data = res.data || res;
      setComplaints(Array.isArray(data) ? data : MOCK_COMPLAINTS.filter(c => ['HIGH','CRITICAL'].includes(c.priority)));
    } catch {
      setComplaints(MOCK_COMPLAINTS.filter(c => ['HIGH','CRITICAL'].includes(c.priority) && ['OPEN','IN_PROGRESS'].includes(c.status)));
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const critical = complaints.filter(c => c.priority === 'CRITICAL');
  const high = complaints.filter(c => c.priority === 'HIGH');

  return (
    <div style={{ animation: 'fadeIn .35s ease both' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #7f1d1d, #991b1b)',
        borderRadius: 'var(--radius-md)', padding: '20px 24px', marginBottom: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={20} color="#fca5a5" />
          </div>
          <div>
            <h2 style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>Urgent Complaints</h2>
            <p style={{ color: 'rgba(255,255,255,.55)', fontSize: 12.5 }}>
              {complaints.length} active — {critical.length} critical, {high.length} high priority
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          {[['CRITICAL', critical.length, '#fca5a5'], ['HIGH', high.length, '#fcd34d']].map(([label, count, color]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color, letterSpacing: '-1px' }}>{count}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', fontWeight: 600, textTransform: 'uppercase' }}>{label}</div>
            </div>
          ))}
          <button onClick={load} disabled={loading} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 8,
            background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)',
            color: '#fff', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
          }}>
            <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
          </button>
        </div>
      </div>

      {/* Critical section */}
      {!loading && critical.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <AlertTriangle size={14} color="#dc2626" />
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '.05em' }}>Critical Priority ({critical.length})</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
            {critical.map(c => <ComplaintCard key={c.id} complaint={c} />)}
          </div>
        </div>
      )}

      {/* High section */}
      {!loading && high.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <AlertTriangle size={14} color="#d97706" />
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '.05em' }}>High Priority ({high.length})</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
            {high.map(c => <ComplaintCard key={c.id} complaint={c} />)}
          </div>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {[...Array(4)].map((_, i) => <div key={i} style={{ height: 160, borderRadius: 10, background: 'var(--gray-100)', animation: 'pulse 2s infinite', animationDelay: `${i*0.1}s` }} />)}
        </div>
      )}

      {/* Empty */}
      {!loading && complaints.length === 0 && (
        <div style={{ textAlign: 'center', padding: '70px 24px', background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
          <div style={{ fontSize: 48, marginBottom: 14 }}>✅</div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--gray-700)', marginBottom: 6 }}>All clear!</h3>
          <p style={{ fontSize: 13.5, color: 'var(--gray-400)' }}>No urgent complaints right now. Great job keeping on top of things!</p>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
