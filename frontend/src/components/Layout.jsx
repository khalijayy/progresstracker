import { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import Card from './ui/Card';

const UserAccount = () => {
  const { user } = useAuth();
  // Prefer username if available, otherwise fall back to fullName / name / email local part
  const displayName = user
    ? user.username || user.fullName || user.name || (user.email ? user.email.split('@')[0] : 'Account')
    : 'Account';
  const email = user?.email || '';

  const initials = displayName
    .split(' ')
    .map((n) => n?.[0] || '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="hidden md:flex items-center gap-3">
      <div>
        <p className="text-sm font-medium text-gray-900 text-right">{displayName}</p>
        {email && <p className="text-xs text-gray-500 text-right">{email}</p>}
      </div>
      <div className="w-10 h-10 rounded-full bg-[#0d1b2a] text-white flex items-center justify-center font-medium">
        {initials}
      </div>
    </div>
  );
};

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-page relative font-sans">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out z-40 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <header className="flex items-center justify-between p-4 lg:p-6 bg-surface border-b relative">
          <div className="flex items-center gap-6 z-10">
            <Button variant="ghost" size="md" onClick={() => setSidebarOpen(true)} className="p-2">
              <Menu size={20} />
            </Button>
          </div>
          
          {/* Centered Title */}
          <div className="absolute left-0 right-0 mx-auto w-full flex flex-col items-center">
            <div className="flex items-center gap-2">
              <svg 
                viewBox="0 0 24 24" 
                className="w-6 h-6 text-primary"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <path d="M3.29 7L12 12l8.71-5M12 22V12" />
              </svg>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                CartonIQ
              </h1>
            </div>
            <p className="text-xs text-muted font-medium tracking-wide">MEASUREMENT & ANALYTICS</p>
          </div>
          
          <div className="flex items-center gap-6 z-10">
            {/* User Account Info (from auth context) */}
            <UserAccount />
          </div>
        </header>
        <div className="p-4 lg:p-8">
          <Card className="min-h-[60vh] p-6">{children}</Card>
        </div>
      </main>
    </div>
  );
};

export default Layout;