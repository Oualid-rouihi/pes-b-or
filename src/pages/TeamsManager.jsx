import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../supabaseClient';
import { Trash2, Plus, Pencil, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const TeamsManager = ({ isAdmin }) => {
  const { teams, addTeam, updateTeam, deleteTeam } = useAppContext();
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamLogoFile, setNewTeamLogoFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Edit State
  const [editingTeam, setEditingTeam] = useState(null);
  const [editTeamName, setEditTeamName] = useState('');
  const [editTeamLogoFile, setEditTeamLogoFile] = useState(null);
  const [isEditingUploading, setIsEditingUploading] = useState(false);
  const editFileInputRef = useRef(null);

  const openEditModal = (team) => {
    setEditingTeam(team);
    setEditTeamName(team.name);
    setEditTeamLogoFile(null);
  };

  const closeEditModal = () => {
    setEditingTeam(null);
    setEditTeamName('');
    setEditTeamLogoFile(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editTeamName.trim()) return;

    setIsEditingUploading(true);
    let finalLogoUrl = editingTeam.logo;

    try {
      if (editTeamLogoFile) {
        const fileExt = editTeamLogoFile.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        
        const { error } = await supabase.storage
          .from('logos')
          .upload(fileName, editTeamLogoFile);
          
        if (error) throw error;

        const { data: publicUrlData } = supabase.storage
          .from('logos')
          .getPublicUrl(fileName);
          
        finalLogoUrl = publicUrlData.publicUrl;
      }

      await updateTeam(editingTeam.id, {
        name: editTeamName,
        logo: finalLogoUrl
      });
      
      closeEditModal();
    } catch (err) {
      console.error("Error updating team:", err);
      alert("Failed to update team.");
    } finally {
      setIsEditingUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    
    setIsUploading(true);
    let finalLogoUrl = '';

    try {
      if (newTeamLogoFile) {
        const fileExt = newTeamLogoFile.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        
        const { error } = await supabase.storage
          .from('logos')
          .upload(fileName, newTeamLogoFile);
          
        if (error) {
          console.error("Error uploading image:", error);
          alert("Error uploading image. Please make sure the 'logos' bucket exists and is public.");
          setIsUploading(false);
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from('logos')
          .getPublicUrl(fileName);
          
        finalLogoUrl = publicUrlData.publicUrl;
      }

      await addTeam({
        name: newTeamName,
        logo: finalLogoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(newTeamName)}&background=random&color=fff`
      });
      
      setNewTeamName('');
      setNewTeamLogoFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Teams Manager</h1>
          <p style={{ color: 'var(--text-muted)' }}>Add and manage teams for your tournaments ({teams.length}/16 for Champions League).</p>
        </div>
      </div>

      <div className={isAdmin ? 'grid-1-2' : 'grid-1'}>
        {/* Add Team Form */}
        {isAdmin && (
        <div className="card glass-panel" style={{ height: 'fit-content' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Add New Team</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Team Name</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. Real Madrid" 
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                required
                disabled={isUploading}
              />
            </div>
            <div className="input-group">
              <label>Team Logo (Optional)</label>
              <input 
                type="file" 
                accept="image/*"
                className="input-field" 
                onChange={(e) => setNewTeamLogoFile(e.target.files[0])}
                ref={fileInputRef}
                disabled={isUploading}
                style={{ padding: '0.5rem' }}
              />
              <small style={{ color: 'var(--text-muted)', marginTop: '0.5rem', display: 'block' }}>
                You can upload a picture from your device.
              </small>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={isUploading}>
              {isUploading ? 'Uploading...' : <><Plus size={18} /> Add Team</>}
            </button>
          </form>
        </div>
        )}

        {/* Teams List */}
        <div className="card glass-panel">
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Registered Teams</h2>
          
          {teams.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No teams added yet. Add some teams to get started!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {teams.map(team => (
                <div key={team.id} style={{ 
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '12px', 
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <img 
                    src={team.logo} 
                    alt={team.name} 
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} 
                  />
                  <span style={{ fontWeight: 600 }}>{team.name}</span>
                  
                  {isAdmin && (
                    <div style={{ position: 'absolute', right: '10px', display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => openEditModal(team)}
                        style={{ 
                          background: 'rgba(59, 130, 246, 0.1)', 
                          color: '#3b82f6',
                          padding: '0.4rem',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={() => deleteTeam(team.id)}
                        style={{ 
                          background: 'rgba(239, 68, 68, 0.1)', 
                          color: '#ef4444',
                          padding: '0.4rem',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingTeam && createPortal(
        <div className="modal-overlay">
          <div className="modal-content card glass-panel animate-fade-in" style={{ maxWidth: '400px', width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem' }}>Edit Team</h2>
              <button onClick={closeEditModal} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit}>
              <div className="input-group">
                <label>Team Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={editTeamName}
                  onChange={(e) => setEditTeamName(e.target.value)}
                  required
                  disabled={isEditingUploading}
                />
              </div>
              <div className="input-group">
                <label>Update Logo (Leave empty to keep current)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  className="input-field" 
                  onChange={(e) => setEditTeamLogoFile(e.target.files[0])}
                  ref={editFileInputRef}
                  disabled={isEditingUploading}
                  style={{ padding: '0.5rem' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={closeEditModal} className="btn" style={{ flex: 1, background: 'rgba(255,255,255,0.1)' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isEditingUploading}>
                  {isEditingUploading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default TeamsManager;
