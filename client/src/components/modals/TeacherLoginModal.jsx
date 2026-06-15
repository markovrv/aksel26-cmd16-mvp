import { useState } from "react";
import { useGameState } from "../../context/GameStateContext.jsx";

export default function TeacherLoginModal({ onClose, onComplete }) {
  const { dispatch } = useGameState();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [school, setSchool] = useState("");
  const [classCode, setClassCode] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    console.log("[Marshrutka] Teacher login:", { name: name.trim(), email: email.trim(), school: school.trim(), classCode: classCode.trim() });
    dispatch({
      type: "SET_PROFILE",
      payload: {
        name: name.trim(),
        email: email.trim(),
        category: "Педагог",
        school: school.trim(),
        classCode: classCode.trim(),
      }
    });
    // Устанавливаем роль teacher отдельно
    dispatch({ type: "SET_ROLE", payload: "teacher" });
    onComplete();
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
        <p className="modal-copy">В демо-режиме вход свободный. Данные сохраняются локально.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field full">
              <label>Имя и фамилия</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} placeholder="Например, Мария Ивановна" autoFocus />
            </div>
            <div className="field">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="teacher@school.ru" />
            </div>
            <div className="field">
              <label>Учебное заведение</label>
              <input value={school} onChange={(e) => setSchool(e.target.value)} placeholder="Например, Школа №42" />
            </div>
            <div className="field full">
              <label>Код класса (для привязки учеников)</label>
              <input value={classCode} onChange={(e) => setClassCode(e.target.value)} placeholder="Например, 7А-2026" />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="button button-ghost" onClick={onClose}>Отмена</button>
            <button type="submit" className="button button-primary">Войти →</button>
          </div>
        </form>
      </div>
    </div>
  );
}