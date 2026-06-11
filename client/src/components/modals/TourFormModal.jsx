import { useState } from "react";
import { useGameState } from "../../context/GameStateContext.jsx";

export default function TourFormModal({ companyId, onClose, showToast }) {
  const { state, dispatch, companies } = useGameState();
  const company = companies.find(c => c.id === companyId);
  const [date, setDate] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date || !phone.trim()) return;
    console.log("[Marshrutka] Tour request:", { companyId, date, phone: phone.trim() });
    dispatch({
      type: "ADD_TOUR",
      payload: { companyId, date, phone: phone.trim() }
    });
    showToast("Заявка сохранена в профиле. +15 энергии.");
    onClose();
  };

  return (
    <div className="modal-backdrop open" onClick={e => e.target.classList.contains("modal-backdrop") && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <div>
            <small>ЗАЯВКА НА ЭКСКУРСИЮ</small>
            <h2>{company?.short || "Предприятие"}</h2>
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <p className="modal-copy">Это демонстрационная форма. Заявка сохранится локально и не будет отправлена.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field">
              <label>Дата</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
            <div className="field">
              <label>Телефон</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="+7 900 000-00-00" />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="button button-ghost" onClick={onClose}>Назад</button>
            <button type="submit" className="button button-primary">Сохранить заявку</button>
          </div>
        </form>
      </div>
    </div>
  );
}