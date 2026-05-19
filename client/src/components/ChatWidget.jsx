import React, { useState, useEffect } from 'react';

const ChatWidget = ({ experiment, topic }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  useEffect(() => {
    if (experiment) {
      setIsChatOpen(false);
      setChatMessages([{ role: 'assistant', text: `Hi! I'm your AI Virtual Lab Assistant for the ${experiment.title || topic} experiment. Do you need any help understanding the procedures or concepts?` }]);
      setCurrentMessage('');
      setIsChatLoading(false);
    }
  }, [experiment, topic]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!currentMessage.trim() || !experiment) return;
    
    const userText = currentMessage;
    const lowerMessage = userText.toLowerCase();



    setChatMessages(prev => [...prev, { role: 'user', text: userText }]);
    setCurrentMessage('');
    setIsChatLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: experiment.title || topic, question: userText })
      });
      const data = await res.json();
      if (data.success) {
        setChatMessages(prev => [...prev, { role: 'assistant', text: data.answer }]);
      } else {
        setChatMessages(prev => [...prev, { role: 'assistant', text: 'Error: ' + data.message }]);
      }
    } catch (err) {
       setChatMessages(prev => [...prev, { role: 'assistant', text: 'Network error connecting to AI.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="chat-widget-container">
      {!isChatOpen ? (
        <button 
          className="chat-fab"
          onClick={() => setIsChatOpen(true)}
        >
          💬
        </button>
      ) : (
        <div className="chat-window">
          <div className="chat-header">
            <h3>Lab Assistant</h3>
            <button onClick={() => setIsChatOpen(false)}>✖</button>
          </div>
          
          <div className="chat-messages">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`message-bubble ${msg.role}`}>
                {msg.text}
              </div>
            ))}
            {isChatLoading && (
              <div className="message-bubble assistant typing">
                <span className="dot"></span><span className="dot"></span><span className="dot"></span>
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="chat-input-area">
            <input 
              type="text" 
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder="Ask a question..." 
            />
            <button type="submit" disabled={!currentMessage.trim() || isChatLoading}>
              ➤
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
