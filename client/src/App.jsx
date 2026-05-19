import { useState } from 'react';
import './index.css';
import LabGenerator from './components/LabGenerator';
import LabWorkspace from './components/LabWorkspace';
import ChatWidget from './components/ChatWidget';

function App() {
  // Generation State
  const [topic, setTopic] = useState('');
  const [experiment, setExperiment] = useState(null);

  // Lab UI State
  const [activeTab, setActiveTab] = useState('aim');


  return (
    <div className="app-container">
      <main className="main-content">
        {!experiment ? (
          <LabGenerator
            topic={topic}
            setTopic={setTopic}
            setExperiment={setExperiment}
            setActiveTab={setActiveTab}
          />
        ) : (
          <LabWorkspace
            experiment={experiment}
            setExperiment={setExperiment}
            setTopic={setTopic}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        )}

        {experiment && (
          <ChatWidget
            experiment={experiment}
            topic={topic}
          />
        )}
      </main>
    </div>
  );
}

export default App;
