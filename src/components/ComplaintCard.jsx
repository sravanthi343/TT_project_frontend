import { useNavigate } from 'react-router-dom';
import { Clock, User, Tag, ChevronRight, Mail } from 'lucide-react';
import { STATUS_META, PRIORITY_META, CATEGORY_META, timeAgo, truncate } from '../utils/helpers';

export default function ComplaintCard({ complaint, compact = false }) {
  const navigate = useNavigate();
  const sm = STATUS_META[complaint.status]    || STATUS_META.OPEN;
  const pm = PRIORITY_META[complaint.priority] || PRIORITY_META.MEDIUM;
  const cm = CATEGORY_META[complaint.category] || CATEGORY_META.OTHER;

  return (
    <article
      onClick={() => navigate(`/complaints?search=${encodeURIComponent(complaint.title || '')}`)}
      style={{
        background: '#fff', border: '1px solid var(--gray-200)',
        borderRadius: 'var(--radius-md)', padding: compact ? '14px 16px' : '18px 20px',
        cursor: 'pointer', transition: 'all var(--transition)',
        position: 'relative', overflow: 'hidden',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--blue-300)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gray-200)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {/* Priority stripe */}
      <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 3, background: pm.color, borderRadius: '10px 0 0 10px' }} />
      <div style={{ marginLeft: 8 }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 14 }}>{cm.icon}</span>
              <span style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 500 }}>#{complaint.id} · {cm.label}</span>
            </div>
            <h3 style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--gray-900)', letterSpacing: '-0.2px', lineHeight: 1.4 }}>
              {truncate(complaint.title, 70)}
            </h3>
          </div>
          <ChevronRight size={14} color="var(--gray-300)" style={{ flexShrink: 0, marginTop: 4 }} />
        </div>

        {/* Description */}
        {complaint.description && !compact && (
          <p style={{ fontSize: 12.5, color: 'var(--gray-500)', lineHeight: 1.5, marginBottom: 12 }}>
            {truncate(complaint.description, 100)}
          </p>
        )}

        {/* Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 99, background: sm.bg, color: sm.color }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: sm.dot }} />{sm.label}
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 99, background: pm.bg, color: pm.color }}>{pm.label}</span>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--gray-100)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--gray-500)', fontSize: 11.5 }}>
              <User size={11} /><span style={{ fontWeight: 500 }}>{complaint.complainantName}</span>
            </div>
            {complaint.email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--gray-400)', fontSize: 10.5 }}>
                <Mail size={9} /><span>{complaint.email}</span>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--gray-400)', fontSize: 11.5 }}>
            <Clock size={11} /><span>{timeAgo(complaint.createdAt)}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
