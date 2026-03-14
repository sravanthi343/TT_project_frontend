import { useState, useEffect } from 'react';
import { Users, ClipboardList, AlertTriangle, CheckCircle, Clock, Mail, Phone, Eye, Filter } from 'lucide-react';
import { complaintAPI, MOCK_COMPLAINTS } from '../services/api';
import { STATUS_META, PRIORITY_META, CATEGORY_META, timeAgo, formatDateTime } from '../utils/helpers';

const STATUSES = ['', 'OPEN', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED', 'CLOSED', 'REJECTED'];

export default function AdminPanel() {
  const [complaints, setComplaints] = useState(MOCK_COMPLAINTS);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await complaintAPI.getAll({ size: 50 });
        setComplaints(res.data || MOCK_COMPLAINTS);
      } catch { setComplaints(MOCK_COMPLAINTS); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const filtered = status ? complaints.filter(c => c.status === status) : complaints;

  const stats = {
    total: complaints.length,
    open: complaints.filter(c => c.status === 'OPEN').length,
    urgent: complaints.filter(c => ['HIGH', 'CRITICAL'].includes(c.priority) && c.status === 'OPEN').length,
    resolved: complaints.filter(c => c.status === 'RESOLVED').length,
  };

  return (
    <div style={{ animation: 'fadeIn .35s ease both' }}>
      {/* Header banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
        borderRadius: 'var(--radius-md)', padding: '20px 24px', marginBottom: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={20} color="#a5b4fc" />
          </div>
          <div>
            <h2 style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>Admin Panel</h2>
            <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 12 }}>Full complaint management with user details</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {[
            { label: 'Total', value: stats.total, color: '#818cf8' },
            { label: 'Open', value: stats.open, color: '#fbbf24' },
            { label: 'Urgent', value: stats.urgent, color: '#f87171' },
            { label: 'Resolved', value: stats.resolved, color: '#34d399' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color, letterSpacing: '-1px' }}>{s.value}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', fontWeight: 600, textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter bar */}
      <div style={{
        background: '#fff', border: '1px solid var(--gray-200)',
        borderRadius: 'var(--radius-md)', padding: '12px 18px', marginBottom: 16,
        display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
      }}>
        <Filter size={14} color="var(--gray-400)" />
        <span style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, marginRight: 4 }}>Filter by Status:</span>
        {STATUSES.map(s => (
          <button key={s} onClick={() => setStatus(s)} style={{
            padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 500, cursor: 'pointer',
            border: status === s ? '1.5px solid var(--blue-500)' : '1.5px solid var(--gray-200)',
            background: status === s ? 'var(--blue-50)' : '#fff',
            color: status === s ? 'var(--blue-600)' : 'var(--gray-600)',
          }}>{s || 'All'}</button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--gray-400)' }}>{filtered.length} records</span>
      </div>

      {/* Table */}
      <div style={{
        background: '#fff', border: '1px solid var(--gray-200)',
        borderRadius: 'var(--radius-md)', overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray-400)', fontSize: 13 }}>Loading complaints…</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)' }}>
                  {['#', 'Complainant', 'Complaint', 'Category', 'Priority', 'Status', 'Submitted', 'Actions'].map(h => (
                    <th key={h} style={{
                      padding: '12px 14px', textAlign: 'left',
                      fontSize: 11, fontWeight: 700, color: 'var(--gray-500)',
                      textTransform: 'uppercase', letterSpacing: '.05em', whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => {
                  const sm = STATUS_META[c.status] || STATUS_META.OPEN;
                  const pm = PRIORITY_META[c.priority] || PRIORITY_META.MEDIUM;
                  const cm = CATEGORY_META[c.category] || CATEGORY_META.OTHER;
                  return (
                    <tr key={c.id} style={{
                      borderBottom: i < filtered.length - 1 ? '1px solid var(--gray-100)' : 'none',
                      background: selected === c.id ? '#f0f7ff' : '#fff',
                      transition: 'background .15s',
                    }}>
                      <td style={{ padding: '12px 14px', color: 'var(--gray-400)', fontSize: 12 }}>#{c.id}</td>

                      {/* Complainant details */}
                      <td style={{ padding: '12px 14px', minWidth: 180 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                            background: 'linear-gradient(135deg, var(--blue-500), var(--blue-700))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: 11, fontWeight: 700,
                          }}>
                            {c.complainantName?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--gray-900)', fontSize: 13 }}>{c.complainantName}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--gray-400)', fontSize: 11 }}>
                              <Mail size={9} /> {c.email}
                            </div>
                            {c.phone && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--gray-400)', fontSize: 11 }}>
                                <Phone size={9} /> {c.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '12px 14px', maxWidth: 220 }}>
                        <div style={{ fontWeight: 600, color: 'var(--gray-800)', fontSize: 13, marginBottom: 2 }}>
                          {c.title?.length > 45 ? c.title.slice(0, 45) + '…' : c.title}
                        </div>
                        {c.description && (
                          <div style={{ fontSize: 11.5, color: 'var(--gray-400)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
                            {c.description}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontSize: 16 }}>{cm.icon}</span>
                        <span style={{ fontSize: 11.5, color: 'var(--gray-600)', marginLeft: 5 }}>{cm.label}</span>
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 99,
                          background: pm.bg, color: pm.color, whiteSpace: 'nowrap',
                        }}>{c.priority}</span>
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 99,
                          background: sm.bg, color: sm.color, whiteSpace: 'nowrap',
                        }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: sm.dot }} />
                          {sm.label}
                        </span>
                      </td>

                      <td style={{ padding: '12px 14px', color: 'var(--gray-400)', fontSize: 11.5, whiteSpace: 'nowrap' }}>
                        {timeAgo(c.createdAt)}
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        <button onClick={() => setSelected(selected === c.id ? null : c.id)} style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          padding: '5px 10px', borderRadius: 6,
                          border: '1.5px solid var(--gray-200)', background: '#fff',
                          color: 'var(--gray-600)', fontSize: 12, cursor: 'pointer',
                          fontWeight: 500,
                        }}>
                          <Eye size={12} /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (() => {
        const c = complaints.find(x => x.id === selected);
        if (!c) return null;
        const sm = STATUS_META[c.status] || STATUS_META.OPEN;
        const pm = PRIORITY_META[c.priority] || PRIORITY_META.MEDIUM;
        return (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)',
            zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }} onClick={() => setSelected(null)}>
            <div style={{
              background: '#fff', borderRadius: 16, padding: 28,
              maxWidth: 540, width: '100%',
              boxShadow: '0 24px 80px rgba(0,0,0,.25)',
              animation: 'fadeIn .2s ease both',
            }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-900)' }}>Complaint #{c.id}</h3>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', fontSize: 20 }}>×</button>
              </div>

              <div style={{ background: 'var(--gray-50)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Submitted By</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--blue-500), var(--blue-700))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: 14,
                  }}>{c.complainantName?.split(' ').map(w => w[0]).join('').slice(0, 2) || 'U'}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--gray-900)' }}>{c.complainantName}</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{c.email}{c.phone ? ` · ${c.phone}` : ''}</div>
                  </div>
                </div>
              </div>

              <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 8 }}>{c.title}</h4>
              <p style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.6, marginBottom: 16 }}>{c.description}</p>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 99, background: sm.bg, color: sm.color }}>{sm.label}</span>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 99, background: pm.bg, color: pm.color }}>{c.priority}</span>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 99, background: 'var(--gray-100)', color: 'var(--gray-600)' }}>{c.category}</span>
              </div>

              {c.resolutionNote && (
                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#059669', marginBottom: 4 }}>RESOLUTION NOTE</div>
                  <p style={{ fontSize: 13, color: '#065f46' }}>{c.resolutionNote}</p>
                </div>
              )}

              <div style={{ fontSize: 11.5, color: 'var(--gray-400)', marginTop: 14 }}>
                Created: {formatDateTime(c.createdAt)}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
