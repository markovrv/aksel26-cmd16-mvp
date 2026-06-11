import { useState } from "react";
import { useGameState } from "../../context/GameStateContext.jsx";

export default function RegistrationModal({ onClose, onComplete }) {
  const { state, dispatch } = useGameState();
  const [name, setName] = useState(state.profile?.name || "");
  const [email, setEmail] = useState(state.profile?.email || "");
  const [category, setCategory] = useState(state.profile?.category || "Школьник");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    console.log("[Marshrutka] Registration:", { name: name.trim(), email: email.trim(), category });
    dispatch({
      type: "SET_PROFILE",
      payload: { name: name.trim(), email: email.trim(), category }
    });
    onComplete();
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
        <p className="modal-copy">Для демо данные сохраняются только в этом браузере и никуда не отправляются.</p>
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
              />
            </div>
            <div className="field">
              <label>Категория</label>
              <select value={category} onChange={e => setCategory(e.target.value)}>
                <option value="Школьник">Школьник</option>
                <option value="Студент колледжа">Студент колледжа</option>
                <option value="Студент вуза">Студент вуза</option>
              </select>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="button button-ghost" onClick={onClose}>Отмена</button>
            <button type="submit" className="button button-primary">Продолжить →</button>
          </div>
        </form>
      </div>
    </div>
  );
}