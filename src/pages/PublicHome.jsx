import { useState } from 'react';
import { Link } from 'react-router-dom';
import DawriZalyjia from './DawriZalyjia';
import ChampionsLeague from './ChampionsLeague';
import { Trophy, Crown, LogIn, ChevronRight } from 'lucide-react';

const PublicHome = () => {
  const [activeTab, setActiveTab] = useState('dawri');

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#000000', 
      color: '#f5f5f7',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      {/* Navbar / Top Bar */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '44px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 2rem',
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        zIndex: 50,
        fontSize: '12px',
        fontWeight: 400,
        letterSpacing: '-0.01em'
      }}>
        <div style={{ fontWeight: 600, fontSize: '14px', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
          BOTOLA PRO
        </div>
        <div>
          <Link to="/login" style={{ 
            color: '#f5f5f7', 
            textDecoration: 'none', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            opacity: 0.8,
            transition: 'opacity 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
          >
            <LogIn size={14} />
            Admin Login
          </Link>
        </div>
      </nav>

      {/* Hero Section - Apple Style */}
      <section style={{
        position: 'relative',
        height: '100vh',
        minHeight: '600px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: '15vh',
        textAlign: 'center',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 10 }} className="animate-fade-in">
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: 600, 
            letterSpacing: '0.01em', 
            color: '#f5f5f7',
            marginBottom: '4px'
          }}>
            The new season.
          </h2>
          <h1 style={{ 
            fontSize: 'clamp(48px, 8vw, 80px)', 
            fontWeight: 600, 
            letterSpacing: '-0.04em',
            lineHeight: 1.05,
            color: '#f5f5f7',
            margin: '0 0 16px 0'
          }}>
            Botola Pro.
          </h1>
          <p style={{ 
            fontSize: 'clamp(21px, 4vw, 28px)', 
            fontWeight: 400, 
            color: '#86868b',
            maxWidth: '600px',
            margin: '0 auto 24px auto',
            letterSpacing: '0.005em'
          }}>
            Pro in every way. Track standings, results, and the road to glory.
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => {
                setActiveTab('dawri');
                document.getElementById('content-area').scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#22c55e',
                fontSize: '21px',
                fontWeight: 400,
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                padding: 0
              }}
              className="apple-link-hover"
            >
              View Dawri Zalyjia <ChevronRight size={20} style={{ marginTop: '2px' }} />
            </button>
            <button 
              onClick={() => {
                setActiveTab('champions');
                document.getElementById('content-area').scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#22c55e',
                fontSize: '21px',
                fontWeight: 400,
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                padding: 0
              }}
              className="apple-link-hover"
            >
              View Champions League <ChevronRight size={20} style={{ marginTop: '2px' }} />
            </button>
          </div>
        </div>

        {/* Product Image representation (A sleek trophy or stadium) */}
        <div style={{
          position: 'absolute',
          bottom: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '120%',
          maxWidth: '1400px',
          height: '60%',
          backgroundImage: 'url("https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=2000&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'top center',
          maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
          opacity: 0.6,
          zIndex: 1
        }}></div>
      </section>

      {/* Main Content Area */}
      <section id="content-area" className="content-section" style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        position: 'relative', 
        zIndex: 4,
        background: '#000000'
      }}>
        
        {/* Toggle Buttons (Apple segmented control style) */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.08)',
            padding: '4px',
            borderRadius: '100px',
            gap: '4px'
          }}>
            <button 
              onClick={() => setActiveTab('dawri')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 24px',
                borderRadius: '100px',
                border: 'none',
                background: activeTab === 'dawri' ? '#ffffff' : 'transparent',
                color: activeTab === 'dawri' ? '#000000' : '#f5f5f7',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)',
                boxShadow: activeTab === 'dawri' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none'
              }}
            >
              <Trophy size={16} /> Dawri Zalyjia
            </button>
            <button 
              onClick={() => setActiveTab('champions')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 24px',
                borderRadius: '100px',
                border: 'none',
                background: activeTab === 'champions' ? '#ffffff' : 'transparent',
                color: activeTab === 'champions' ? '#000000' : '#f5f5f7',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)',
                boxShadow: activeTab === 'champions' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none'
              }}
            >
              <Crown size={16} /> Champions League
            </button>
          </div>
        </div>

        {/* Results Container */}
        <div className="animate-fade-in results-container" style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          {activeTab === 'dawri' ? (
            <DawriZalyjia isAdmin={false} />
          ) : (
            <ChampionsLeague isAdmin={false} />
          )}
        </div>

      </section>

      {/* Apple style footer */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.1)',
        padding: '2rem',
        textAlign: 'center',
        color: '#86868b',
        fontSize: '12px',
        marginTop: '4rem'
      }}>
        <p>Copyright © {new Date().getFullYear()} Botola Pro Inc. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default PublicHome;
