export default function Footer() {
  return (
    <footer style={{
      marginLeft: 'var(--sidebar-w)',
      padding: '16px 32px',
      borderTop: '1px solid var(--gray-200)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: '#fff',
      fontSize: 12,
      color: 'var(--gray-400)',
    }} className="app-footer">
      <span>© {new Date().getFullYear()} Complaint Management System · v1.0.0</span>
      <span>Built with React + Vite + Spring Boot</span>
      <style>{`
        @media (max-width: 768px) { .app-footer { margin-left: 0 !important; } }
      `}</style>
    </footer>
  );
}
