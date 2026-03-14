import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, X, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { complaintAPI, MOCK_COMPLAINTS } from '../services/api';
import ComplaintCard from '../components/ComplaintCard';

const STATUSES   = ['', 'OPEN', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED', 'CLOSED', 'REJECTED'];
const CATEGORIES = ['', 'PRODUCT', 'SERVICE', 'BILLING', 'TECHNICAL', 'DELIVERY', 'OTHER'];
const PRIORITIES = ['', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const Chip = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: '5px 12px', borderRadius: 99, fontSize: 12, fontWeight: 500,
      border: active ? '1.5px solid var(--blue-500)' : '1.5px solid var(--gray-200)',
      background: active ? 'var(--blue-50)' : '#fff',
      color: active ? 'var(--blue-600)' : 'var(--gray-600)',
      cursor: 'pointer', transition: 'all .15s',
      whiteSpace: 'nowrap',
    }}
  >{label || 'All'}</button>
);

export default function Complaints() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState(MOCK_COMPLAINTS);
  const [loading, setLoading]       = useState(false);
  const [total, setTotal]           = useState(MOCK_COMPLAINTS.length);
  const [page, setPage]             = useState(0);
  const [search, setSearch]         = useState(params.get('search') || '');
  const [searchInput, setSearchInput] = useState(params.get('search') || '');
  const [status, setStatus]         = useState(params.get('status') || '');
  const [category, setCategory]     = useState('');
  const [priority, setPriority]     = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const SIZE = 9;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      if (search) {
        res = await complaintAPI.search(search, { page, size: SIZE });
      } else if (status) {
        res = await complaintAPI.getByStatus(status, { page, size: SIZE });
      } else if (category) {
        res = await complaintAPI.getByCategory(category, { page, size: SIZE });
      } else if (priority) {
        res = await complaintAPI.getByPriority(priority, { page, size: SIZE });
      } else {
        res = await complaintAPI.getAll({ page, size: SIZE, sortBy: 'createdAt', sortDir: 'desc' });
      }
      setComplaints(res.data || MOCK_COMPLAINTS);
      setTotal(res.totalItems ?? (res.data?.length ?? MOCK_COMPLAINTS.length));
    } catch {
      // keep mock
    } finally { setLoading(false); }
  }, [search, status, category, priority, page]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(0);
  };

  const clearAll = () => {
    setSearch(''); setSearchInput('');
    setStatus(''); setCategory(''); setPriority('');
    setPage(0);
  };

  const hasFilters = search || status || category || priority;
  const totalPages = Math.ceil(total / SIZE);

  return (
    <div style={{ animation: 'fadeIn .35s ease both' }}>
      {/* Toolbar */}
      <div style={{
        background: '#fff', border: '1px solid var(--gray-200)',
        borderRadius: 'var(--radius-md)', padding: '14px 18px',
        marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap',
      }}>
        {/* Search */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 6, flex: 1, minWidth: 220 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search by title, name, email…"
              style={{
                width: '100%', paddingLeft: 32, paddingRight: 10,
                height: 36, border: '1.5px solid var(--gray-200)',
                borderRadius: 8, fontSize: 13, outline: 'none',
                transition: 'border-color .15s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--blue-400)'}
              onBlur={e => e.target.style.borderColor = 'var(--gray-200)'}
            />
          </div>
          <button type="submit" style={{
            background: 'var(--blue-600)', color: '#fff',
            border: 'none', borderRadius: 8, padding: '0 14px',
            fontWeight: 600, fontSize: 13, cursor: 'pointer',
          }}>Search</button>
        </form>

        <button
          onClick={() => setShowFilters(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '0 14px', height: 36,
            border: showFilters ? '1.5px solid var(--blue-400)' : '1.5px solid var(--gray-200)',
            background: showFilters ? 'var(--blue-50)' : '#fff',
            color: showFilters ? 'var(--blue-600)' : 'var(--gray-600)',
            borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}
        >
          <Filter size={13} /> Filters {hasFilters ? '●' : ''}
        </button>

        {hasFilters && (
          <button onClick={clearAll} style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '0 10px', height: 36,
            border: '1.5px solid var(--gray-200)', background: '#fff',
            color: 'var(--gray-500)', borderRadius: 8, fontSize: 12.5, cursor: 'pointer',
          }}>
            <X size={12} /> Clear
          </button>
        )}

        <button onClick={() => navigate('/add')} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '0 16px', height: 36,
          background: 'var(--blue-600)', color: '#fff',
          border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          marginLeft: 'auto',
        }}>
          <Plus size={14} /> New
        </button>
      </div>

      {/* Filter chips */}
      {showFilters && (
        <div style={{
          background: '#fff', border: '1px solid var(--gray-200)',
          borderRadius: 'var(--radius-md)', padding: '14px 18px', marginBottom: 16,
          animation: 'fadeIn .2s ease both',
        }}>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>Status</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {STATUSES.map(s => <Chip key={s} label={s || 'All'} active={status === s} onClick={() => { setStatus(s); setPage(0); }} />)}
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>Category</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {CATEGORIES.map(c => <Chip key={c} label={c || 'All'} active={category === c} onClick={() => { setCategory(c); setPage(0); }} />)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>Priority</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {PRIORITIES.map(p => <Chip key={p} label={p || 'All'} active={priority === p} onClick={() => { setPriority(p); setPage(0); }} />)}
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <p style={{ fontSize: 13, color: 'var(--gray-500)' }}>
          {loading ? 'Loading…' : `Showing ${complaints.length} of ${total} complaints`}
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{
              height: 160, borderRadius: 'var(--radius-md)',
              background: 'var(--gray-100)', animation: 'pulse 2s infinite',
              animationDelay: `${i * 0.1}s`,
            }} />
          ))}
        </div>
      ) : complaints.length === 0 ? (
        <div style={{
          background: '#fff', border: '1px solid var(--gray-200)',
          borderRadius: 'var(--radius-md)', padding: '60px 24px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 6 }}>No complaints found</h3>
          <p style={{ fontSize: 13.5, color: 'var(--gray-400)' }}>Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {complaints.map(c => <ComplaintCard key={c.id} complaint={c} />)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 8, marginTop: 24,
        }}>
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '7px 14px', borderRadius: 8,
              border: '1.5px solid var(--gray-200)', background: '#fff',
              fontSize: 13, cursor: page === 0 ? 'not-allowed' : 'pointer',
              color: page === 0 ? 'var(--gray-300)' : 'var(--gray-700)',
            }}
          >
            <ChevronLeft size={14} /> Prev
          </button>

          {[...Array(Math.min(5, totalPages))].map((_, i) => {
            const p = Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
            return (
              <button key={p} onClick={() => setPage(p)} style={{
                width: 36, height: 36, borderRadius: 8,
                border: p === page ? '1.5px solid var(--blue-500)' : '1.5px solid var(--gray-200)',
                background: p === page ? 'var(--blue-600)' : '#fff',
                color: p === page ? '#fff' : 'var(--gray-700)',
                fontSize: 13, fontWeight: p === page ? 600 : 400, cursor: 'pointer',
              }}>{p + 1}</button>
            );
          })}

          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '7px 14px', borderRadius: 8,
              border: '1.5px solid var(--gray-200)', background: '#fff',
              fontSize: 13, cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
              color: page >= totalPages - 1 ? 'var(--gray-300)' : 'var(--gray-700)',
            }}
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
