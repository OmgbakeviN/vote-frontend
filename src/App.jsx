import { Routes, Route, Link, useLocation } from "react-router-dom";
import PublicPage from "./pages/PublicPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";

export default function App() {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-semibold text-lg">School Vote</Link>
          <nav className="flex gap-4">
            <Link className={`hover:underline ${pathname === "/" ? "font-bold" : ""}`} to="/">Public</Link>
            {/* <Link className={`hover:underline ${pathname === "/admin" ? "font-bold" : ""}`} to="/admin">Admin</Link> */}
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<PublicPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
      <footer className="border-t bg-white">
        <div className="max-w-5xl mx-auto px-4 py-3 text-sm text-slate-500">
          © {new Date().getFullYear()} — Live poll with Django + React (polling)
        </div>
      </footer>
    </div>
  );
}
