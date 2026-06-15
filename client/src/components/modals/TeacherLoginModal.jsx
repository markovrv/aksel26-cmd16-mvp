import { useState } from "react";
import { useGameState } from "../../context/GameStateContext.jsx";
import api from "../../services/api.js";

export default function TeacherLoginModal({ onClose, onComplete }) {
  const { dispatch } = useGameState();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [school, setSchool] = useState("");
  const [classCode, setClassCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const DEMO_EMAIL = "admin@marshrutka.ru";
  const DEMO_PASSWORD = "admin123";

  const handleDemoLogin = async () => {
    setName("Администратор");
    setEmail(DEMO_EMAIL);
    setSchool("Демо-школа №1");
    setClassCode("7А-2026");
    await new Promise(r => setTimeout(r, 200));
    setLoading(true);
    setError(null);

    try {
      const result = await api.auth.login(DEMO_EMAIL, DEMO_PASSWORD);
      api.setTokens(result.accessToken, result.refreshToken);

      // Try to set teacher role — if user is admin, this gives teacher access
      dispatch({
        type: "SET_PROFILE",
        payload: {
          id: result.user?.id,
          name: "Администратор",
          email: DEMO_EMAIL,
          category: "Педагог",
          school: "Демо-школа №1",
          classCode: "7А-2026",
        }
      });
      dispatch({ type: "SET_ROLE", payload: "teacher" });
      console.log("[Marshrutka] Teacher demo login via API:", result);
      onComplete();
    } catch (err) {
      // If login fails, try registering as teacher
      try {
        const result = await api.auth.register({
          name: "Администратор",
          email: DEMO_EMAIL,
          password: DEMO_PASSWORD,
          category: "Педагог",
          school: "Демо-школа №1",
          classCode: "7А-2026",
          role: "teacher",
        });
        api.setTokens(result.accessToken, result.refreshToken);
        dispatch({
          type: "SET_PROFILE",
          payload: {
            id: result.user?.id,
            name: "Администратор",
            email: DEMO_EMAIL,
            category: "Педагог",
            school: "Демо-школа №1",
            classCode: "7А-2026",
          }
        });
        dispatch({ type: "SET_ROLE", payload: "teacher" });
        console.log("[Marshrutka] Teacher demo registered:", result);
        onComplete();
      } catch (regErr) {
        setError(regErr.message || "Ошибка демо-входа.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const password = email.split("@")[0] + "123";
      const result = await api.auth.register({
        name: name.trim(),
        email: email.trim(),
        password,
        category: "Педагог",
        school: school.trim(),
        classCode: classCode.trim(),
        role: "teacher",
      });
      api.setTokens(result.accessToken, result.refreshToken);

      dispatch({
        type: "SET_PROFILE",
        payload: {
          id: result.user?.id,
          name: name.trim(),
          email: email.trim(),
          category: "Педагог",
          school: school.trim(),
          classCode: classCode.trim(),
        }
      });
      dispatch({ type: "SET_ROLE", payload: "teacher" });
      console.log("[Marshrutka] Teacher registered via API:", result);
      onComplete();
    } catch (err) {
      setError(err.message || "Ошибка входа. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop open" onClick={(e) => e.target.classList.contains("modal-backdrop") && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <div>
            <small>ВХОД ДЛЯ ПЕДАГОГА</small>
            <h2>Кабинет наставника</h2>
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <p className="modal-copy">Данные сохраняются на сервере. Для повторного входа используйте email.</p>
        {error && <div className="form-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field full">
              <label>Имя и фамилия</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} placeholder="Например, Мария Ивановна" autoFocus disabled={loading} />
            </div>
            <div className="field">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="teacher@school.ru" disabled={loading} />
            </div>
            <div className="field">
              <label>Учебное заведение</label>
              <input value={school} onChange={(e) => setSchool(e.target.value)} placeholder="Например, Школа №42" disabled={loading} />
            </div>
            <div className="field full">
              <label>Код класса (для привязки учеников)</label>
              <input value={classCode} onChange={(e) => setClassCode(e.target.value)} placeholder="Например, 7А-2026" disabled={loading} />
            </div>
          </div>
          <div className="modal-actions" style={{ flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 10, width: "100%" }}>
              <button type="button" className="button button-ghost" onClick={onClose} disabled={loading} style={{ flex: 1 }}>Отмена</button>
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