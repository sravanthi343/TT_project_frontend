# CMS Frontend — React + Vite

A modern, professional dashboard for the **Complaint Management System** built with React 18, Vite 5, and Recharts.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open in browser
http://localhost:5173
```

## 📁 Project Structure

```
frontend/
├── public/index.html           # HTML shell
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx         # Responsive sidebar navigation
│   │   ├── Navbar.jsx          # Top navigation bar with search
│   │   ├── Footer.jsx          # App footer
│   │   └── ComplaintCard.jsx   # Complaint list card
│   ├── pages/
│   │   ├── Dashboard.jsx       # Stats + charts + recent complaints
│   │   ├── Complaints.jsx      # Searchable, filterable complaints list
│   │   ├── AddComplaint.jsx    # Validated complaint submission form
│   │   ├── Urgent.jsx          # High/Critical open complaints
│   │   └── NotFound.jsx        # 404 page
│   ├── services/api.js         # Axios API layer + mock data
│   ├── utils/helpers.js        # formatDate, STATUS_META, etc.
│   ├── App.jsx                 # Router + layout
│   ├── main.jsx                # React entry point
│   └── index.css               # CSS variables + global styles
├── vite.config.js              # Vite + proxy config
└── package.json
```

## 🔌 Backend Connection

The app proxies `/api/*` to `http://localhost:8080` (Spring Boot).
If backend is unavailable, **mock data is used automatically** — no errors shown.

To change the API URL, set in `.env`:
```
VITE_API_URL=http://your-backend-url/api
```

## 🎨 Design System

- **Font**: Sora (body) + JetBrains Mono (code/IDs)
- **Colors**: Blue-950 sidebar, white cards, gray-50 background
- **Charts**: Recharts (BarChart + PieChart)
- **Icons**: Lucide React
- **Toasts**: React Hot Toast
- **Routing**: React Router v6

## 📦 Build for Production

```bash
npm run build
# Output → dist/
```

## 🧪 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (port 5173) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
