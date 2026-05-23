import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Users, Trophy, Crown, LogOut } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Sidebar = ({ isAdmin }) => {
  const basePath = isAdmin ? '/admin' : '';
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      left: 0,
      right: 0,
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'saturate(180%) blur(20px)',
      WebkitBackdropFilter: 'saturate(180%) blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      zIndex: 50,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Trophy color="#22c55e" size={20} />
        <span style={{ fontWeight: 600, fontSize: '16px', letterSpacing: '-0.02em', color: '#f5f5f7' }}>
          BOTOLA PRO
        </span>
        {isAdmin && (
          <span style={{
            background: '#22c55e',
            color: '#000',
            fontSize: '10px',
            padding: '2px 6px',
            borderRadius: '4px',
            fontWeight: 700,
            marginLeft: '8px'
          }}>
            ADMIN
          </span>
        )}
      </div>
      
      <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <NavLink 
          to={isAdmin ? "/admin" : "/"} 
          end 
          style={({isActive}) => ({
            color: isActive ? '#f5f5f7' : '#86868b',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: isActive ? 600 : 400,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'color 0.2s ease'
          })}
        >
          <Home size={16} /> Dashboard
        </NavLink>
        
        <NavLink 
          to={`${basePath}/teams`} 
          style={({isActive}) => ({
            color: isActive ? '#f5f5f7' : '#86868b',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: isActive ? 600 : 400,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'color 0.2s ease'
          })}
        >
          <Users size={16} /> Teams
        </NavLink>
        
        <NavLink 
          to={`${basePath}/zalyjia`} 
          style={({isActive}) => ({
            color: isActive ? '#f5f5f7' : '#86868b',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: isActive ? 600 : 400,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'color 0.2s ease'
          })}
        >
          <Trophy size={16} /> Dawri
        </NavLink>
        
        <NavLink 
          to={`${basePath}/champions`} 
          style={({isActive}) => ({
            color: isActive ? '#f5f5f7' : '#86868b',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: isActive ? 600 : 400,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'color 0.2s ease'
          })}
        >
          <Crown size={16} /> CL
        </NavLink>
      </nav>

      <div>
        {isAdmin && (
          <button 
            onClick={handleLogout}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#f5f5f7',
              padding: '6px 12px',
              borderRadius: '100px',
              fontSize: '12px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <LogOut size={14} /> Logout
          </button>
        )}
      </div>
    </header>
  );
};

export default Sidebar;
