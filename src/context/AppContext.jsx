import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { v4 as uuidv4 } from 'uuid';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from Supabase on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: teamsData, error: teamsError } = await supabase.from('teams').select('*');
        if (teamsError) throw teamsError;

        const { data: matchesData, error: matchesError } = await supabase.from('matches').select('*');
        if (matchesError) throw matchesError;

        setTeams(teamsData || []);
        setMatches(matchesData || []);
      } catch (err) {
        console.error('Error loading from Supabase:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const addTeam = async (teamData) => {
    try {
      const newTeam = { id: uuidv4(), ...teamData };
      const { error } = await supabase.from('teams').insert([newTeam]);
      if (error) throw error;
      setTeams(prev => [...prev, newTeam]);
    } catch (err) {
      console.error('Error adding team:', err);
    }
  };

  const updateTeam = async (id, updatedData) => {
    try {
      const { error } = await supabase.from('teams').update(updatedData).eq('id', id);
      if (error) throw error;
      setTeams(prev => prev.map(t => t.id === id ? { ...t, ...updatedData } : t));
    } catch (err) {
      console.error('Error updating team:', err);
    }
  };

  const deleteTeam = async (id) => {
    try {
      const { error } = await supabase.from('teams').delete().eq('id', id);
      if (error) throw error;
      setTeams(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Error deleting team:', err);
    }
  };

  const addMatch = async (matchData) => {
    try {
      const newMatch = { id: uuidv4(), isPlayed: false, homeScore: 0, awayScore: 0, ...matchData };
      const { error } = await supabase.from('matches').insert([newMatch]);
      if (error) throw error;
      setMatches(prev => [...prev, newMatch]);
    } catch (err) {
      console.error('Error adding match:', err);
    }
  };

  const updateMatchResult = async (id, homeScore, awayScore, homePenalties = 0, awayPenalties = 0) => {
    try {
      const updates = {
        homeScore: parseInt(homeScore),
        awayScore: parseInt(awayScore),
        homePenalties: parseInt(homePenalties),
        awayPenalties: parseInt(awayPenalties),
        isPlayed: true
      };
      
      const { error } = await supabase.from('matches').update(updates).eq('id', id);
      if (error) throw error;

      setMatches(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    } catch (err) {
      console.error('Error updating match:', err);
    }
  };

  // Generate Champions League Bracket with auto-Byes for ANY number of teams
  const generateChampionsLeague = async (inputTeamCount = 16) => {
    const teamCount = parseInt(inputTeamCount);
    if (teams.length < teamCount) {
      alert(`You need at least ${teamCount} teams to start the Champions League!`);
      return;
    }
    if (teamCount < 3 || teamCount > 16) {
      alert("Please enter a number between 3 and 16.");
      return;
    }
    
    try {
      // Clear existing Champions League matches in Supabase
      const { error: deleteError } = await supabase.from('matches').delete().eq('competition', 'champions');
      if (deleteError) throw deleteError;

      // Calculate the next power of 2
      let P = 16;
      if (teamCount <= 4) P = 4;
      else if (teamCount <= 8) P = 8;
      else if (teamCount <= 16) P = 16;

      const numByes = P - teamCount;
      const numNormalMatchups = (P / 2) - numByes;

      // Randomize selected number of teams
      const shuffled = [...teams].slice(0, teamCount).sort(() => 0.5 - Math.random());
      
      const teamsForByes = shuffled.slice(0, numByes);
      const teamsForNormal = shuffled.slice(numByes);

      const newMatches = [];
      let startingStage = 'Round of 16';
      if (P === 8) startingStage = 'Quarter-finals';
      else if (P === 4) startingStage = 'Semi-finals';
      
      let matchNumber = 0;

      // Generate BYE matchups (Auto-wins)
      for (let i = 0; i < numByes; i++) {
        // Leg 1
        newMatches.push({
          id: uuidv4(),
          competition: 'champions',
          stage: startingStage,
          matchNumber: matchNumber,
          leg: 1,
          homeTeamId: teamsForByes[i].id,
          awayTeamId: 'BYE',
          homeScore: 1, // Auto win
          awayScore: 0,
          homePenalties: 0,
          awayPenalties: 0,
          isPlayed: true // Already played
        });
        // Leg 2
        newMatches.push({
          id: uuidv4(),
          competition: 'champions',
          stage: startingStage,
          matchNumber: matchNumber,
          leg: 2,
          homeTeamId: 'BYE',
          awayTeamId: teamsForByes[i].id,
          homeScore: 0,
          awayScore: 0,
          homePenalties: 0,
          awayPenalties: 0,
          isPlayed: true
        });
        matchNumber++;
      }

      // Generate Normal matchups
      for (let i = 0; i < teamsForNormal.length; i += 2) {
        // Leg 1
        newMatches.push({
          id: uuidv4(),
          competition: 'champions',
          stage: startingStage,
          matchNumber: matchNumber,
          leg: 1,
          homeTeamId: teamsForNormal[i].id,
          awayTeamId: teamsForNormal[i+1].id,
          homeScore: 0,
          awayScore: 0,
          homePenalties: 0,
          awayPenalties: 0,
          isPlayed: false
        });
        // Leg 2
        newMatches.push({
          id: uuidv4(),
          competition: 'champions',
          stage: startingStage,
          matchNumber: matchNumber,
          leg: 2,
          homeTeamId: teamsForNormal[i+1].id,
          awayTeamId: teamsForNormal[i].id,
          homeScore: 0,
          awayScore: 0,
          homePenalties: 0,
          awayPenalties: 0,
          isPlayed: false
        });
        matchNumber++;
      }

      const { error: insertError } = await supabase.from('matches').insert(newMatches);
      if (insertError) throw insertError;

      // Update local state
      const filteredMatches = matches.filter(m => m.competition !== 'champions');
      setMatches([...filteredMatches, ...newMatches]);
    } catch (err) {
      console.error('Error generating Champions League:', err);
    }
  };

  return (
    <AppContext.Provider value={{ 
      teams, addTeam, updateTeam, deleteTeam, 
      matches, addMatch, updateMatchResult, generateChampionsLeague 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
