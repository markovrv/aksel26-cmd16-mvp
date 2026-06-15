import { useState, useEffect } from "react";
import { useGameState } from "../../context/GameStateContext.jsx";
import api from "../../services/api.js";
import hardcodedQuestions from "../../data/questions.js";

export default function TestModal({ onClose, onComplete }) {
  const { state, dispatch } = useGameState();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [questions, setQuestions] = useState(null);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [skipTest, setSkipTest] = useState(false);

  // Load questions from API on mount and check if already completed
  useEffect(() => {
    let cancelled = false;
    setLoadingQuestions(true);

    // Check if user already has a track on server
    const checkExistingTrack = async () => {
      try {
        const profileData = await api.profile.get();
        if (!cancelled && profileData?.progress?.track) {
          const p = profileData.progress;
          const answers = p.answers_json
            ? (typeof p.answers_json === "string" ? JSON.parse(p.answers_json) : p.answers_json)
            : [];
          dispatch({
            type: "SET_TRACK",
            payload: { track: p.track, answers }
          });
          if (p.score) dispatch({ type: "ADD_SCORE", payload: p.score });
          setSkipTest(true);
          setLoadingQuestions(false);
          return;
        }
      } catch (err) {
        // If profile fetch fails, continue loading questions
        console.warn("[Marshrutka] Could not check existing track:", err);
      }
      // No existing track found — load questions normally
      loadQuestions(cancelled);
    };

    const loadQuestions = (cancelled) => {
      api.questions.list()
        .then(data => {
          if (!cancelled) {
            if (Array.isArray(data) && data.length > 0) {
              setQuestions(data);
            } else {
              setQuestions(hardcodedQuestions);
            }
          }
        })
        .catch(err => {
          console.warn("[Marshrutka] Failed to load questions from API, using hardcoded:", err);
          if (!cancelled) setQuestions(hardcodedQuestions);
        })
        .finally(() => {
          if (!cancelled) setLoadingQuestions(false);
        });
    };

    checkExistingTrack();
    return () => { cancelled = true; };
  }, []);

  const currentQuestion = questions?.[step];

  const handleAnswer = async (answerIndex) => {
    if (!currentQuestion) return;
    const newAnswers = [...answers, answerIndex];
    setAnswers(newAnswers);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      // Finish test — all questions answered
      setSubmitting(true);

      // Calculate track from the answer data
      let total = 0;
      for (let i = 0; i < newAnswers.length; i++) {
        const q = questions[i];
        const a = q.answers[newAnswers[i]];
        if (a) total += a.score;
      }
      const track = total >= 1 ? "business" : "career";
      const answerScores = newAnswers;

      console.log("[Marshrutka] Test finished:", { total, track, answerScores });

      // Submit via API
      try {
        await api.questions.submit(newAnswers);
        console.log("[Marshrutka] Answers submitted to server:", track);
      } catch (err) {
        console.warn("[Marshrutka] Failed to submit answers to server:", err);
      }

      // Dispatch to local state
      dispatch({
        type: "SET_TRACK",
        payload: { track, answers: answerScores }
      });
      dispatch({ type: "ADD_SCORE", payload: 40 });

      setSubmitting(false);
      onComplete();
    }
  };

  // If user already completed the test, skip it
  if (skipTest) {
    onComplete();
    return null;
  }

  if (loadingQuestions) {
    return (
      <div className="modal-backdrop open">
        <div className="modal">
          <div className="modal-head">
            <div>
              <small>AI-ДИАГНОСТИКА</small>
              <h2>Загрузка...</h2>
            </div>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          <p style={{ textAlign: "center", padding: "2rem", color: "#7b8497" }}>Загружаем вопросы диагностики...</p>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="modal-backdrop open">
        <div className="modal">
          <div className="modal-head">
            <div>
              <small>AI-ДИАГНОСТИКА</small>
              <h2>Ошибка</h2>
            </div>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          <p style={{ textAlign: "center", padding: "2rem", color: "#7b8497" }}>Не удалось загрузить вопросы. Попробуйте позже.</p>
          <div className="modal-actions">
            <button className="button button-ghost" onClick={onClose}>Закрыть</button>
          </div>
        </div>
      </div>
    );
  }

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
        {error && <div className="form-error">{error}</div>}
        <div className="question-progress">
          <b style={{ width: `${((step + 1) / questions.length) * 100}%` }}></b>
        </div>
        <span className="question-number">
          ВОПРОС {String(step + 1).padStart(2, "0")} / {String(questions.length).padStart(2, "0")}
        </span>
        <h3 className="question-title">{currentQuestion.text}</h3>
        <div className="answer-list">
          {currentQuestion.answers.map((answer, idx) => (
            <button key={idx} className="answer" onClick={() => handleAnswer(idx)} disabled={submitting}>
              <span className="answer-code">{String.fromCharCode(65 + idx)}</span>
              <span>{answer.text}</span>
            </button>
          ))}
        </div>
        {submitting && <p style={{ textAlign: "center", marginTop: 16, color: "#7b8497" }}>Отправка результатов...</p>}
      </div>
    </div>
  );
}