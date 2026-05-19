
import React from 'react';
import TestSection from './TestSection';

const renderSafeString = (item) => {
  if (item === null || item === undefined) return '';
  if (typeof item === 'string') return item;
  if (typeof item === 'object') {
    return item.text || item.description || item.title || item.step || JSON.stringify(item);
  }
  return String(item);
};

const ensureArray = (arr) => Array.isArray(arr) ? arr : (arr ? [arr] : []);

const LabWorkspace = ({
  experiment,
  setExperiment,
  setTopic,
  activeTab,
  setActiveTab,
}) => {
  return (
    <div className="lab-workspace">
      <div className="lab-header">
        <h2>{experiment.title}</h2>
        <button
          className="close-lab-btn"
          onClick={() => { setExperiment(null); setTopic(''); }}
        >
          Close Lab
        </button>
      </div>

      <div className="lab-layout">
        <aside className="lab-sidebar">
          <ul className="tab-list">
            {['aim', 'theory', 'pre-test', 'procedure', 'simulation', 'post-test', 'references'].map((tab) => (
              <li key={tab}>
                <button
                  className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="lab-content">
          {activeTab === 'aim' && (
            <div className="tab-pane fade-in">
              <h3>Aim</h3>
              <p className="lead-text">{experiment.aim}</p>
            </div>
          )}

          {activeTab === 'theory' && (
            <div className="tab-pane fade-in">
              <h3>Theory</h3>
              <div className="text-content" dangerouslySetInnerHTML={{ __html: experiment.theory }}>
              </div>
            </div>
          )}

          {activeTab === 'pre-test' && (
            <div className="tab-pane fade-in">
              <TestSection testArray={experiment.preTest} title="Pre-Test Assessment" />
            </div>
          )}

          {activeTab === 'procedure' && (
            <div className="tab-pane fade-in">
              <h3>Procedure</h3>
              <ol className="procedure-list">
                {ensureArray(experiment.procedure).map((step, idx) => (
                  <li key={idx}>
                    <span className="step-num">{idx + 1}</span>
                    <p>{renderSafeString(step)}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {activeTab === 'simulation' && (
            <div className="tab-pane simulation-pane fade-in">
              {/* <h3>Simulation Environment</h3> */}
              {experiment.simulation && (experiment.simulation.html || experiment.simulation.url) ? (
                <div className="simulation-card dynamic-sim">
                  {experiment.simulation.url ? (
                    <iframe
                      title="Interactive Simulation"
                      src={experiment.simulation.url}
                      style={{ width: '100%', height: '80vh', border: 'none', borderRadius: '12px', backgroundColor: '#fff', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}
                    />
                  ) : (
                    <iframe
                      title="Simulation Environment"
                      srcDoc={`
                        <!DOCTYPE html>
                        <html>
                          <head>
                            <meta charset="utf-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
                            <style>
                              * { box-sizing: border-box; margin: 0; padding: 0; }
                              body { 
                                font-family: 'Inter', sans-serif; 
                                padding: 20px; 
                                background-color: #f8fafc; 
                                color: #0f172a;
                                line-height: 1.5;
                              }
                              
                              /* Premium Base Layout */
                              .sim-workspace {
                                display: flex;
                                flex-direction: row;
                                gap: 20px;
                                background: #ffffff;
                                padding: 24px;
                                border-radius: 16px;
                                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                                min-height: 500px;
                                height: 70vh;
                              }
                              
                              .control-panel {
                                flex: 1;
                                background: #f1f5f9;
                                padding: 20px;
                                border-radius: 12px;
                                display: flex;
                                flex-direction: column;
                                gap: 16px;
                                max-width: 350px;
                                overflow-y: auto;
                              }
                              
                              .display-area {
                                flex: 2;
                                background: #0f172a;
                                color: #fff;
                                padding: 20px;
                                border-radius: 12px;
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                justify-content: center;
                                position: relative;
                                overflow: hidden;
                              }
                              
                              /* Common UI Elements */
                              h1, h2, h3, h4 { color: #1e293b; margin-bottom: 8px; }
                              label { font-weight: 500; color: #475569; font-size: 0.9rem; }
                              
                              button { 
                                background: #6366f1; 
                                color: white; 
                                border: none; 
                                padding: 12px 20px; 
                                border-radius: 8px; 
                                cursor: pointer; 
                                font-family: inherit;
                                font-weight: 600;
                                transition: all 0.2s ease;
                              }
                              button:hover { background: #4f46e5; transform: translateY(-1px); }
                              button:active { transform: translateY(0); }
                              
                              input, select, textarea { 
                                padding: 10px; 
                                border: 1px solid #cbd5e1; 
                                border-radius: 6px; 
                                font-family: inherit;
                                font-size: 0.95rem;
                                width: 100%;
                                background: #fff;
                              }
                              input:focus, select:focus, textarea:focus {
                                outline: none;
                                border-color: #6366f1;
                                box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
                              }
                              
                              ${experiment.simulation.css || ''}
                            </style>
                          </head>
                          <body>
                            ${experiment.simulation.html}
                            <script>
                              // Helper to make element selection easier
                              const $ = selector => document.querySelector(selector);
                              const $$ = selector => document.querySelectorAll(selector);
                              
                              window.onerror = function(message, source, lineno, colno, error) {
                                console.error("Simulation JS Error:", error || message);
                                const errorDiv = document.createElement('div');
                                errorDiv.style.color = '#b91c1c';
                                errorDiv.style.padding = '12px 16px';
                                errorDiv.style.background = '#fef2f2';
                                errorDiv.style.border = '1px solid #fee2e2';
                                errorDiv.style.borderRadius = '8px';
                                errorDiv.style.margin = '16px';
                                errorDiv.style.fontSize = '0.9rem';
                                errorDiv.textContent = "Runtime Error: " + message;
                                document.body.appendChild(errorDiv);
                                return true;
                              };
                            </script>
                            <script>
                              ${experiment.simulation.js || ''}
                            </script>
                          </body>
                        </html>
                      `}
                      style={{ width: '100%', height: '80vh', border: 'none', borderRadius: '12px', backgroundColor: '#fff', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}
                    />
                  )}
                </div>
              ) : (
                <div className="simulation-card">
                  <div className="sim-placeholder">
                    <div className="sim-icon">⚙️</div>
                    <h4>Virtual Lab Environment Ready</h4>
                    <p>{renderSafeString(experiment.simulation?.description) || 'Interact with the module as specified in the procedure.'}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'post-test' && (
            <div className="tab-pane fade-in">
              <TestSection testArray={experiment.postTest} title="Post-Test Assessment" />
            </div>
          )}

          {activeTab === 'references' && (
            <div className="tab-pane fade-in">
              <h3>References</h3>
              <ul className="reference-list">
                {ensureArray(experiment.references).map((ref, idx) => (
                  <li key={idx}>📖 {renderSafeString(ref)}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default LabWorkspace;
