import { useState } from "react";
import { useGameState } from "../../context/GameStateContext.jsx";
import api from "../../services/api.js";

export default function LoginModal({ onClose, onComplete }) {
  const { state, dispatch } = useGameState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const DEMO_EMAIL = "admin@marshrutka.ru";
  const DEMO_PASSWORD = "admin123";

  async function syncFullProfile() {
    // Fetch full profile + progress data from server
    const profileData = await api.profile.get();
    let progressData = { stations: [], taskResults: [], answers: [], pieceAnswers: [], gameHistory: [], tours: [] };
    try {
      const pd = await api.profile.getProgress();
      progressData = pd;
    } catch { /* progress may not exist for new users */ }

    if (profileData?.user) {
      const user = profileData.user;
      const progress = profileData.progress || {};
      const avatar = profileData.avatar || {};
      const achievements = profileData.achievements || [];

      // 1. Profile
      dispatch({ type: "SET_PROFILE", payload: { id: user.id, name: user.name, email: user.email, category: user.category || "Школьник", createdAt: user.created_at || new Date().toISOString() } });

      // 2. Role
      if (user.role === "admin") dispatch({ type: "SET_ROLE", payload: "admin" });
      else if (user.role === "teacher") dispatch({ type: "SET_ROLE", payload: "teacher" });

      // 3. Track + diagnostic answers
      if (progress.track) {
        const answers = progress.answers_json ? (typeof progress.answers_json === "string" ? JSON.parse(progress.answers_json) : progress.answers_json) : [];
        dispatch({ type: "SET_TRACK", payload: { track: progress.track, answers } });
      } else if (progressData.answers && progressData.answers.length >= 7) {
        // Fallback: determine track from saved answers
        let initiativeScore = 0, analyticsScore = 0;
        for (const a of progressData.answers) {
          if (a.skill === "initiative") initiativeScore += a.score;
          else if (a.skill === "analytics") analyticsScore += a.score;
        }
        const track = initiativeScore > analyticsScore ? "business" : "career";
        const answerScores = progressData.answers.map(a => a.score);
        dispatch({ type: "SET_TRACK", payload: { track, answers: answerScores } });
      }

      // 4. Avatar
      if (avatar.skin || avatar.hair || avatar.suit) {
        dispatch({ type: "RESTORE_AVATAR", payload: { skin: avatar.skin || "#f0b38f", hair: avatar.hair || "#37251c", suit: avatar.suit || "#536dfe" } });
      }

      // 5. Score
      if (progress.score) dispatch({ type: "SET_SCORE", payload: progress.score });

      // 6. Station progress (completed pieces per company)
      if (progressData.stations) {
        for (const st of progressData.stations) {
          // Server returns pieces as JSON string in the 'pieces' column
          const piecesStr = st.pieces || st.pieces_json || "[]";
          let pieces;
          try { pieces = typeof piecesStr === "string" ? JSON.parse(piecesStr) : piecesStr; }
          catch { pieces = []; }
          const pieceAnswers = progressData.pieceAnswers?.filter(pa => pa.company_id === st.company_id) || [];
          for (const p of pieces) {
            const pieceAns = pieceAnswers.find(pa => pa.piece_index === p);
            dispatch({ type: "RESTORE_PIECE", payload: { companyId: st.company_id, pieceIndex: p, choice: st.choice || pieceAns?.choice || null } });
          }
        }
      }

      // 7. Task results
      if (progressData.taskResults) {
        for (const tr of progressData.taskResults) {
          dispatch({ type: "RESTORE_TASK_RESULT", payload: { companyId: tr.company_id, taskId: tr.task_id, score: tr.score, time: tr.time_ms, correct: !!tr.is_correct } });
        }
      }

      // 8. Game history
      if (progressData.gameHistory) {
        for (const gh of progressData.gameHistory) {
          dispatch({ type: "SAVE_GAME_HISTORY", payload: { profession: gh.profession } });
        }
      }

      // 9. Tours
      if (progressData.tours) {
        for (const t of progressData.tours) {
          dispatch({ type: "ADD_TOUR", payload: { companyId: t.company_id, date: t.tour_date, phone: t.phone, status: "pending" } });
        }
      }
    }
  }

  const handleDemoLogin = async () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    await new Promise(r => setTimeout(r, 200));
    setError(null);
    setLoading(true);
    try {
      const result = await api.auth.login(DEMO_EMAIL, DEMO_PASSWORD);
      api.setTokens(result.accessToken, result.refreshToken);
      await syncFullProfile();
      console.log("[Marshrutka] Demo login complete");
      onComplete();
    } catch (err) {
      setError(err.message || "Ошибка демо-входа.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const result = await api.auth.login(email.trim(), password.trim());
      api.setTokens(result.accessToken, result.refreshToken);
      await syncFullProfile();
      console.log("[Marshrutka] Login complete");
      onComplete();
    } catch (err) {
      setError(err.message || "Ошибка при входе. Проверьте email и пароль.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop open" onClick={(e) => e.target.classList.contains("modal-backdrop") && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <div>
            <small>ВХОД В ПРОФИЛЬ</small>
            <h2>Добро пожаловать!</h2>
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <p className="modal-copy">Войдите, чтобы восстановить свой профиль и продолжить маршрут.</p>
        {error && <div className="form-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field full">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="student@example.ru"
                autoFocus
                disabled={loading}
              />
            </div>
            <div className="field full">
              <label>Пароль</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={4}
                placeholder="Ваш пароль"
                disabled={loading}
              />
            </div>
          </div>
          <div className="modal-actions" style={{ flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 10, width: "100%" }}>
              <button type="button" className="button button-ghost" onClick={onClose} disabled={loading} style={{ flex: 1 }}>Назад</button>
              <button type="submit" className="button button-primary" disabled={loading} style={{ flex: 1 }}>
                {loading ? "Вход..." : "Войти →"}
              </button>
            </div>
            <button type="button" className="button button-ghost" onClick={handleDemoLogin} disabled={loading} style={{ width: "100%", fontSize: 13, textAlign: "center", justifyContent: "center", background: "rgba(255, 214, 41, 0.1)", border: "1px solid rgba(255, 214, 41, 0.3)" }}>
              🚀 Демо-вход (admin@marshrutka.ru)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}