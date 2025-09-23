import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Bell } from 'lucide-react';
import authService from '../../services/authService';

const Header: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  // Por enquanto, vamos usar um nome mockado
  // Futuramente, isso virá do contexto de autenticação ou do token JWT
  const userName = authService.getUser()?.nome || 'Usuário';

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 h-16 fixed top-0 right-0 left-64 z-20">
      <div className="flex items-center justify-between h-full px-6">
        {/* Título da página atual */}
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-gray-800">
            Sistema NoraCOND
          </h1>
        </div>

        {/* Área do usuário */}
        <div className="flex items-center space-x-4">
          {/* Notificações */}
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200">
            <Bell className="h-5 w-5" />
          </button>

          {/* Informações do usuário */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">
                {userName}
              </span>
            </div>

            {/* Botão de logout */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;