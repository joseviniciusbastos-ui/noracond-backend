import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ClientsPage from './pages/ClientsPage';
import ProcessesPage from './pages/ProcessesPage';
import ProcessDetailPage from './pages/ProcessDetailPage';
import FinancialsPage from './pages/FinancialsPage';
import ChatPage from './pages/ChatPage';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import authService from './services/authService';
import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Rota raiz - redireciona baseado na autenticação */}
        <Route 
          path="/" 
          element={
            authService.isAuthenticated() ? 
              <Navigate to="/dashboard" replace /> : 
              <Navigate to="/login" replace />
          } 
        />
        
        {/* Rota de login */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Rotas protegidas com layout principal */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/processes" element={<ProcessesPage />} />
            <Route path="/processes/:processId" element={<ProcessDetailPage />} />
            <Route path="/financials" element={<FinancialsPage />} />
            <Route path="/chat" element={<ChatPage />} />
            {/* Futuras rotas protegidas virão aqui */}
          </Route>
        </Route>
        
        {/* Rota 404 - redireciona para login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;
