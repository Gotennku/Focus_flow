import { useState, useEffect } from 'react';
import { useStore } from '../store';
import './Settings.css';

const Settings = () => {
  const { settings, updateSettings } = useStore();

  const [localSettings, setLocalSettings] = useState(settings);
  const [newSite, setNewSite] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = async () => {
    await updateSettings(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAddSite = () => {
    if (newSite.trim() && !localSettings.blockedSites.includes(newSite.trim())) {
      setLocalSettings({
        ...localSettings,
        blockedSites: [...localSettings.blockedSites, newSite.trim()]
      });
      setNewSite('');
    }
  };

  const handleRemoveSite = (site: string) => {
    setLocalSettings({
      ...localSettings,
      blockedSites: localSettings.blockedSites.filter(s => s !== site)
    });
  };

  const hasChanges = JSON.stringify(localSettings) !== JSON.stringify(settings);

  return (
    <div className="settings-container container">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">⚙️ Paramètres</h2>
          <p className="card-subtitle">
            Personnalisez votre expérience Focus Flow
          </p>
        </div>

        {/* Timer Settings */}
        <div className="settings-section">
          <h3 className="settings-section-title">⏱️ Durées du Timer</h3>

          <div className="settings-grid">
            <div className="input-group">
              <label>Durée de travail (minutes)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={localSettings.workDuration}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    workDuration: parseInt(e.target.value) || 25
                  })
                }
              />
              <small>Durée d'une session de focus (recommandé: 25 min)</small>
            </div>

            <div className="input-group">
              <label>Pause courte (minutes)</label>
              <input
                type="number"
                min="1"
                max="30"
                value={localSettings.shortBreak}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    shortBreak: parseInt(e.target.value) || 5
                  })
                }
              />
              <small>Durée de la pause courte (recommandé: 5 min)</small>
            </div>

            <div className="input-group">
              <label>Pause longue (minutes)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={localSettings.longBreak}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    longBreak: parseInt(e.target.value) || 15
                  })
                }
              />
              <small>Durée de la pause longue (recommandé: 15 min)</small>
            </div>

            <div className="input-group">
              <label>Pomodoros avant pause longue</label>
              <input
                type="number"
                min="1"
                max="10"
                value={localSettings.pomodorosUntilLongBreak}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    pomodorosUntilLongBreak: parseInt(e.target.value) || 4
                  })
                }
              />
              <small>Nombre de Pomodoros avant une pause longue (recommandé: 4)</small>
            </div>
          </div>
        </div>

        {/* Audio Settings */}
        <div className="settings-section">
          <h3 className="settings-section-title">🔊 Audio</h3>

          <div className="settings-toggles">
            <div className="toggle-item">
              <div>
                <div className="toggle-label">Activer les sons</div>
                <small>Sons de notification à la fin des sessions</small>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={localSettings.enableSounds}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      enableSounds: e.target.checked
                    })
                  }
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="toggle-item">
              <div>
                <div className="toggle-label">Musique lo-fi</div>
                <small>Musique d'ambiance pendant les sessions de focus</small>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={localSettings.enableMusic}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      enableMusic: e.target.checked
                    })
                  }
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Blocked Sites */}
        <div className="settings-section">
          <h3 className="settings-section-title">🚫 Sites Bloqués</h3>
          <p className="settings-section-subtitle">
            Ces sites seront bloqués pendant vos sessions de focus
          </p>

          <div className="blocked-sites-input">
            <input
              type="text"
              placeholder="Ex: facebook.com"
              value={newSite}
              onChange={(e) => setNewSite(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSite()}
            />
            <button className="btn btn-primary" onClick={handleAddSite}>
              Ajouter
            </button>
          </div>

          <div className="blocked-sites-list">
            {localSettings.blockedSites.map((site) => (
              <div key={site} className="blocked-site-item">
                <span>{site}</span>
                <button
                  className="btn-icon"
                  onClick={() => handleRemoveSite(site)}
                  title="Retirer"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {localSettings.blockedSites.length === 0 && (
            <div className="empty-blocked-sites">
              Aucun site bloqué. Ajoutez des sites pour améliorer votre concentration.
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="settings-actions">
          <button
            className={`btn ${saved ? 'btn-success' : 'btn-primary'}`}
            onClick={handleSave}
            disabled={!hasChanges || saved}
          >
            {saved ? '✓ Enregistré' : 'Enregistrer les modifications'}
          </button>
          {hasChanges && (
            <button
              className="btn btn-secondary"
              onClick={() => setLocalSettings(settings)}
            >
              Annuler
            </button>
          )}
        </div>

        {/* Info Section */}
        <div className="settings-info">
          <h4>ℹ️ À propos de Focus Flow</h4>
          <p>
            Focus Flow v1.0.0 - Application de productivité basée sur la technique Pomodoro.
          </p>
          <p>
            <strong>Note importante :</strong> Le blocage de sites nécessite des permissions administrateur
            sur certains systèmes. Si le blocage ne fonctionne pas, essayez de lancer l'application
            en tant qu'administrateur.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
