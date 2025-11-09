import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Image, File, Clock, LogOut, BarChart2 } from 'lucide-react';
import Card from './ui/Card';
import Button from './ui/Button';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const handleSignOut = () => {
    logout();
  };

  const menuItems = [
    {
      path: '/dashboard',
      name: 'Dashboard',
      icon: <LayoutDashboard size={18} />
    },
    {
      path: '/progress',
      name: 'Progress',
      icon: <BarChart2 size={18} />
    },
    {
      path: '/gallery',
      name: 'Gallery',
      icon: <Image size={18} />
    },
    {
      path: '/dielines',
      name: 'Dielines',
      icon: <File size={18} />
    },
    {
      path: '/history',
      name: 'History',
      icon: <Clock size={18} />
    }
  ];

  return (
    <div className="flex flex-col h-full">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-body">CARTONIQ</h2>
            <div className="text-xs text-muted">Progress Tracker</div>
          </div>
        </div>
      </Card>

      <nav className="px-4 flex-1 mt-4 space-y-1">
        {menuItems.map((item) => {
          const active = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md ${active ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-gray-50'}`}>
              {item.icon}
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
          <LogOut size={16} />
          <span className="text-red-600">Sign Out</span>
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;