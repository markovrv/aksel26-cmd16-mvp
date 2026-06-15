import { useState } from "react";
import { useGameState } from "../../context/GameStateContext.jsx";
import api from "../../services/api.js";

export default function TourFormModal({ companyId, onClose, showToast }) {
  const { state, dispatch, companies } = useGameState();
  const company = companies.find(c => c.id === companyId);
  const [date, setDate] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !phone.trim()) return;
    setLoading(true);
    console.log("[Marshrutka] Tour request:", { companyId, date, phone: phone.trim() });
    dispatch({
      type: "ADD_TOUR",
      payload: { companyId, date, phone: phone.trim() }
    });

    // Sync tour with server via profile update
    try {
      const tours = [...(state.tours || []), { companyId, date, phone: phone.trim(), status: "pending" }];
      await api.profile.update({ tours: JSON.stringify(tours) });
      console.log("[Marshrutka] Tour synced to server");
    } catch (err) {
      console.warn("[Marshrutka] Failed to sync tour:", err);
    } finally {
      setLoading(false);
    }

    showToast("Заявка сохранена. +15 энергии.");
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
        <p className="modal-copy">Заявка будет сохранена на сервере.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field">
              <label>Дата</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required disabled={loading} />
            </div>
            <div className="field">
              <label>Телефон</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="+7 900 000-00-00" disabled={loading} />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="button button-ghost" onClick={onClose} disabled={loading}>Назад</button>
            <button type="submit" className="button button-primary" disabled={loading}>
              {loading ? "Сохранение..." : "Сохранить заявку"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}