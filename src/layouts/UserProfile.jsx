import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserProfile.css';
import { Edit, Briefcase, MapPin, Cake, Link as LinkIcon, X, ImageOff } from 'lucide-react';

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200&auto=format&fit=crop',
];

const getInitials = (name) => {
  if (!name) return '';
  const nameParts = name.split(' ');
  if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
  return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
};

const generateColorFromName = (name) => {
  if (!name) return '#cccccc';
  const colors = ['#0077b6', '#0096c7', '#48cae4', '#90e0ef', '#ade8f4'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash % colors.length)];
};

const UserProfile = ({ userData, onProfileUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  // State to hold form data while editing. Initialized when editing starts.
  const [editedData, setEditedData] = useState(null);
  const navigate = useNavigate();

  // Updates the temporary state, not the parent component's state.
  const handleInputChange = (e) => {
    setEditedData(prevData => ({ ...prevData, [e.target.name]: e.target.value }));
  };

  // Updates the temporary avatar URL.
  const handleAvatarSelect = (url) => {
    setEditedData(prevData => ({ ...prevData, avatarUrl: url }));
  };

  // When "Edit" is clicked, copy current data to a temporary state for editing.
  const handleEditClick = () => {
    setEditedData(userData);
    setIsEditing(true);
  };

  // On save, call the parent update function with the edited data.
  const handleSave = () => {
    onProfileUpdate(editedData);
    setIsEditing(false);
    setEditedData(null); // Clear temporary state
    navigate('/home');
  };

  // On cancel, simply close the modal and clear the temporary state.
  const handleCancel = () => {
    setIsEditing(false);
    setEditedData(null);
  }

  const InitialsAvatar = ({ name }) => (
    <div className="profile-avatar initials-avatar" style={{ backgroundColor: generateColorFromName(name) }}>
      <span>{getInitials(name)}</span>
    </div>
  );

  return (
    <div className="profile-page-container">
      <div className="dynamic-background"></div>
      <div className="profile-card">
        <button className="edit-button" onClick={handleEditClick}><Edit size={18} /></button>
        <div className="profile-header">
          {userData.avatarUrl ? (
            <img src={userData.avatarUrl} alt="User Avatar" className="profile-avatar" />
          ) : (
            <InitialsAvatar name={userData.name} />
          )}
          <h1 className="profile-name">{userData.name}</h1>
          <p className="profile-handle">{userData.handle}</p>
        </div>
        <div className="profile-body">
          <p className="profile-bio">{userData.bio}</p>
          <div className="profile-details">
            <div className="detail-item"><Briefcase size={16} /><span>{userData.qualification}</span></div>
            <div className="detail-item"><MapPin size={16} /><span>{userData.location}</span></div>
            <div className="detail-item"><Cake size={16} /><span>Born on {new Date(userData.dob).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span></div>
            <div className="detail-item"><LinkIcon size={16} /><a href={userData.website} target="_blank" rel="noopener noreferrer">{userData.website}</a></div>
          </div>
        </div>
      </div>

      {isEditing && editedData && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-modal-button" onClick={handleCancel}><X size={20} /></button>
            <h2>Edit Your Profile</h2>
            <form className="edit-form">
              <div className="avatar-picker full-width">
                <label>Choose Avatar</label>
                <div className="avatar-selection-grid">
                  {AVATAR_OPTIONS.map(url => <img key={url} src={url} alt="Avatar option" className={`avatar-option ${editedData.avatarUrl === url ? 'selected' : ''}`} onClick={() => handleAvatarSelect(url)} />)}
                  <button
                    type="button"
                    className={`avatar-option remove-photo ${!editedData.avatarUrl ? 'selected' : ''}`}
                    onClick={() => handleAvatarSelect(null)}
                  >
                    <ImageOff size={24} />
                  </button>
                </div>
              </div>
              {/* Form inputs now read from and write to the temporary 'editedData' state */}
              <div className="form-group"><label>Name</label><input type="text" name="name" value={editedData.name} onChange={handleInputChange} /></div>
              <div className="form-group"><label>Handle</label><input type="text" name="handle" value={editedData.handle} onChange={handleInputChange} /></div>
              <div className="form-group"><label>Qualification</label><input type="text" name="qualification" value={editedData.qualification} onChange={handleInputChange} /></div>
              <div className="form-group"><label>Location</label><input type="text" name="location" value={editedData.location} onChange={handleInputChange} /></div>
              <div className="form-group"><label>Date of Birth</label><input type="date" name="dob" value={editedData.dob} onChange={handleInputChange} /></div>
              <div className="form-group"><label>Website</label><input type="url" name="website" value={editedData.website} onChange={handleInputChange} /></div>
              <div className="form-group full-width"><label>Bio</label><textarea name="bio" value={editedData.bio} onChange={handleInputChange}></textarea></div>
            </form>
            <div className="modal-actions">
              <button className="btn secondary" onClick={handleCancel}>Cancel</button>
              <button className="btn primary" onClick={handleSave}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;