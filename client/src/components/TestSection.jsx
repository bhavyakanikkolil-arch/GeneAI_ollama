import React, { useState } from 'react';

const TestSection = ({ testArray, title }) => {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  if (!testArray || testArray.length === 0) return <p>No questions available.</p>;

  const handleSelect = (qIdx, optIdx) => {
    if (!submitted) {
      setSelectedAnswers({ ...selectedAnswers, [qIdx]: optIdx });
    }
  };

  const score = Object.keys(selectedAnswers).filter(
    (qIdx) => selectedAnswers[qIdx] === testArray[qIdx].correctAnswerIndex
  ).length;

  return (
    <div className="test-section">
      <h3>{title}</h3>
      {testArray.map((q, qIdx) => (
        <div key={qIdx} className="question-card">
          <p className="question-text">{qIdx + 1}. {q.question}</p>
          <div className="options-list">
            {q.options.map((opt, optIdx) => {
              const isSelected = selectedAnswers[qIdx] === optIdx;
              const isCorrect = optIdx === q.correctAnswerIndex;
              let optClass = "option-btn";
              if (isSelected) optClass += " selected";
              if (submitted) {
                if (isCorrect) optClass += " correct";
                else if (isSelected && !isCorrect) optClass += " incorrect";
              }
              
              return (
                <button 
                  key={optIdx} 
                  className={optClass}
                  onClick={() => handleSelect(qIdx, optIdx)}
                  disabled={submitted}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {submitted && (
            <div className="explanation-box">
              <strong>Explanation:</strong> {q.explanation}
            </div>
          )}
        </div>
      ))}
      {!submitted ? (
        <button 
          className="submit-test-btn" 
          onClick={() => setSubmitted(true)}
        >
          Submit Answers
        </button>
      ) : (
        <div className="score-box">
          Your Score: {score} / {testArray.length}
          {score === testArray.length && <span className="perfect-score"> 🎉 Perfect!</span>}
        </div>
      )}
    </div>
  );
};

export default TestSection;
