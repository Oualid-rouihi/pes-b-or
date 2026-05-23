import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '../context/AppContext';
import { Crown, Play, Trophy } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const STAGES = ['Round of 16', 'Quarter-finals', 'Semi-finals', 'Final'];

const VisualBracket = ({ teams, matches, isAdmin, openModal }) => {
  if (!matches || matches.length === 0) return null;

  const [activeSide, setActiveSide] = useState('A');

  const getMatchData = (stage, matchNum) => {
    const stageMatches = matches.filter(m => m.stage === stage && m.matchNumber === matchNum);
    if (stageMatches.length === 0) return { teamA: null, teamB: null, aggA: null, aggB: null, winnerId: null };
    
    const leg1 = stageMatches.find(m => m.leg === 1) || stageMatches[0];
    const leg2 = stageMatches.find(m => m.leg === 2);
    const isFinal = stage === 'Final';
    
    let winnerId = null;
    let aggA = null;
    let aggB = null;
    
    if (leg1 && leg1.isPlayed && (isFinal || (leg2 && leg2.isPlayed))) {
      aggA = leg1.homeScore + (leg1.homePenalties || 0) + (leg2 ? leg2.awayScore + (leg2.awayPenalties || 0) : 0);
      aggB = leg1.awayScore + (leg1.awayPenalties || 0) + (leg2 ? leg2.homeScore + (leg2.homePenalties || 0) : 0);
      winnerId = aggA > aggB ? leg1.homeTeamId : leg1.awayTeamId;
    }
    
    return {
      teamA: leg1?.homeTeamId === 'BYE' ? { id: 'BYE', name: '(BYE)', logo: null } : teams.find(t => t.id === (leg1 ? leg1.homeTeamId : null)),
      teamB: leg1?.awayTeamId === 'BYE' ? { id: 'BYE', name: '(BYE)', logo: null } : teams.find(t => t.id === (leg1 ? leg1.awayTeamId : null)),
      aggA, aggB, winnerId
    };
  };

  const getActiveLeg = (stage, matchNum) => {
    const stageMatches = matches.filter(m => m.stage === stage && m.matchNumber === matchNum);
    if (stageMatches.length === 0) return null;
    const leg1 = stageMatches.find(m => m.leg === 1) || stageMatches[0];
    const leg2 = stageMatches.find(m => m.leg === 2);
    
    if (!leg1.isPlayed) return leg1;
    if (leg2 && !leg2.isPlayed) return leg2;
    return leg2 || leg1;
  };

  const handleCardClick = (stage, matchNum) => {
    const activeLeg = getActiveLeg(stage, matchNum);
    if (activeLeg && activeLeg.homeTeamId !== 'BYE' && activeLeg.awayTeamId !== 'BYE') {
      openModal(activeLeg);
    }
  };

  const BracketCard = ({ stage, matchNum, onClick }) => {
    const { teamA, teamB, aggA, aggB, winnerId } = getMatchData(stage, matchNum);
    const match = matches.find(m => m.stage === stage && m.matchNumber === matchNum);
    
    const isByeA = teamA?.id === 'BYE';
    const isByeB = teamB?.id === 'BYE';
    
    const cursorStyle = (isAdmin && !isByeA && !isByeB) ? 'pointer' : 'default';
    
    return (
      <div className="new-bracket-card" style={{ cursor: cursorStyle }} onClick={onClick}>
        <div className="new-bracket-card-teams">
          {/* Team A */}
          <div className={`new-bracket-team ${winnerId === teamA?.id ? 'is-winner' : ''}`}>
            <span className="new-bracket-score">{isByeA ? '-' : (aggA !== null ? aggA : '-')}</span>
            {teamA && !isByeA ? (
              <img src={teamA.logo} alt="" className="new-bracket-logo" />
            ) : (
              <div className="new-bracket-logo-placeholder">{isByeA ? 'BYE' : '?'}</div>
            )}
            <span className="new-bracket-name">{teamA && !isByeA ? teamA.name : (isByeA ? 'BYE' : 'TBD')}</span>
          </div>

          {/* Divider */}
          <div className="new-bracket-divider">vs</div>

          {/* Team B */}
          <div className={`new-bracket-team ${winnerId === teamB?.id ? 'is-winner' : ''}`}>
            <span className="new-bracket-score">{isByeB ? '-' : (aggB !== null ? aggB : '-')}</span>
            {teamB && !isByeB ? (
              <img src={teamB.logo} alt="" className="new-bracket-logo" />
            ) : (
              <div className="new-bracket-logo-placeholder">{isByeB ? 'BYE' : '?'}</div>
            )}
            <span className="new-bracket-name">{teamB && !isByeB ? teamB.name : (isByeB ? 'BYE' : 'TBD')}</span>
          </div>
        </div>
        
        {/* Details/Action Link */}
        <div className="new-bracket-details">
          {match?.isPlayed ? 'Details' : (isAdmin ? 'Record ✏️' : 'Upcoming')}
        </div>
      </div>
    );
  };

  const FinalBracketCard = ({ onClick }) => {
    const { teamA, teamB, aggA, aggB, winnerId } = getMatchData('Final', 0);
    const match = matches.find(m => m.stage === 'Final' && m.matchNumber === 0);
    
    return (
      <div className="new-bracket-card final-card" onClick={onClick}>
        <div className="final-card-header">Championship Final</div>
        <div className="final-card-body">
          {/* Team A */}
          <div className={`new-bracket-team ${winnerId === teamA?.id ? 'is-winner' : ''}`}>
            {teamA ? (
              <img src={teamA.logo} alt="" className="new-bracket-logo large" />
            ) : (
              <div className="new-bracket-logo-placeholder large">?</div>
            )}
            <span className="new-bracket-name">{teamA ? teamA.name : 'TBD'}</span>
          </div>

          {/* Center info */}
          <div className="final-card-center">
            {match?.isPlayed ? (
              <div className="final-scores">
                <span>{aggA}</span>
                <span>-</span>
                <span>{aggB}</span>
              </div>
            ) : (
              <div className="final-vs">VS</div>
            )}
          </div>

          {/* Team B */}
          <div className={`new-bracket-team ${winnerId === teamB?.id ? 'is-winner' : ''}`}>
            {teamB ? (
              <img src={teamB.logo} alt="" className="new-bracket-logo large" />
            ) : (
              <div className="new-bracket-logo-placeholder large">?</div>
            )}
            <span className="new-bracket-name">{teamB ? teamB.name : 'TBD'}</span>
          </div>
        </div>
        <div className="new-bracket-details">
          {match?.isPlayed ? 'Champion Crowned!' : (isAdmin ? 'Record ✏️' : 'Upcoming')}
        </div>
      </div>
    );
  };

  const hasR16 = matches.some(m => m.stage === 'Round of 16');
  const hasQuarters = matches.some(m => m.stage === 'Quarter-finals') || hasR16;
  const hasSemis = matches.some(m => m.stage === 'Semi-finals') || hasQuarters;

  return (
    <div style={{ 
      marginBottom: '3rem',
      background: 'rgba(0,0,0,0.2)',
      borderRadius: '20px',
      border: '1px solid rgba(255,255,255,0.1)',
      padding: '1.5rem 1rem'
    }}>
      {/* Desktop Visual Bracket */}
      <div className="bracket-desktop">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'stretch', 
          gap: '1.5rem', 
          overflowX: 'auto', 
        }}>
          <div style={{ display: 'flex', minWidth: hasR16 ? '950px' : hasQuarters ? '700px' : '450px', justifyContent: 'space-between', gap: '1rem', width: '100%' }}>
            {/* Left R16 */}
            {hasR16 && (
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', gap: '1rem' }}>
                {[0, 1, 2, 3].map(i => (
                  <BracketCard 
                    key={`R16L${i}`} 
                    stage="Round of 16" 
                    matchNum={i} 
                    onClick={() => handleCardClick("Round of 16", i)} 
                  />
                ))}
              </div>
            )}
            {/* Left QF */}
            {hasQuarters && (
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', gap: '1rem', padding: '2rem 0' }}>
                {[0, 1].map(i => (
                  <BracketCard 
                    key={`QFL${i}`} 
                    stage="Quarter-finals" 
                    matchNum={i} 
                    onClick={() => handleCardClick("Quarter-finals", i)} 
                  />
                ))}
              </div>
            )}
            {/* Left SF */}
            {hasSemis && (
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', gap: '1rem', padding: '4rem 0' }}>
                <BracketCard stage="Semi-finals" matchNum={0} onClick={() => handleCardClick("Semi-finals", 0)} />
              </div>
            )}
            
            {/* Center Final & Trophy */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '2rem', minWidth: '220px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Trophy size={64} color="#fbbf24" style={{ filter: 'drop-shadow(0 0 10px rgba(251, 191, 36, 0.5))' }} />
                <div style={{ color: '#fbbf24', fontWeight: 800, marginTop: '0.5rem', letterSpacing: '2px', textTransform: 'uppercase' }}>FINAL</div>
              </div>
              <FinalBracketCard onClick={() => handleCardClick("Final", 0)} />
            </div>

            {/* Right SF */}
            {hasSemis && (
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', gap: '1rem', padding: '4rem 0' }}>
                <BracketCard stage="Semi-finals" matchNum={1} onClick={() => handleCardClick("Semi-finals", 1)} />
              </div>
            )}
            {/* Right QF */}
            {hasQuarters && (
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', gap: '1rem', padding: '2rem 0' }}>
                {[2, 3].map(i => (
                  <BracketCard 
                    key={`QFR${i}`} 
                    stage="Quarter-finals" 
                    matchNum={i} 
                    onClick={() => handleCardClick("Quarter-finals", i)} 
                  />
                ))}
              </div>
            )}
            {/* Right R16 */}
            {hasR16 && (
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', gap: '1rem' }}>
                {[4, 5, 6, 7].map(i => (
                  <BracketCard 
                    key={`R16R${i}`} 
                    stage="Round of 16" 
                    matchNum={i} 
                    onClick={() => handleCardClick("Round of 16", i)} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Visual Bracket */}
      <div className="bracket-mobile">
        {hasQuarters && (
          <div className="bracket-side-tabs">
            <button 
              className={`bracket-side-tab ${activeSide === 'A' ? 'active' : ''}`}
              onClick={() => setActiveSide('A')}
            >
              Side A
            </button>
            <button 
              className={`bracket-side-tab ${activeSide === 'B' ? 'active' : ''}`}
              onClick={() => setActiveSide('B')}
            >
              Side B
            </button>
          </div>
        )}

        <div className="bracket-mobile-content">
          {/* 1. Round of 16 */}
          {hasR16 && (
            <>
              <div className="mobile-stage-title">Round of 16</div>
              <div className="bracket-row">
                {activeSide === 'A' ? (
                  <>
                    <BracketCard stage="Round of 16" matchNum={0} onClick={() => handleCardClick("Round of 16", 0)} />
                    <BracketCard stage="Round of 16" matchNum={1} onClick={() => handleCardClick("Round of 16", 1)} />
                    <BracketCard stage="Round of 16" matchNum={2} onClick={() => handleCardClick("Round of 16", 2)} />
                    <BracketCard stage="Round of 16" matchNum={3} onClick={() => handleCardClick("Round of 16", 3)} />
                  </>
                ) : (
                  <>
                    <BracketCard stage="Round of 16" matchNum={4} onClick={() => handleCardClick("Round of 16", 4)} />
                    <BracketCard stage="Round of 16" matchNum={5} onClick={() => handleCardClick("Round of 16", 5)} />
                    <BracketCard stage="Round of 16" matchNum={6} onClick={() => handleCardClick("Round of 16", 6)} />
                    <BracketCard stage="Round of 16" matchNum={7} onClick={() => handleCardClick("Round of 16", 7)} />
                  </>
                )}
              </div>

              {/* R16 to QF Connections */}
              <div style={{ display: 'flex', width: '100%', height: '30px' }}>
                <div style={{ width: '50%', height: '100%' }}>
                  <svg width="100%" height="100%" viewBox="0 0 100 30" preserveAspectRatio="none">
                    <path d="M 25,0 L 25,15 L 75,15 L 75,0 M 50,15 L 50,30" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none" />
                  </svg>
                </div>
                <div style={{ width: '50%', height: '100%' }}>
                  <svg width="100%" height="100%" viewBox="0 0 100 30" preserveAspectRatio="none">
                    <path d="M 25,0 L 25,15 L 75,15 L 75,0 M 50,15 L 50,30" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none" />
                  </svg>
                </div>
              </div>
            </>
          )}

          {/* 2. Quarter-finals */}
          {hasQuarters && (
            <>
              <div className="mobile-stage-title">Quarter Final</div>
              <div className="bracket-row">
                {activeSide === 'A' ? (
                  <>
                    <BracketCard stage="Quarter-finals" matchNum={0} onClick={() => handleCardClick("Quarter-finals", 0)} />
                    <BracketCard stage="Quarter-finals" matchNum={1} onClick={() => handleCardClick("Quarter-finals", 1)} />
                  </>
                ) : (
                  <>
                    <BracketCard stage="Quarter-finals" matchNum={2} onClick={() => handleCardClick("Quarter-finals", 2)} />
                    <BracketCard stage="Quarter-finals" matchNum={3} onClick={() => handleCardClick("Quarter-finals", 3)} />
                  </>
                )}
              </div>

              {/* QF to SF Connections */}
              <div style={{ display: 'flex', width: '100%', height: '30px' }}>
                <svg width="100%" height="100%" viewBox="0 0 100 30" preserveAspectRatio="none">
                  <path d="M 25,0 L 25,15 L 75,15 L 75,0 M 50,15 L 50,30" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none" />
                </svg>
              </div>
            </>
          )}

          {/* 3. Semi-finals */}
          {hasSemis && (
            <>
              <div className="mobile-stage-title yellow">Semi Final</div>
              <div className="bracket-row">
                {!hasQuarters ? (
                  <>
                    <BracketCard stage="Semi-finals" matchNum={0} onClick={() => handleCardClick("Semi-finals", 0)} />
                    <BracketCard stage="Semi-finals" matchNum={1} onClick={() => handleCardClick("Semi-finals", 1)} />
                  </>
                ) : activeSide === 'A' ? (
                  <BracketCard stage="Semi-finals" matchNum={0} onClick={() => handleCardClick("Semi-finals", 0)} />
                ) : (
                  <BracketCard stage="Semi-finals" matchNum={1} onClick={() => handleCardClick("Semi-finals", 1)} />
                )}
              </div>

              {/* SF to Final Connection */}
              <div style={{ display: 'flex', width: '100%', height: '30px' }}>
                {!hasQuarters ? (
                  <svg width="100%" height="100%" viewBox="0 0 100 30" preserveAspectRatio="none">
                    <path d="M 25,0 L 25,15 L 75,15 L 75,0 M 50,15 L 50,30" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none" />
                  </svg>
                ) : (
                  <svg width="100%" height="100%" viewBox="0 0 100 30" preserveAspectRatio="none">
                    <path d="M 50,0 L 50,30" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none" />
                  </svg>
                )}
              </div>
            </>
          )}

          {/* 4. Final */}
          <div className="mobile-stage-title green">Final</div>
          <div className="bracket-row">
            <FinalBracketCard onClick={() => handleCardClick("Final", 0)} />
          </div>
        </div>
      </div>
    </div>
  );
};

const ChampionsLeague = ({ isAdmin }) => {
  const { teams, matches, generateChampionsLeague, updateMatchResult, addMatch, resetChampionsLeague } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [teamCount, setTeamCount] = useState(16);
  const [setupMode, setSetupMode] = useState('settings'); // 'settings', 'manual'
  const [manualPairings, setManualPairings] = useState([]);

  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [homePenalties, setHomePenalties] = useState(0);
  const [awayPenalties, setAwayPenalties] = useState(0);
  const [showPenalties, setShowPenalties] = useState(false);

  const handleSetupManual = () => {
    let P = 16;
    if (teamCount <= 4) P = 4;
    else if (teamCount <= 8) P = 8;
    else if (teamCount <= 16) P = 16;
    
    const numMatches = P / 2;
    const initialPairings = Array(numMatches).fill().map(() => ({ home: '', away: '' }));
    setManualPairings(initialPairings);
    setSetupMode('manual');
  };

  const updateManualPairing = (index, field, value) => {
    const newPairings = [...manualPairings];
    newPairings[index][field] = value;
    setManualPairings(newPairings);
  };

  const handleStartManual = () => {
    let P = 16;
    if (teamCount <= 4) P = 4;
    else if (teamCount <= 8) P = 8;
    else if (teamCount <= 16) P = 16;

    const numByes = P - teamCount;
    
    let selectedTeams = new Set();
    let byesCount = 0;
    
    for (let p of manualPairings) {
      if (!p.home || !p.away) {
        alert("Please complete all matchups or select BYE.");
        return;
      }
      if (p.home === p.away && p.home !== 'BYE') {
        alert("A team cannot play against itself.");
        return;
      }
      if (p.home === 'BYE') byesCount++;
      else selectedTeams.add(p.home);
      
      if (p.away === 'BYE') byesCount++;
      else selectedTeams.add(p.away);
    }
    
    if (byesCount !== numByes) {
      alert(`You must have exactly ${numByes} BYE(s). You have ${byesCount}.`);
      return;
    }
    
    if (selectedTeams.size !== parseInt(teamCount)) {
      alert(`You must select exactly ${teamCount} distinct teams.`);
      return;
    }

    if (window.confirm("Start tournament with these matchups?")) {
      generateChampionsLeague(teamCount, manualPairings);
      setSetupMode('settings');
    }
  };

  const clMatches = matches.filter(m => m.competition === 'champions');
  const hasStarted = clMatches.length > 0;

  const handleRecordMatch = (e) => {
    e.preventDefault();

    const stageMatches = clMatches.filter(m => m.stage === selectedMatch.stage);

    // Validation for tie breaking
    if (selectedMatch.leg === 2) {
      const leg1 = stageMatches.find(m => m.matchNumber === selectedMatch.matchNumber && m.leg === 1);
      const teamB_agg = (leg1 ? leg1.awayScore : 0) + parseInt(homeScore); // selectedMatch.homeTeam
      const teamA_agg = (leg1 ? leg1.homeScore : 0) + parseInt(awayScore); // selectedMatch.awayTeam

      if (teamA_agg === teamB_agg && parseInt(homePenalties) === parseInt(awayPenalties)) {
        alert("Aggregate score is tied! Please enter penalty shootout results.");
        setShowPenalties(true);
        return;
      }
    } else if (selectedMatch.stage === 'Final') {
      if (parseInt(homeScore) === parseInt(awayScore) && parseInt(homePenalties) === parseInt(awayPenalties)) {
        alert("Final cannot end in a draw. Please enter penalty shootout results.");
        setShowPenalties(true);
        return;
      }
    }

    updateMatchResult(selectedMatch.id, homeScore, awayScore, homePenalties, awayPenalties);

    // Simulate update to check if stage complete
    const updatedStageMatches = stageMatches.map(m =>
      m.id === selectedMatch.id ? {
        ...m,
        isPlayed: true,
        homeScore: parseInt(homeScore),
        awayScore: parseInt(awayScore),
        homePenalties: parseInt(homePenalties),
        awayPenalties: parseInt(awayPenalties)
      } : m
    );

    const isStageComplete = updatedStageMatches.every(m => m.isPlayed);

    if (isStageComplete && selectedMatch.stage !== 'Final') {
      const currentStageIndex = STAGES.indexOf(selectedMatch.stage);
      const nextStage = STAGES[currentStageIndex + 1];

      if (!matches.some(m => m.competition === 'champions' && m.stage === nextStage)) {
        const matchups = [];
        updatedStageMatches.forEach(m => {
          if (!matchups[m.matchNumber]) matchups[m.matchNumber] = [];
          matchups[m.matchNumber].push(m);
        });

        // Sort matchups by matchNumber to preserve order
        const sortedMatchups = matchups.filter(Boolean); // just to re-index properly

        const winners = sortedMatchups.map(matchup => {
          if (matchup.length === 2) {
            const leg1 = matchup.find(m => m.leg === 1);
            const leg2 = matchup.find(m => m.leg === 2);
            const teamA_score = leg1.homeScore + leg2.awayScore + leg2.awayPenalties;
            const teamB_score = leg1.awayScore + leg2.homeScore + leg2.homePenalties;
            return teamA_score > teamB_score ? leg1.homeTeamId : leg1.awayTeamId;
          } else {
            const m = matchup[0];
            const homeTotal = m.homeScore + (m.homePenalties || 0);
            const awayTotal = m.awayScore + (m.awayPenalties || 0);
            return homeTotal > awayTotal ? m.homeTeamId : m.awayTeamId;
          }
        });

        for (let i = 0; i < winners.length; i += 2) {
          const teamA = winners[i];
          const teamB = winners[i + 1];
          const matchNum = i / 2;

          if (nextStage === 'Final') {
            addMatch({
              competition: 'champions',
              stage: nextStage,
              matchNumber: matchNum,
              homeTeamId: teamA,
              awayTeamId: teamB,
              leg: 1
            });
          } else {
            addMatch({
              competition: 'champions',
              stage: nextStage,
              matchNumber: matchNum,
              leg: 1,
              homeTeamId: teamA,
              awayTeamId: teamB
            });
            addMatch({
              competition: 'champions',
              stage: nextStage,
              matchNumber: matchNum,
              leg: 2,
              homeTeamId: teamB,
              awayTeamId: teamA
            });
          }
        }
      }
    }

    setShowModal(false);
    setHomeScore(0);
    setAwayScore(0);
    setHomePenalties(0);
    setAwayPenalties(0);
    setShowPenalties(false);
    setSelectedMatch(null);
  };

  const openModal = (match) => {
    if (!isAdmin) return;
    setSelectedMatch(match);
    if (match.isPlayed) {
      setHomeScore(match.homeScore || 0);
      setAwayScore(match.awayScore || 0);
      setHomePenalties(match.homePenalties || 0);
      setAwayPenalties(match.awayPenalties || 0);
      if (match.homePenalties > 0 || match.awayPenalties > 0) setShowPenalties(true);
    } else {
      setHomeScore(0);
      setAwayScore(0);
      setHomePenalties(0);
      setAwayPenalties(0);
      setShowPenalties(false);
    }
    setShowModal(true);
  };

  const renderStage = (stageName) => {
    const stageMatches = clMatches.filter(m => m.stage === stageName);
    if (stageMatches.length === 0) return null;

    // Filter out BYE matches so Admin doesn't see them as playable
    const realMatches = stageMatches.filter(m => m.homeTeamId !== 'BYE' && m.awayTeamId !== 'BYE');

    const matchups = [];
    realMatches.forEach(m => {
      if (!matchups[m.matchNumber]) matchups[m.matchNumber] = [];
      matchups[m.matchNumber].push(m);
    });

    return (
      <div key={stageName} style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#fbbf24', borderBottom: '1px solid rgba(251, 191, 36, 0.2)', paddingBottom: '0.5rem' }}>{stageName}</h2>
        {matchups.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>All matches in this stage are Byes and automatically advanced.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
            {matchups.map((matchup, idx) => {
              if (!matchup || matchup.length === 0) return null;

              matchup.sort((a, b) => a.leg - b.leg);

              const isFinal = stageName === 'Final';
              const leg1 = matchup[0];
              const leg2 = matchup.length > 1 ? matchup[1] : null;

              const teamA = teams.find(t => t.id === leg1.homeTeamId);
              const teamB = teams.find(t => t.id === leg1.awayTeamId);
              if (!teamA || !teamB) return null;

              let aggA = null;
              let aggB = null;
              let winnerId = null;
              if (leg1.isPlayed && (isFinal || (leg2 && leg2.isPlayed))) {
                if (isFinal) {
                  aggA = leg1.homeScore + (leg1.homePenalties || 0);
                  aggB = leg1.awayScore + (leg1.awayPenalties || 0);
                } else {
                  aggA = leg1.homeScore + leg2.awayScore + (leg2.awayPenalties || 0);
                  aggB = leg1.awayScore + leg2.homeScore + (leg2.homePenalties || 0);
                }
                winnerId = aggA > aggB ? teamA.id : teamB.id;
              }

              return (
                <div key={idx} className="card glass-panel" style={{ padding: '1.5rem', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <img src={teamA.logo} style={{ width: '32px', height: '32px', borderRadius: '50%' }} alt="" />
                      <span style={{ fontWeight: winnerId === teamA.id ? 800 : 500, fontSize: '1.1rem' }}>{teamA.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: winnerId === teamB.id ? 800 : 500, fontSize: '1.1rem' }}>{teamB.name}</span>
                      <img src={teamB.logo} style={{ width: '32px', height: '32px', borderRadius: '50%' }} alt="" />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div
                      onClick={() => openModal(leg1)}
                      style={{
                        display: 'flex', justifyContent: 'space-between', padding: '0.5rem',
                        background: leg1.isPlayed ? 'rgba(0,0,0,0.2)' : 'rgba(251, 191, 36, 0.1)',
                        borderRadius: '8px', cursor: (!isAdmin) ? 'default' : 'pointer',
                        opacity: leg1.isPlayed ? 0.7 : 1
                      }}
                    >
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{isFinal ? 'Final' : 'Leg 1'} (at {teamA.name})</span>
                      <span style={{ fontWeight: 700 }}>{leg1.isPlayed ? `${leg1.homeScore} - ${leg1.awayScore} ${isAdmin ? '✏️' : ''}` : (isAdmin ? 'Play' : 'Upcoming')}</span>
                    </div>

                    {!isFinal && leg2 && (
                      <div
                        onClick={() => leg1.isPlayed ? openModal(leg2) : null}
                        style={{
                          display: 'flex', justifyContent: 'space-between', padding: '0.5rem',
                          background: leg2.isPlayed ? 'rgba(0,0,0,0.2)' : (leg1.isPlayed ? 'rgba(251, 191, 36, 0.1)' : 'rgba(0,0,0,0.1)'),
                          borderRadius: '8px', cursor: (!isAdmin || !leg1.isPlayed) ? 'default' : 'pointer',
                          opacity: leg2.isPlayed || !leg1.isPlayed ? 0.7 : 1
                        }}
                      >
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Leg 2 (at {teamB.name})</span>
                        <span style={{ fontWeight: 700 }}>
                          {leg2.isPlayed
                            ? `${leg2.awayScore} - ${leg2.homeScore} ${isAdmin ? '✏️' : ''}`
                            : (leg1.isPlayed ? (isAdmin ? 'Play' : 'Upcoming') : 'Wait')}
                        </span>
                      </div>
                    )}
                  </div>

                  {winnerId && (
                    <div style={{ marginTop: '1rem', textAlign: 'center', padding: '0.5rem', background: 'rgba(251, 191, 36, 0.15)', borderRadius: '8px', color: '#fbbf24', fontWeight: 700 }}>
                      {isFinal
                        ? (leg1.homePenalties || leg1.awayPenalties ? `${aggA > aggB ? teamA.name : teamB.name} wins on penalties!` : `${aggA > aggB ? teamA.name : teamB.name} wins!`)
                        : `Agg: ${aggA} - ${aggB} | ${aggA > aggB ? teamA.name : teamB.name} advances${leg2.homePenalties || leg2.awayPenalties ? ' on penalties' : ''}`
                      }
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '3rem', textAlign: 'center', background: 'radial-gradient(circle at center, rgba(251, 191, 36, 0.15) 0%, transparent 70%)', padding: '3rem 1rem', borderRadius: '20px', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
        <Crown color="#fbbf24" size={48} style={{ margin: '0 auto 1rem' }} />
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#fbbf24' }}>Champions League</h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 2rem' }}>
          The greatest stage. 16 teams enter the knockout bracket. Only one will be crowned the ultimate champion of Botola.
        </p>

        {isAdmin && !hasStarted ? (
          setupMode === 'settings' ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.05)', padding: '12px 24px', borderRadius: '12px' }}>
                <span style={{ fontWeight: 500 }}>Number of Teams:</span>
                <input 
                  type="number" 
                  className="input-field" 
                  min="3" 
                  max="16" 
                  value={teamCount} 
                  onChange={(e) => setTeamCount(e.target.value)} 
                  style={{ width: '80px', textAlign: 'center', fontSize: '1.2rem', padding: '8px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  className="btn"
                  style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '1.1rem', padding: '1rem 2rem' }}
                  onClick={() => {
                    if (window.confirm(`Are you sure? This will randomly draw ${teamCount} teams for the tournament. Any missing spots will be given as Byes.`)) {
                      generateChampionsLeague(teamCount);
                    }
                  }}
                >
                  🎲 Random Setup
                </button>
                <button
                  className="btn"
                  style={{ background: '#fbbf24', color: '#000', fontSize: '1.1rem', padding: '1rem 2rem' }}
                  onClick={handleSetupManual}
                >
                  ✏️ Manual Setup
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
              <h3 style={{ color: '#fbbf24', marginBottom: '1rem' }}>Configure Matchups</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem', textAlign: 'center' }}>
                Select teams for each match. If you have less than 4, 8, or 16 teams, select "(BYE)" for the missing spots.
              </p>
              
              {manualPairings.map((pairing, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
                  <span style={{ color: 'var(--text-muted)', width: '60px' }}>Match {idx + 1}</span>
                  <select 
                    className="input-field" 
                    style={{ flex: 1 }}
                    value={pairing.home}
                    onChange={(e) => updateManualPairing(idx, 'home', e.target.value)}
                  >
                    <option value="">Select Team...</option>
                    <option value="BYE">(BYE)</option>
                    {teams.map(t => <option key={`h-${t.id}`} value={t.id}>{t.name}</option>)}
                  </select>
                  <span style={{ fontWeight: 'bold' }}>VS</span>
                  <select 
                    className="input-field" 
                    style={{ flex: 1 }}
                    value={pairing.away}
                    onChange={(e) => updateManualPairing(idx, 'away', e.target.value)}
                  >
                    <option value="">Select Team...</option>
                    <option value="BYE">(BYE)</option>
                    {teams.map(t => <option key={`a-${t.id}`} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              ))}
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button className="btn btn-outline" onClick={() => setSetupMode('settings')}>Cancel</button>
                <button className="btn" style={{ background: '#fbbf24', color: '#000' }} onClick={handleStartManual}>
                  <Play size={20} fill="#000" /> Start Tournament
                </button>
              </div>
            </div>
          )
        ) : isAdmin && hasStarted ? (
          <button
            className="btn btn-outline"
            style={{ borderColor: 'rgba(251, 191, 36, 0.4)', color: '#fbbf24', fontSize: '0.9rem', padding: '0.5rem 1rem', marginTop: '1rem' }}
            onClick={() => {
              if (window.confirm("Are you sure? This will delete the current bracket and allow you to set up a new one.")) {
                resetChampionsLeague();
              }
            }}
          >
            Reset Tournament
          </button>
        ) : null}
      </div>

      {hasStarted && (
        <VisualBracket teams={teams} matches={clMatches} isAdmin={isAdmin} openModal={openModal} />
      )}

      {hasStarted && (
        <div style={{ position: 'relative' }}>
          {STAGES.map(stage => renderStage(stage))}
        </div>
      )}

      {/* Match Modal */}
      {showModal && selectedMatch && createPortal(
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ border: '1px solid rgba(251, 191, 36, 0.3)' }}>
            <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', color: '#fbbf24' }}>{selectedMatch.stage} - Match {selectedMatch.matchNumber + 1}</h2>
            <form onSubmit={handleRecordMatch}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2rem', marginBottom: '2rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <img src={teams.find(t => t.id === selectedMatch.homeTeamId)?.logo} style={{ width: '64px', height: '64px', borderRadius: '50%', marginBottom: '1rem', border: '2px solid var(--border-color)' }} />
                  <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{teams.find(t => t.id === selectedMatch.homeTeamId)?.name}</h3>
                  <input type="number" className="input-field" min="0" value={homeScore} onChange={e => setHomeScore(e.target.value)} required style={{ width: '80px', fontSize: '2rem', textAlign: 'center' }} />
                </div>

                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-muted)' }}>VS</div>

                <div style={{ textAlign: 'center' }}>
                  <img src={teams.find(t => t.id === selectedMatch.awayTeamId)?.logo} style={{ width: '64px', height: '64px', borderRadius: '50%', marginBottom: '1rem', border: '2px solid var(--border-color)' }} />
                  <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{teams.find(t => t.id === selectedMatch.awayTeamId)?.name}</h3>
                  <input type="number" className="input-field" min="0" value={awayScore} onChange={e => setAwayScore(e.target.value)} required style={{ width: '80px', fontSize: '2rem', textAlign: 'center' }} />
                </div>
              </div>

              {showPenalties && (
                <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(251, 191, 36, 0.05)', borderRadius: '12px', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
                  <h4 style={{ textAlign: 'center', marginBottom: '1rem', color: '#fbbf24', fontSize: '1.1rem' }}>Penalty Shootout Goals</h4>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2rem' }}>
                    <div style={{ textAlign: 'center' }}>
                      <input type="number" className="input-field" min="0" value={homePenalties} onChange={e => setHomePenalties(e.target.value)} required style={{ width: '60px', fontSize: '1.5rem', textAlign: 'center' }} />
                    </div>
                    <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>-</div>
                    <div style={{ textAlign: 'center' }}>
                      <input type="number" className="input-field" min="0" value={awayPenalties} onChange={e => setAwayPenalties(e.target.value)} required style={{ width: '60px', fontSize: '1.5rem', textAlign: 'center' }} />
                    </div>
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn" style={{ background: '#fbbf24', color: '#000' }}>Confirm Result</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ChampionsLeague;
