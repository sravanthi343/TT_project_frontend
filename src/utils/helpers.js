// ─── Date formatting ──────────────────────────────────────────────────────────

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(new Date(dateStr));
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(dateStr));
};

export const timeAgo = (dateStr) => {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return 'just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  < 7)  return `${days}d ago`;
  return formatDate(dateStr);
};

// ─── Status helpers ───────────────────────────────────────────────────────────

export const STATUS_META = {
  OPEN:        { label: 'Open',        color: '#3b82f6', bg: '#eff6ff', dot: '#2563eb' },
  IN_PROGRESS: { label: 'In Progress', color: '#f59e0b', bg: '#fffbeb', dot: '#d97706' },
  ON_HOLD:     { label: 'On Hold',     color: '#8b5cf6', bg: '#f5f3ff', dot: '#7c3aed' },
  RESOLVED:    { label: 'Resolved',    color: '#10b981', bg: '#ecfdf5', dot: '#059669' },
  CLOSED:      { label: 'Closed',      color: '#6b7280', bg: '#f9fafb', dot: '#4b5563' },
  REJECTED:    { label: 'Rejected',    color: '#ef4444', bg: '#fef2f2', dot: '#dc2626' },
};

export const PRIORITY_META = {
  LOW:      { label: 'Low',      color: '#10b981', bg: '#ecfdf5' },
  MEDIUM:   { label: 'Medium',   color: '#f59e0b', bg: '#fffbeb' },
  HIGH:     { label: 'High',     color: '#ef4444', bg: '#fef2f2' },
  CRITICAL: { label: 'Critical', color: '#7c3aed', bg: '#f5f3ff' },
};

export const CATEGORY_META = {
  PRODUCT:   { label: 'Product',   icon: '📦' },
  SERVICE:   { label: 'Service',   icon: '🛎️' },
  BILLING:   { label: 'Billing',   icon: '💳' },
  TECHNICAL: { label: 'Technical', icon: '🔧' },
  DELIVERY:  { label: 'Delivery',  icon: '🚚' },
  OTHER:     { label: 'Other',     icon: '📝' },
};

// ─── Misc ─────────────────────────────────────────────────────────────────────

export const truncate = (str, max = 80) =>
  str && str.length > max ? str.slice(0, max) + '…' : str;

export const capitalize = (s) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';

export const classNames = (...args) => args.filter(Boolean).join(' ');
