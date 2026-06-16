import { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import Layout from './components/Layout';
import DashboardView from './components/DashboardView';
import MenuView from './components/MenuView';
import TablesView from './components/TablesView';
import OrdersView from './components/OrdersView';
import BillingView from './components/BillingView';
import ReportsView from './components/ReportsView';
import './index.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Restore session on reload
  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    if (token && username && role) {
      setUser({ token, username, role });
    }
  }, []);

  const handleLogin = (data) => {
    setUser(data);
    const isAdmin = data.role === 'ROLE_ADMIN';
    setCurrentPage(isAdmin ? 'dashboard' : 'orders');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setUser(null);
    setCurrentPage('dashboard');
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const isAdmin = user.role === 'ROLE_ADMIN';

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return isAdmin ? <DashboardView /> : <OrdersView />;
      case 'menu': return <MenuView isAdmin={isAdmin} />;
      case 'tables': return <TablesView isAdmin={isAdmin} />;
      case 'orders': return <OrdersView />;
      case 'billing': return <BillingView />;
      case 'reports': return isAdmin ? <ReportsView /> : <OrdersView />;
      default: return <DashboardView />;
    }
  };

  return (
    <Layout user={user} currentPage={currentPage} onNavigate={setCurrentPage} onLogout={handleLogout}>
      {renderPage()}
    </Layout>
  );
}
