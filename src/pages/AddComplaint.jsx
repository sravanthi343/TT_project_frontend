import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader, User, Mail, Phone, Tag, MessageSquare, Zap } from 'lucide-react';
import { complaintAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { addNotification } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Field = ({ label, required, error, icon, children }) => (
  <div style={{ marginBottom: 20 }}>
    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 7 }}>
      {icon && <span style={{ color: 'var(--gray-400)' }}>{icon}</span>}
      {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
    </label>
    {children}
    {error && <p style={{ fontSize: 11.5, color: 'var(--danger)', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={11} />{error}</p>}
  </div>
);

const inp = (err) => ({
  width: '100%', padding: '11px 13px',
  border: `1.5px solid ${err ? 'var(--danger)' : 'var(--gray-200)'}`,
  borderRadius: 9, fontSize: 13.5, outline: 'none',
  background: '#fff', color: 'var(--gray-900)',
  transition: 'border-color .15s', fontFamily: 'var(--font-body)',
});

const CATEGORIES = ['PRODUCT', 'SERVICE', 'BILLING', 'TECHNICAL', 'DELIVERY', 'OTHER'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const PRIORITY_COLORS = { LOW: '#10b981', MEDIUM: '#f59e0b', HIGH: '#ef4444', CRITICAL: '#7c3aed' };
const PRIORITY_BG = { LOW: '#ecfdf5', MEDIUM: '#fffbeb', HIGH: '#fef2f2', CRITICAL: '#f5f3ff' };

export default function AddComplaint() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '', description: '',
    complainantName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    category: '', priority: 'MEDIUM',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.title.trim() || form.title.length < 5)           e.title = 'Title must be at least 5 characters';
    if (!form.description.trim() || form.description.length < 10) e.description = 'Description must be at least 10 characters';
    if (!form.complainantName.trim())                           e.complainantName = 'Name is required';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))      e.email = 'Valid email required';
    if (!form.category)                                         e.category = 'Please select a category';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const payload = { ...form, userId: user?.id };
      await complaintAPI.create(payload);
      // Add notification to user
      if (user) {
        addNotification(user.id, {
          type: 'new_complaint',
          title: 'Complaint submitted successfully',
          message: `Your complaint "${form.title}" has been received and is now under review.`,
        });
      }
      setSuccess(true);
      toast.success('Complaint submitted!');
      setTimeout(() => navigate('/complaints'), 2200);
    } catch (err) {
      // Fallback: store locally
      const stored = JSON.parse(localStorage.getItem('cms_local_complaints') || '[]');
      const newC = { ...form, userId: user?.id, id: Date.now(), status: 'OPEN', createdAt: new Date().toISOString() };
      stored.unshift(newC);
      localStorage.setItem('cms_local_complaints', JSON.stringify(stored));
      if (user) {
        addNotification(user.id, {
          type: 'new_complaint',
          title: 'Complaint submitted successfully',
          message: `"${form.title}" has been received and is under review.`,
        });
      }
      setSuccess(true);
      toast.success('Complaint submitted!');
      setTimeout(() => navigate('/complaints'), 2200);
    } finally { setLoading(false); }
  };

  if (success) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, animation: 'fadeIn .35s ease both' }}>
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, animation: 'fadeIn .3s ease both' }}>
        <CheckCircle size={38} color="#10b981" />
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 8 }}>Complaint Submitted!</h2>
      <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 6 }}>Your complaint has been received and linked to your account.</p>
      <p style={{ fontSize: 13, color: 'var(--gray-400)' }}>You'll be notified when the status changes. Redirecting…</p>
    </div>
  );

  return (
    <div style={{ maxWidth: 800, animation: 'fadeIn .35s ease both' }}>
      <div style={{ background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, var(--blue-700), var(--blue-900))', padding: '26px 30px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -40, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,.04)' }} />
          <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px', marginBottom: 4 }}>Submit a New Complaint</h2>
          <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 12.5 }}>Your complaint will be linked to your account: <strong style={{ color: 'rgba(255,255,255,.8)' }}>{user?.email}</strong></p>
        </div>

        <div style={{ padding: '28px 30px' }}>
          {errors._global && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: 20, display: 'flex', gap: 8, alignItems: 'center' }}>
              <AlertCircle size={14} color="#ef4444" /><span style={{ fontSize: 13, color: '#dc2626' }}>{errors._global}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Two-column: name + email */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="form-2col">
              <Field label="Your Name" required error={errors.complainantName} icon={<User size={12} />}>
                <input value={form.complainantName} onChange={e => set('complainantName', e.target.value)}
                  placeholder="Full name" style={inp(errors.complainantName)}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = errors.complainantName ? 'var(--danger)' : 'var(--gray-200)'}
                />
              </Field>
              <Field label="Email Address" required error={errors.email} icon={<Mail size={12} />}>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder="email@example.com" style={inp(errors.email)}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = errors.email ? 'var(--danger)' : 'var(--gray-200)'}
                />
              </Field>
            </div>

            <Field label="Phone Number" error={errors.phone} icon={<Phone size={12} />}>
              <input value={form.phone} onChange={e => set('phone', e.target.value)}
                placeholder="Optional contact number" style={inp(errors.phone)}
                onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = 'var(--gray-200)'}
              />
            </Field>

            <Field label="Complaint Title" required error={errors.title} icon={<Tag size={12} />}>
              <input value={form.title} onChange={e => set('title', e.target.value)}
                placeholder="Brief, descriptive title (min 5 chars)" style={inp(errors.title)}
                onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = errors.title ? 'var(--danger)' : 'var(--gray-200)'}
              />
            </Field>

            <Field label="Detailed Description" required error={errors.description} icon={<MessageSquare size={12} />}>
              <textarea value={form.description} onChange={e => set('description', e.target.value)}
                placeholder="Provide a detailed description of your complaint (min 10 chars)..."
                rows={4} style={{ ...inp(errors.description), resize: 'vertical', lineHeight: 1.6 }}
                onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = errors.description ? 'var(--danger)' : 'var(--gray-200)'}
              />
              <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4, textAlign: 'right' }}>{form.description.length}/1000</div>
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="form-2col">
              <Field label="Category" required error={errors.category} icon={<Tag size={12} />}>
                <select value={form.category} onChange={e => set('category', e.target.value)} style={{ ...inp(errors.category), cursor: 'pointer' }}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = errors.category ? 'var(--danger)' : 'var(--gray-200)'}
                >
                  <option value="">Select category…</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>)}
                </select>
              </Field>
              <Field label="Priority Level" icon={<Zap size={12} />}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {PRIORITIES.map(p => (
                    <button key={p} type="button" onClick={() => set('priority', p)} style={{
                      flex: 1, minWidth: 60, padding: '9px 6px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      border: `1.5px solid ${form.priority === p ? PRIORITY_COLORS[p] : 'var(--gray-200)'}`,
                      background: form.priority === p ? PRIORITY_BG[p] : '#fff',
                      color: form.priority === p ? PRIORITY_COLORS[p] : 'var(--gray-500)',
                      transition: 'all .15s',
                    }}>{p}</button>
                  ))}
                </div>
              </Field>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button type="button" onClick={() => navigate(-1)} style={{
                padding: '12px 24px', border: '1.5px solid var(--gray-200)', borderRadius: 10,
                background: '#fff', color: 'var(--gray-600)', fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
              }}>Cancel</button>
              <button type="submit" disabled={loading} style={{
                flex: 1, padding: '12px', background: loading ? '#93c5fd' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: loading ? 'none' : '0 4px 20px rgba(37,99,235,.3)',
              }}>
                {loading ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Submitting…</> : '→ Submit Complaint'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <style>{`@media(max-width:600px){.form-2col{grid-template-columns:1fr!important}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
