import React, { useState } from 'react';

const LabGenerator = ({
  topic,
  setTopic,
  setExperiment,
  setActiveTab
}) => {
  const [customInstructions, setCustomInstructions] = useState('');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError('');
    setExperiment(null);

    try {
      const response = await fetch('http://localhost:5000/api/generate-experiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, difficulty, customInstructions })
      });
      const data = await response.json();
      
      if (data.success && data.experiment) {
        setExperiment(data.experiment.data);
        setActiveTab('aim');
      } else {
        setError(data.message || 'Failed to generate experiment');
      }
    } catch (err) {
      setError('Network error. Is the backend running? ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="generator-card">
      <h2>Generate a New Lab Experiment</h2>
      
      <form onSubmit={handleGenerate} className="generator-form">
        <div className="form-row">
          <div className="form-group flex-1">
            <label>Topic</label>
            <input 
              type="text" 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., SQL Injection" 
              disabled={loading}
              required
            />
          </div>
          <div className="form-group w-30">
            <label>Difficulty</label>
            <select 
              value={difficulty} 
              onChange={(e) => setDifficulty(e.target.value)}
              disabled={loading}
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>
        
        <div className="form-group">
          <label>Custom Instructions (Optional)</label>
          <textarea 
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            disabled={loading}
          />
        </div>
        
        <button type="submit" className="generate-btn" disabled={loading || !topic.trim()}>
          {loading ? (
            <span className="loading-spinner"></span>
          ) : 'Simulate'}
        </button>
      </form>
      {error && <div className="error-banner">{error}</div>}
    </div>
  );
};

export default LabGenerator;
