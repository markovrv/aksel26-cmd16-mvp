import { useState } from "react";
import { useGameState } from "../../context/GameStateContext.jsx";
import api from "../../services/api.js";
import Avatar3D from "../game/Avatar3D.jsx";

const SKINS = ["#f6d0b1", "#f0b38f", "#c9825b", "#79462f"];
const HAIRS = ["#171717", "#37251c", "#8c5a2b", "#e2c477"];
const SUITS = ["#536dfe", "#ff6f61", "#5ce1b9", "#ffd629"];

export default function AvatarModal({ onClose, onComplete }) {
  const { state, dispatch } = useGameState();
  const [skin, setSkin] = useState(state.avatar?.skin || "#f0b38f");
  const [hair, setHair] = useState(state.avatar?.hair || "#37251c");
  const [suit, setSuit] = useState(state.avatar?.suit || "#536dfe");
  const [loading, setLoading] = useState(false);

  const avatarStyle = { "--skin": skin, "--suit": suit, "--hair": hair };

  const randomize = () => {
    setSkin(SKINS[Math.floor(Math.random() * SKINS.length)]);
    setHair(HAIRS[Math.floor(Math.random() * HAIRS.length)]);
    setSuit(SUITS[Math.floor(Math.random() * SUITS.length)]);
  };

  const handleSave = async () => {
    console.log("[Marshrutka] Avatar saved:", { skin, hair, suit });
    setLoading(true);
    dispatch({ type: "SET_AVATAR", payload: { skin, hair, suit } });

    // Save avatar via API
    try {
      await api.profile.saveAvatar({ skin, hair, suit });
      console.log("[Marshrutka] Avatar saved to server");
    } catch (err) {
      console.warn("[Marshrutka] Failed to save avatar to server:", err);
    } finally {
      setLoading(false);
    }

    onComplete();
  };

  return (
    <div className="modal-backdrop open" onClick={e => e.target.classList.contains("modal-backdrop") && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <div>
            <small>ШАГ 03</small>
            <h2>Собери своего героя</h2>
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="avatar-builder">
          <div className="avatar-preview" style={{ minHeight: 230, minWidth: 175 }}>
            <Avatar3D avatar={{ skin, hair, suit }} scale={1} />
          </div>
          <div className="avatar-options">
            <div className="option-group">
              <label>Тон кожи</label>
              <div className="swatches">
                {SKINS.map(s => (
                  <button key={s} className={`swatch ${skin === s ? "active" : ""}`}
                    style={{ "--swatch": s }} onClick={() => setSkin(s)} aria-label={`Тон ${s}`} />
                ))}
              </div>
            </div>
            <div className="option-group">
              <label>Волосы</label>
              <div className="swatches">
                {HAIRS.map(h => (
                  <button key={h} className={`swatch ${hair === h ? "active" : ""}`}
                    style={{ "--swatch": h }} onClick={() => setHair(h)} aria-label={`Волосы ${h}`} />
                ))}
              </div>
            </div>
            <div className="option-group">
              <label>Экипировка</label>
              <div className="swatches">
                {SUITS.map(s => (
                  <button key={s} className={`swatch ${suit === s ? "active" : ""}`}
                    style={{ "--swatch": s }} onClick={() => setSuit(s)} aria-label={`Экипировка ${s}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="modal-actions">
          <button className="button button-ghost" onClick={randomize} disabled={loading}>Случайный образ</button>
          <button className="button button-primary" onClick={handleSave} disabled={loading}>
            {loading ? "Сохранение..." : "Сохранить героя →"}
          </button>
        </div>
      </div>
    </div>
  );
}