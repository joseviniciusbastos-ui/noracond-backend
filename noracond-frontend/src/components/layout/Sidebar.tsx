import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Gavel, 
  CircleDollarSign,
  MessageCircle,
  Building2
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Clientes',
      href: '/clients',
      icon: Users,
    },
    {
      name: 'Processos',
      href: '/processes',
      icon: Gavel,
    },
    {
      name: 'Financeiro',
      href: '/financials',
      icon: CircleDollarSign,
    },
    {
      name: 'Chat',
      href: '/chat',
      icon: MessageCircle,
    },
  ];

  return (
    <div className="flex flex-col w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <Building2 className="h-8 w-8 text-blue-400" />
          <span className="text-xl font-bold text-white">NoraCOND</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigationItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-700">
        <div className="text-xs text-slate-400 text-center">
          © 2024 NoraCOND
        </div>
      </div>
    </div>
  );
};

export default Sidebar;