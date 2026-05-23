import re

with open('src/pages/ChampionsLeague.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

import_statement = "import { Crown, Play, Trophy } from 'lucide-react';"
content = content.replace("import { Crown, Play } from 'lucide-react';", import_statement)

visual_bracket_code = """
const VisualBracket = ({ teams, matches }) => {
  if (!matches || matches.length === 0) return null;

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
      teamA: teams.find(t => t.id === (leg1 ? leg1.homeTeamId : null)),
      teamB: teams.find(t => t.id === (leg1 ? leg1.awayTeamId : null)),
      aggA, aggB, winnerId
    };
  };

  const TeamCard = ({ team, score, isWinner }) => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: isWinner ? 'rgba(251, 191, 36, 0.2)' : 'rgba(255,255,255,0.05)',
      border: isWinner ? '1px solid rgba(251, 191, 36, 0.5)' : '1px solid rgba(255,255,255,0.1)',
      padding: '0.25rem 0.5rem', borderRadius: '4px', width: '130px', height: '32px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
        {team ? <img src={team.logo} alt="" style={{ width: '16px', height: '16px' }} /> : null}
        <span style={{ fontSize: '0.7rem', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
          {team ? team.name : 'TBD'}
        </span>
      </div>
      {score !== null && <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{score}</span>}
    </div>
  );

  const MatchNode = ({ stage, matchNum }) => {
    const { teamA, teamB, aggA, aggB, winnerId } = getMatchData(stage, matchNum);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '6px', position: 'relative' }}>
        <TeamCard team={teamA} score={aggA} isWinner={winnerId === teamA?.id} />
        <TeamCard team={teamB} score={aggB} isWinner={winnerId === teamB?.id} />
      </div>
    );
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'stretch', 
      gap: '1.5rem', 
      overflowX: 'auto', 
      padding: '2rem 1rem', 
      marginBottom: '3rem',
      background: 'rgba(0,0,0,0.2)',
      borderRadius: '20px',
      border: '1px solid rgba(255,255,255,0.1)'
    }}>
      <div style={{ display: 'flex', minWidth: '950px', justifyContent: 'space-between', gap: '1rem', width: '100%' }}>
        {/* Left R16 */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', gap: '1rem' }}>
          {[0, 1, 2, 3].map(i => <MatchNode key={`R16L${i}`} stage="Round of 16" matchNum={i} />)}
        </div>
        {/* Left QF */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', gap: '1rem', padding: '2rem 0' }}>
          {[0, 1].map(i => <MatchNode key={`QFL${i}`} stage="Quarter-finals" matchNum={i} />)}
        </div>
        {/* Left SF */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', gap: '1rem', padding: '4rem 0' }}>
          <MatchNode stage="Semi-finals" matchNum={0} />
        </div>
        
        {/* Center Final & Trophy */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '2rem', minWidth: '150px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Trophy size={64} color="#fbbf24" style={{ filter: 'drop-shadow(0 0 10px rgba(251, 191, 36, 0.5))' }} />
            <div style={{ color: '#fbbf24', fontWeight: 800, marginTop: '0.5rem', letterSpacing: '2px', textTransform: 'uppercase' }}>FINAL</div>
          </div>
          <MatchNode stage="Final" matchNum={0} />
        </div>

        {/* Right SF */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', gap: '1rem', padding: '4rem 0' }}>
          <MatchNode stage="Semi-finals" matchNum={1} />
        </div>
        {/* Right QF */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', gap: '1rem', padding: '2rem 0' }}>
          {[2, 3].map(i => <MatchNode key={`QFR${i}`} stage="Quarter-finals" matchNum={i} />)}
        </div>
        {/* Right R16 */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', gap: '1rem' }}>
          {[4, 5, 6, 7].map(i => <MatchNode key={`R16R${i}`} stage="Round of 16" matchNum={i} />)}
        </div>
      </div>
    </div>
  );
};

const ChampionsLeague = ({ isAdmin }) => {
"""

content = content.replace("const ChampionsLeague = ({ isAdmin }) => {", visual_bracket_code)

render_bracket_call = """      {hasStarted && (
        <VisualBracket teams={teams} matches={clMatches} />
      )}

      {hasStarted && (
"""

content = content.replace("      {hasStarted && (\\n        <div style={{ position: 'relative' }}>", render_bracket_call + "        <div style={{ position: 'relative' }}>")

with open('src/pages/ChampionsLeague.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
