import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '../context/AppContext';
import { Trophy, Plus, Edit2 } from 'lucide-react';

const DawriZalyjia = ({ isAdmin }) => {
  const { teams, matches, addMatch, updateMatchResult } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);
  
  // Match Form State
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);

  // Filter matches for this competition
  const zalyjiaMatches = matches.filter(m => m.competition === 'zalyjia');

  // Calculate Standings
  const calculateStandings = () => {
    let standings = teams.map(team => ({
      ...team,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      gf: 0, // Goals For
      ga: 0, // Goals Against
      gd: 0, // Goal Difference
      points: 0
    }));

    zalyjiaMatches.forEach(match => {
      if (!match.isPlayed) return;

      const home = standings.find(t => t.id === match.homeTeamId);
      const away = standings.find(t => t.id === match.awayTeamId);

      if (!home || !away) return;

      home.played += 1;
      away.played += 1;
      home.gf += match.homeScore;
      home.ga += match.awayScore;
      away.gf += match.awayScore;
      away.ga += match.homeScore;

      if (match.homeScore > match.awayScore) {
        home.won += 1;
        home.points += 3;
        away.lost += 1;
      } else if (match.homeScore < match.awayScore) {
        away.won += 1;
        away.points += 3;
        home.lost += 1;
      } else {
        home.drawn += 1;
        away.drawn += 1;
        home.points += 1;
        away.points += 1;
      }
    });

    // Calculate GD and Sort
    standings.forEach(t => t.gd = t.gf - t.ga);
    return standings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.gd - a.gd;
    });
  };

  const standings = calculateStandings();

  const handleOpenAddModal = () => {
    setEditingMatch(null);
    setHomeTeam('');
    setAwayTeam('');
    setHomeScore(0);
    setAwayScore(0);
    setShowModal(true);
  };

  const handleOpenEditModal = (match) => {
    setEditingMatch(match.id);
    setHomeTeam(match.homeTeamId);
    setAwayTeam(match.awayTeamId);
    setHomeScore(match.homeScore);
    setAwayScore(match.awayScore);
    setShowModal(true);
  };

  const handleSaveMatch = (e) => {
    e.preventDefault();
    if (!homeTeam || !awayTeam || homeTeam === awayTeam) {
      alert("Please select two different teams.");
      return;
    }
    
    if (editingMatch) {
      updateMatchResult(editingMatch, homeScore, awayScore);
    } else {
      addMatch({
        competition: 'zalyjia',
        homeTeamId: homeTeam,
        awayTeamId: awayTeam,
        homeScore: parseInt(homeScore),
        awayScore: parseInt(awayScore),
        isPlayed: true
      });
    }
    
    setShowModal(false);
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Trophy color="var(--primary)" /> Dawri Zalyjia
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>The ultimate league leaderboard.</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={handleOpenAddModal}>
            <Plus size={18} /> Record Match
          </button>
        )}
      </div>

      <div className="grid-2-1">
        {/* League Table */}
        <div className="card glass-panel" style={{ height: 'fit-content' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Standings</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Pos</th>
                  <th>Team</th>
                  <th>P</th>
                  <th>W</th>
                  <th>D</th>
                  <th>L</th>
                  <th>GD</th>
                  <th>Pts</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((team, index) => (
                  <tr key={team.id}>
                    <td style={{ fontWeight: 600, color: index === 0 ? 'var(--primary)' : 'inherit' }}>{index + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img src={team.logo} alt={team.name} style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                        <span style={{ fontWeight: 500 }}>{team.name}</span>
                      </div>
                    </td>
                    <td>{team.played}</td>
                    <td>{team.won}</td>
                    <td>{team.drawn}</td>
                    <td>{team.lost}</td>
                    <td>{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{team.points}</td>
                  </tr>
                ))}
                {standings.length === 0 && (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No teams available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Matches */}
        <div className="card glass-panel" style={{ height: 'fit-content' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Recent Results</h2>
          {zalyjiaMatches.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No matches recorded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[...zalyjiaMatches].reverse().map(match => {
                const home = teams.find(t => t.id === match.homeTeamId);
                const away = teams.find(t => t.id === match.awayTeamId);
                if (!home || !away) return null;
                return (
                  <div key={match.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, justifyContent: 'flex-end' }}>
                      <span>{home.name}</span>
                      <img src={home.logo} style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
                    </div>
                    <div style={{ padding: '0.25rem 0.75rem', background: 'var(--bg-dark)', borderRadius: '6px', fontWeight: 700, margin: '0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>{match.homeScore}</span>
                      <span>-</span>
                      <span>{match.awayScore}</span>
                      {isAdmin && (
                        <button 
                          onClick={() => handleOpenEditModal(match)}
                          style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', marginLeft: '0.5rem' }}
                        >
                          <Edit2 size={14} />
                        </button>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                      <img src={away.logo} style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
                      <span>{away.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Match Recording Modal */}
      {showModal && createPortal(
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in">
            <h2 style={{ marginBottom: '1.5rem' }}>{editingMatch ? 'Edit Match Result' : 'Record Match Result'}</h2>
            <form onSubmit={handleSaveMatch}>
              <div className="grid-1-1" style={{ marginBottom: '1.5rem' }}>
                <div className="input-group">
                  <label>Home Team</label>
                  <select className="input-field" value={homeTeam} onChange={e => setHomeTeam(e.target.value)} required disabled={!!editingMatch}>
                    <option value="">Select Home Team</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.id} disabled={team.id === awayTeam}>{team.name}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label>Away Team</label>
                  <select className="input-field" value={awayTeam} onChange={e => setAwayTeam(e.target.value)} required disabled={!!editingMatch}>
                    <option value="">Select Away Team</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.id} disabled={team.id === homeTeam}>{team.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid-1-1" style={{ marginBottom: '2rem' }}>
                <div className="input-group">
                  <label>Home Score</label>
                  <input type="number" className="input-field" min="0" value={homeScore} onChange={e => setHomeScore(e.target.value)} required />
                </div>
                <div className="input-group">
                  <label>Away Score</label>
                  <input type="number" className="input-field" min="0" value={awayScore} onChange={e => setAwayScore(e.target.value)} required />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn">Save Result</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default DawriZalyjia;
