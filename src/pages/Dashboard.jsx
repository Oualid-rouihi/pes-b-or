import { useAppContext } from '../context/AppContext';
import { Users, Swords, Trophy, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = ({ isAdmin }) => {
  const basePath = isAdmin ? '/admin' : '';
  const { teams, matches } = useAppContext();

  const playedMatches = matches.filter(m => m.isPlayed).length;
  const pendingMatches = matches.filter(m => !m.isPlayed).length;

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Welcome to <span className="text-gradient-primary">Botola</span></h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your football tournaments locally.</p>
      </div>

      <div className="grid-auto" style={{ marginBottom: '3rem' }}>
        <div className="card glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: 'rgba(0, 255, 136, 0.1)', padding: '1rem', borderRadius: '12px' }}>
            <Users color="var(--primary)" size={32} />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>{teams.length}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Total Teams</div>
          </div>
        </div>

        <div className="card glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '12px' }}>
            <Swords color="var(--secondary)" size={32} />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>{pendingMatches}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Pending Matches</div>
          </div>
        </div>

        <div className="card glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '1rem', borderRadius: '12px' }}>
            <Trophy color="var(--accent)" size={32} />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>{playedMatches}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Matches Played</div>
          </div>
        </div>
      </div>

      <div className="grid-1-1">
        <div className="card glass-panel">
          <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Trophy size={20} /> Dawri Zalyjia
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            The classic league format. Teams battle it out for the top spot on the leaderboard.
          </p>
          <Link to={`${basePath}/zalyjia`} className="btn btn-outline" style={{ width: '100%' }}>Go to League</Link>
        </div>

        <div className="card glass-panel" style={{ border: '1px solid rgba(251, 191, 36, 0.2)' }}>
          <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fbbf24' }}>
            <Crown size={20} /> Champions League
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            The ultimate knockout tournament. 16 teams enter, only 1 survives.
          </p>
          <Link to={`${basePath}/champions`} className="btn" style={{ width: '100%', background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
            Go to Tournament
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
