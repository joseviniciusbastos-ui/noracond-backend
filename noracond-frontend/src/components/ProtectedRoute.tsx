import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import authService from '../services/authService';

const ProtectedRoute: React.FC = () => {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();
  const isTokenValid = authService.isTokenValid();

  // Se não estiver autenticado ou token inválido, redirecionar para login
  if (!isAuthenticated || !isTokenValid) {
    // Se o token for inválido, fazer logout para limpar dados
    if (!isTokenValid) {
      authService.logout();
    }
    
    // Salvar a localização atual para redirecionar após login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;