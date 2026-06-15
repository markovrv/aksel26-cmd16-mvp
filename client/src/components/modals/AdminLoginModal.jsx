import { useState } from "react";
import { useGameState } from "../../context/GameStateContext.jsx";
import api from "../../services/api.js";

export default function AdminLoginModal({ onClose, onComplete }) {
  const { dispatch } = useGameState();
  const [email, setEmail] = useState("admin@marshrutka.ru");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const result = await api.auth.login(email.trim(), password.trim());
      api.setTokens(result.accessToken, result.refreshToken);

      // Fetch profile to get role
      const profileData = await api.profile.get();
      if (!profileData?.user || profileData.user.role !== "admin") {
        api.clearTokens();
        setError("Учётная запись не имеет прав администратора.");
        setLoading(false);
        return;
      }

      dispatch({ type: "SET_PROFILE", payload: {
        id: profileData.user.id,
        name: profileData.user.name,
        email: profileData.user.email,
        category: profileData.user.category || "Администратор",
        createdAt: profileData.user.created_at || new Date().toISOString(),
      }});
      dispatch({ type: "SET_ROLE", payload: "admin" });

      onComplete();
    } catch (err) {
      setError(err.message || "Ошибка входа.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop open" onClick={(e) => e.target.classList.contains("modal-backdrop") && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <div>
            <small>АДМИНИСТРИРОВАНИЕ</small>
            <h2>Вход администратора</h2>
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <p className="modal-copy">Войдите как администратор для управления системой.</p>
        {error && <div className="form-error">{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="form-grid">
            <div className="field full">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="admin@example.ru"
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
                placeholder="Пароль администратора"
                disabled={loading}
              />
            </div>
          </div>
          <div className="modal-actions" style={{ flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 10, width: "100%" }}>
              <button type="button" className="button button-ghost" onClick={onClose} disabled={loading} style={{ flex: 1 }}>Отмена</button>
              <button type="submit" className="button button-primary" disabled={loading} style={{ flex: 1 }}>
                {loading ? "Вход..." : "Войти"}
              </button>
            </div>
            <button type="button" className="button button-ghost" onClick={handleLogin} disabled={loading} style={{
              width: "100%", fontSize: 13, textAlign: "center", justifyContent: "center",
              background: "rgba(255, 214, 41, 0.1)", border: "1px solid rgba(255, 214, 41, 0.3)"
            }}>
              🚀 Демо-вход администратора
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}