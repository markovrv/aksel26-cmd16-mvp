import { useState } from "react";
import { useGameState } from "../../context/GameStateContext.jsx";
import questions from "../../data/questions.js";

export default function TestModal({ onClose, onComplete }) {
  const { dispatch } = useGameState();
  const [step, setStep] = useState(0);             // 0..6 — вопрос, 7 — результат
  const [answers, setAnswers] = useState([]);

  const question = questions[step];

  const handleAnswer = (answerIndex) => {
    const answer = question.answers[answerIndex];
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      // Finish
      const total = newAnswers.reduce((sum, a) => sum + a.score, 0);
      const track = total >= 1 ? "business" : "career";
      console.log("[Marshrutka] Test finished:", { total, track, answers: newAnswers.map(a => a.score) });
      dispatch({
        type: "SET_TRACK",
        payload: { track, answers: newAnswers.map(a => a.score) }
      });
      dispatch({ type: "ADD_SCORE", payload: 40 });
      // Пропустить результат — сразу onComplete
      onComplete();
    }
  };

  return (
    <div className="modal-backdrop open">
      <div className="modal">
        <div className="modal-head">
          <div>
            <small>AI-ДИАГНОСТИКА</small>
            <h2>Найди свой трек</h2>
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="question-progress">
          <b style={{ width: `${((step + 1) / questions.length) * 100}%` }}></b>
        </div>
        <span className="question-number">
          ВОПРОС {String(step + 1).padStart(2, "0")} / {String(questions.length).padStart(2, "0")}
        </span>
        <h3 className="question-title">{question.text}</h3>
        <div className="answer-list">
          {question.answers.map((answer, idx) => (
            <button key={idx} className="answer" onClick={() => handleAnswer(idx)}>
              <span className="answer-code">{String.fromCharCode(65 + idx)}</span>
              <span>{answer.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}