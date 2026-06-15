import { useState } from "react";
import { useGameState } from "../../context/GameStateContext.jsx";
import api from "../../services/api.js";

export default function RegistrationModal({ onClose, onComplete, openLogin }) {
  const { state, dispatch } = useGameState();
  const [name, setName] = useState(state.profile?.name || "");
  const [email, setEmail] = useState(state.profile?.email || "");
  const [password, setPassword] = useState("");
  const [category, setCategory] = useState(state.profile?.category || "Школьник");
  const [school, setSchool] = useState("");
  const [classCode, setClassCode] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;
    if (password.length < 4) {
      setError("Пароль должен быть не менее 4 символов.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      // Register via API
      const result = await api.auth.register({
        name: name.trim(),
        email: email.trim(),
        category,
        password,
        school: school.trim() || undefined,
        classCode: classCode.trim() || undefined,
      });

      // Save tokens from server
      api.setTokens(result.accessToken, result.refreshToken);

      // Dispatch to local state
      dispatch({
        type: "SET_PROFILE",
        payload: {
          id: result.user?.id,
          name: name.trim(),
          email: email.trim(),
          category,
          school: school.trim() || "",
          classCode: classCode.trim() || "",
          createdAt: result.user?.createdAt || new Date().toISOString(),
        },
      });

      console.log("[Marshrutka] Registration via API:", result);
      onComplete();
    } catch (err) {
      console.error("[Marshrutka] Registration error:", err);
      setError(err.message || "Ошибка при регистрации. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenLogin = (e) => {
    e.preventDefault();
    onClose();
    if (openLogin) openLogin();
  };

  return (
    <div className="modal-backdrop open" onClick={(e) => e.target.classList.contains("modal-backdrop") && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <div>
            <small>ШАГ 01</small>
            <h2>Создай профиль</h2>
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <p className="modal-copy">Укажи данные для регистрации. Пароль потребуется для входа в следующий раз.</p>
        {error && <div className="form-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field full">
              <label>Имя и фамилия</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                required minLength={2}
                placeholder="Например, Анна Петрова"
                autoFocus
                disabled={loading}
              />
            </div>
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="student@example.ru"
                disabled={loading}
              />
            </div>
            <div className="field">
              <label>Пароль</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={4}
                placeholder="Придумайте пароль"
                disabled={loading}
              />
            </div>
            <div className="field full">
              <label>Категория</label>
              <select value={category} onChange={e => setCategory(e.target.value)} disabled={loading}>
                <option value="Школьник">Школьник</option>
                <option value="Студент колледжа">Студент колледжа</option>
                <option value="Студент вуза">Студент вуза</option>
              </select>
            </div>
            <div className="field">
              <label>Школа</label>
              <input
                value={school}
                onChange={e => setSchool(e.target.value)}
                placeholder="Например, Школа №1"
                disabled={loading}
              />
            </div>
            <div className="field">
              <label>Класс</label>
              <input
                value={classCode}
                onChange={e => setClassCode(e.target.value)}
                placeholder="Например, 7А"
                disabled={loading}
              />
            </div>
          </div>
          <div className="modal-actions" style={{ flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 10, width: "100%" }}>
              <button type="button" className="button button-ghost" onClick={onClose} disabled={loading} style={{ flex: 1 }}>Отмена</button>
              <button type="submit" className="button button-primary" disabled={loading} style={{ flex: 1 }}>
                {loading ? "Создание..." : "Создать →"}
              </button>
            </div>
            <button type="button" className="button button-ghost" onClick={handleOpenLogin} disabled={loading} style={{ width: "100%", fontSize: 13, textAlign: "center", justifyContent: "center" }}>
              У меня есть профиль
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}