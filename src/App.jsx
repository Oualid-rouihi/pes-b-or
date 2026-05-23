import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import TeamsManager from './pages/TeamsManager';
import DawriZalyjia from './pages/DawriZalyjia';
import ChampionsLeague from './pages/ChampionsLeague';
import PublicHome from './pages/PublicHome';
import Login from './pages/Login';
import { supabase } from './supabaseClient';

const Layout = ({ isAdmin }) => {
  return (
    <div className="app-container">
      <Sidebar isAdmin={isAdmin} />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

const PublicLayout = () => {
  return (
    <div className="app-container" style={{ display: 'block' }}>
      <main className="main-content" style={{ padding: 0, height: '100vh', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
};

// ProtectedRoute component checks if the user is authenticated
const ProtectedRoute = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes (View Only) */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<PublicHome />} />
          <Route path="login" element={<Login />} />
        </Route>

        {/* Admin Routes (Full Access - Protected) */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <Layout isAdmin={true} />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard isAdmin={true} />} />
          <Route path="teams" element={<TeamsManager isAdmin={true} />} />
          <Route path="zalyjia" element={<DawriZalyjia isAdmin={true} />} />
          <Route path="champions" element={<ChampionsLeague isAdmin={true} />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
