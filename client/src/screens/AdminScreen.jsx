import { useState, useEffect, useCallback } from "react";
import api from "../services/api.js";

// ===================== Admin API methods =====================
const adminApi = {
  // Users
  getUsers(params = {}) {
    return api._request("/admin/users", { params, auth: true });
  },
  getUser(id) {
    return api._request(`/admin/users/${id}`, { auth: true });
  },
  updateUser(id, data) {
    return api._request(`/admin/users/${id}`, { method: "PUT", body: data, auth: true });
  },
  deleteUser(id) {
    return api._request(`/admin/users/${id}`, { method: "DELETE", auth: true });
  },
  exportUser(id) {
    return api._request(`/admin/users/${id}/export`, { auth: true });
  },

  // Companies
  getCompanies() {
    return api._request("/admin/companies", { auth: true });
  },
  createCompany(data) {
    return api._request("/admin/companies", { method: "POST", body: data, auth: true });
  },
  updateCompany(id, data) {
    return api._request(`/admin/companies/${id}`, { method: "PUT", body: data, auth: true });
  },
  deleteCompany(id) {
    return api._request(`/admin/companies/${id}`, { method: "DELETE", auth: true });
  },

  // Station Pieces
  getStationPieces(params = {}) {
    return api._request("/admin/station-pieces", { params, auth: true });
  },
  getStationPiece(id) {
    return api._request(`/admin/station-pieces/${id}`, { auth: true });
  },
  createStationPiece(data) {
    return api._request("/admin/station-pieces", { method: "POST", body: data, auth: true });
  },
  updateStationPiece(id, data) {
    return api._request(`/admin/station-pieces/${id}`, { method: "PUT", body: data, auth: true });
  },
  deleteStationPiece(id) {
    return api._request(`/admin/station-pieces/${id}`, { method: "DELETE", auth: true });
  },
  seedStationPieces(cid) {
    return api._request(`/admin/station-pieces/${cid}/pieces/seed`, { method: "POST", auth: true });
  },

  // Questions
  getQuestions() {
    return api._request("/admin/questions", { auth: true });
  },
  createQuestion(data) {
    return api._request("/admin/questions", { method: "POST", body: data, auth: true });
  },
  updateQuestion(id, data) {
    return api._request(`/admin/questions/${id}`, { method: "PUT", body: data, auth: true });
  },
  deleteQuestion(id) {
    return api._request(`/admin/questions/${id}`, { method: "DELETE", auth: true });
  },
  createAnswer(qid, data) {
    return api._request(`/admin/questions/${qid}/answers`, { method: "POST", body: data, auth: true });
  },
  updateAnswer(qid, aid, data) {
    return api._request(`/admin/questions/${qid}/answers/${aid}`, { method: "PUT", body: data, auth: true });
  },
  deleteAnswer(qid, aid) {
    return api._request(`/admin/questions/${qid}/answers/${aid}`, { method: "DELETE", auth: true });
  },

  // Achievements
  getAchievements() {
    return api._request("/admin/achievements", { auth: true });
  },
  createAchievement(data) {
    return api._request("/admin/achievements", { method: "POST", body: data, auth: true });
  },
  updateAchievement(id, data) {
    return api._request(`/admin/achievements/${id}`, { method: "PUT", body: data, auth: true });
  },
  deleteAchievement(id) {
    return api._request(`/admin/achievements/${id}`, { method: "DELETE", auth: true });
  },

  // Tasks
  getTasks() {
    return api._request("/admin/tasks", { auth: true });
  },
  createTask(data) {
    return api._request("/admin/tasks", { method: "POST", body: data, auth: true });
  },
  updateTask(id, data) {
    return api._request(`/admin/tasks/${id}`, { method: "PUT", body: data, auth: true });
  },
  deleteTask(id) {
    return api._request(`/admin/tasks/${id}`, { method: "DELETE", auth: true });
  },

  // Final Results
  getFinalResults() {
    return api._request("/admin/final-results", { auth: true });
  },
  createFinalResult(data) {
    return api._request("/admin/final-results", { method: "POST", body: data, auth: true });
  },
  updateFinalResult(id, data) {
    return api._request(`/admin/final-results/${id}`, { method: "PUT", body: data, auth: true });
  },
  deleteFinalResult(id) {
    return api._request(`/admin/final-results/${id}`, { method: "DELETE", auth: true });
  },

  // Scoring Config
  getScoringConfig() {
    return api._request("/admin/scoring-config", { auth: true });
  },
  updateScoringConfig(data) {
    return api._request("/admin/scoring-config", { method: "PUT", body: data, auth: true });
  },

  // Level Thresholds
  getLevelThresholds() {
    return api._request("/admin/level-thresholds", { auth: true });
  },
  updateLevelThreshold(id, data) {
    return api._request(`/admin/level-thresholds/${id}`, { method: "PUT", body: data, auth: true });
  },

  // Game Config
  getGameWorkers() {
    return api._request("/admin/game-workers", { auth: true });
  },
  createGameWorker(data) {
    return api._request("/admin/game-workers", { method: "POST", body: data, auth: true });
  },
  updateGameWorker(id, data) {
    return api._request(`/admin/game-workers/${id}`, { method: "PUT", body: data, auth: true });
  },
  deleteGameWorker(id) {
    return api._request(`/admin/game-workers/${id}`, { method: "DELETE", auth: true });
  },
  getGameDocRows() {
    return api._request("/admin/game-doc-rows", { auth: true });
  },
  createGameDocRow(data) {
    return api._request("/admin/game-doc-rows", { method: "POST", body: data, auth: true });
  },
  updateGameDocRow(id, data) {
    return api._request(`/admin/game-doc-rows/${id}`, { method: "PUT", body: data, auth: true });
  },
  deleteGameDocRow(id) {
    return api._request(`/admin/game-doc-rows/${id}`, { method: "DELETE", auth: true });
  },

  // Exports
  getExports() {
    return api._request("/admin/exports", { auth: true });
  },
};

// ===================== UI Components =====================

function LoadingSpinner() {
  return <div style={{ textAlign: "center", padding: "2rem", color: "var(--muted)" }}>Загрузка...</div>;
}

function ErrorMessage({ message }) {
  return <div style={{ textAlign: "center", padding: "2rem", color: "#ff6b6b" }}>{message || "Ошибка загрузки"}</div>;
}

function EmptyState({ text }) {
  return <div style={{ textAlign: "center", padding: "2rem", color: "var(--muted)" }}>{text || "Нет данных"}</div>;
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.5)"
    }}>
      <div style={{ background: "var(--panel)", borderRadius: 14, padding: 24, maxWidth: 400, width: "90%" }}>
        <p style={{ marginBottom: 16 }}>{message}</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button className="button button-ghost compact" onClick={onCancel}>Отмена</button>
          <button className="button button-primary compact" style={{ background: "#ff6b6b" }} onClick={onConfirm}>Подтвердить</button>
        </div>
      </div>
    </div>
  );
}

// ===================== Generic Editor Modal =====================
function EditorModal({ title, fields, data, onSave, onClose, companiesList }) {
  const [form, setForm] = useState(() => {
    const initial = { ...(data || {}) };
    // Normalize array fields that arrive as JSON strings
    if (fields) {
      for (const field of fields) {
        if (field.type === "array" && typeof initial[field.key] === "string") {
          try {
            const parsed = JSON.parse(initial[field.key]);
            initial[field.key] = Array.isArray(parsed) ? parsed : [String(parsed)];
          } catch {
            initial[field.key] = [initial[field.key]];
          }
        }
      }
    }
    return initial;
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleArrayChange = (key, index, value) => {
    const current = Array.isArray(form[key]) ? form[key] : [];
    const arr = [...current];
    arr[index] = value;
    setForm(prev => ({ ...prev, [key]: arr }));
  };

  const addArrayItem = (key) => {
    const current = Array.isArray(form[key]) ? form[key] : [];
    setForm(prev => ({ ...prev, [key]: [...current, ""] }));
  };

  const removeArrayItem = (key, index) => {
    const current = Array.isArray(form[key]) ? form[key] : [];
    const arr = [...current];
    arr.splice(index, 1);
    setForm(prev => ({ ...prev, [key]: arr }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.6)", overflowY: "auto", padding: "20px 0"
    }}>
      <div style={{ background: "var(--panel)", borderRadius: 14, padding: 24, maxWidth: 600, width: "90%", maxHeight: "90vh", overflowY: "auto" }}>
        <h3 style={{ fontFamily: "Montserrat, sans-serif", marginBottom: 16 }}>{title}</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {fields.map(field => {
            if (field.type === "select" && field.options) {
              return (
                <div key={field.key}>
                  <label style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 4 }}>{field.label}</label>
                  <select
                    value={form[field.key] ?? ""}
                    onChange={e => handleChange(field.key, e.target.value)}
                    style={{
                      width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--line)",
                      background: "var(--panel-2)", color: "var(--text)", fontSize: 14
                    }}
                  >
                    <option value="">—</option>
                    {field.options.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              );
            }
            if (field.type === "number") {
              return (
                <div key={field.key}>
                  <label style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 4 }}>{field.label}</label>
                  <input
                    type="number"
                    value={form[field.key] ?? ""}
                    onChange={e => handleChange(field.key, e.target.value === "" ? "" : Number(e.target.value))}
                    style={{
                      width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--line)",
                      background: "var(--panel-2)", color: "var(--text)", fontSize: 14
                    }}
                  />
                </div>
              );
            }
            if (field.type === "textarea") {
              return (
                <div key={field.key}>
                  <label style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 4 }}>{field.label}</label>
                  <textarea
                    value={form[field.key] ?? ""}
                    onChange={e => handleChange(field.key, e.target.value)}
                    rows={4}
                    style={{
                      width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--line)",
                      background: "var(--panel-2)", color: "var(--text)", fontSize: 14, resize: "vertical", fontFamily: "inherit"
                    }}
                  />
                </div>
              );
            }
            if (field.type === "json") {
              return (
                <div key={field.key}>
                  <label style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 4 }}>{field.label} (JSON)</label>
                  <textarea
                    value={form[field.key] ? JSON.stringify(form[field.key], null, 2) : "[]"}
                    onChange={e => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        handleChange(field.key, parsed);
                      } catch { /* invalid JSON */ }
                    }}
                    rows={6}
                    style={{
                      width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--line)",
                      background: "var(--panel-2)", color: "var(--text)", fontSize: 13, resize: "vertical", fontFamily: "monospace"
                    }}
                  />
                </div>
              );
            }
            if (field.type === "array") {
              const arr = Array.isArray(form[field.key]) ? form[field.key] : [];
              return (
                <div key={field.key}>
                  <label style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 4 }}>{field.label}</label>
                  {arr.map((item, idx) => (
                    <div key={idx} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                      <input
                        value={item}
                        onChange={e => handleArrayChange(field.key, idx, e.target.value)}
                        style={{
                          flex: 1, padding: "6px 10px", borderRadius: 6, border: "1px solid var(--line)",
                          background: "var(--panel-2)", color: "var(--text)", fontSize: 13
                        }}
                      />
                      <button className="button button-ghost compact" onClick={() => removeArrayItem(field.key, idx)} style={{ color: "#ff6b6b", padding: "4px 8px" }}>✕</button>
                    </div>
                  ))}
                  <button className="button button-ghost compact" onClick={() => addArrayItem(field.key)} style={{ fontSize: 12 }}>+ Добавить</button>
                </div>
              );
            }
            // Default: text input
            return (
              <div key={field.key}>
                <label style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 4 }}>{field.label}</label>
                <input
                  value={form[field.key] ?? ""}
                  onChange={e => handleChange(field.key, e.target.value)}
                  style={{
                    width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--line)",
                    background: "var(--panel-2)", color: "var(--text)", fontSize: 14
                  }}
                />
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
          <button className="button button-ghost compact" onClick={onClose}>Отмена</button>
          <button className="button button-primary compact" onClick={handleSave} disabled={saving}>
            {saving ? "Сохранение..." : "Сохранить"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ===================== Tab: Users =====================
function UsersTab({ showToast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [editor, setEditor] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [detail, setDetail] = useState(null);

  const load = useCallback(async (p = page, s = search) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: p, limit: 20 };
      if (s.trim()) params.search = s.trim();
      const data = await adminApi.getUsers(params);
      setUsers(data.users || []);
      setTotal(data.total || 0);
      setPage(data.page || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteUser(id);
      showToast("Пользователь удалён");
      load();
    } catch (err) {
      alert(err.message);
    }
    setConfirmDelete(null);
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
        <input
          placeholder="Поиск по имени или email"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--line)",
            background: "var(--panel-2)", color: "var(--text)", fontSize: 14
          }}
        />
        <button className="button button-primary compact" onClick={() => load(1, search)} disabled={loading}>Поиск</button>
      </div>

      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} />}

      {!loading && !error && users.length === 0 && <EmptyState text="Пользователи не найдены" />}

      {!loading && !error && users.length > 0 && (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {users.map(user => (
              <div key={user.id} style={{
                background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 10, padding: 12
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <strong>{user.name || "—"}</strong>
                    <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 10 }}>{user.email}</span>
                    <span style={{
                      fontSize: 11, marginLeft: 10, padding: "2px 8px", borderRadius: 10,
                      background: user.role === "admin" ? "rgba(255,214,41,0.2)" : "rgba(92,225,185,0.2)",
                      color: user.role === "admin" ? "var(--yellow)" : "var(--mint)"
                    }}>
                      {user.role === "admin" ? "Админ" : user.role || "student"}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--muted)", marginLeft: 8 }}>
                      {user.school || ""} {user.class_code ? `· ${user.class_code}` : ""}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="button button-ghost compact" onClick={() => setDetail(user)}>👁</button>
                    <button className="button button-ghost compact" onClick={() => setEditor(user)}>✏️</button>
                    <button className="button button-ghost compact" onClick={() => setConfirmDelete(user.id)} style={{ color: "#ff6b6b" }}>🗑</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "center", alignItems: "center", marginTop: 16 }}>
            <button className="button button-ghost compact" disabled={page <= 1} onClick={() => load(page - 1, search)}>← Назад</button>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>{page} / {totalPages} ({total} всего)</span>
            <button className="button button-ghost compact" disabled={page >= totalPages} onClick={() => load(page + 1, search)}>Вперёд →</button>
          </div>
        </>
      )}

      {/* Detail modal */}
      {detail && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.6)", overflowY: "auto", padding: "20px 0"
        }}>
          <div style={{ background: "var(--panel)", borderRadius: 14, padding: 24, maxWidth: 500, width: "90%" }}>
            <h3 style={{ fontFamily: "Montserrat, sans-serif", marginBottom: 12 }}>{detail.name || "Пользователь"}</h3>
            <div style={{ fontSize: 13, color: "var(--text)", display: "flex", flexDirection: "column", gap: 6 }}>
              <div><strong>ID:</strong> {detail.id}</div>
              <div><strong>Email:</strong> {detail.email}</div>
              <div><strong>Роль:</strong> {detail.role}</div>
              <div><strong>Категория:</strong> {detail.category || "—"}</div>
              <div><strong>Школа:</strong> {detail.school || "—"}</div>
              <div><strong>Регион:</strong> {detail.region || "—"}</div>
              <div><strong>Создан:</strong> {detail.created_at}</div>
              <div><strong>Обновлён:</strong> {detail.updated_at}</div>
            </div>
            <button className="button button-primary compact" style={{ marginTop: 16 }} onClick={() => setDetail(null)}>Закрыть</button>
          </div>
        </div>
      )}

      {/* Editor */}
      {editor && (
        <EditorModal
          title="Редактировать пользователя"
          data={editor}
          fields={[
            { key: "name", label: "Имя" },
            { key: "email", label: "Email" },
            { key: "category", label: "Категория" },
            { key: "school", label: "Школа" },
            { key: "region", label: "Регион" },
            { key: "role", label: "Роль", type: "select", options: [
              { value: "student", label: "Ученик" },
              { value: "admin", label: "Администратор" },
            ]},
          ]}
          onSave={async (form) => {
            await adminApi.updateUser(editor.id, form);
            showToast("Пользователь обновлён");
            load();
          }}
          onClose={() => setEditor(null)}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          message="Удалить этого пользователя? Это действие необратимо."
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

// ===================== Tab: Companies =====================
function CompaniesTab({ showToast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editor, setEditor] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getCompanies();
      setItems(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, []);

  const handleSave = async (form) => {
    if (editor && editor.id) {
      await adminApi.updateCompany(editor.id, form);
      showToast("Предприятие обновлено");
    } else {
      await adminApi.createCompany(form);
      showToast("Предприятие создано");
    }
    load();
  };

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteCompany(id);
      showToast("Предприятие удалено");
      load();
    } catch (err) {
      alert(err.message);
    }
    setConfirmDelete(null);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <button className="button button-primary compact" onClick={() => setEditor({ is_active: 1, sort_order: 0 })}>
          + Создать предприятие
        </button>
      </div>
      {items.length === 0 && <EmptyState text="Нет предприятий" />}
      {items.map(item => (
        <div key={item.id} style={{
          background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 10, padding: 12, marginBottom: 8
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong>{item.short}</strong>
              <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 10 }}>{item.name}</span>
              <span style={{ fontSize: 11, marginLeft: 8, color: "var(--muted)" }}>{item.type}</span>
              <span style={{ fontSize: 11, marginLeft: 8, color: item.is_active ? "var(--mint)" : "#ff6b6b" }}>
                {item.is_active ? "активен" : "неактивен"}
              </span>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="button button-ghost compact" onClick={() => setEditor(item)}>✏️</button>
              <button className="button button-ghost compact" onClick={() => setConfirmDelete(item.id)} style={{ color: "#ff6b6b" }}>🗑</button>
            </div>
          </div>
        </div>
      ))}

      {editor && (
        <EditorModal
          title={editor.id ? "Редактировать предприятие" : "Создать предприятие"}
          data={editor}
          fields={[
            { key: "id", label: "ID (для новых)" },
            { key: "name", label: "Полное название" },
            { key: "short", label: "Короткое название" },
            { key: "type", label: "Тип" },
            { key: "accent", label: "Цвет акцента" },
            { key: "history", label: "История", type: "textarea" },
            { key: "products", label: "Продукты", type: "array" },
            { key: "careers", label: "Карьеры", type: "array" },
            { key: "partners", label: "Партнёры", type: "array" },
            { key: "game_profession", label: "Профессия для игры" },
            { key: "sort_order", label: "Порядок сортировки", type: "number" },
            { key: "is_active", label: "Активен", type: "select", options: [
              { value: 1, label: "Да" },
              { value: 0, label: "Нет" },
            ]},
          ]}
          onSave={handleSave}
          onClose={() => setEditor(null)}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          message="Удалить предприятие? Это действие необратимо."
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

// ===================== Tab: Station Pieces =====================
function StationPiecesTab({ showToast }) {
  const [items, setItems] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editor, setEditor] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [companyFilter, setCompanyFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (companyFilter.trim()) params.company_id = companyFilter.trim();
      const [piecesData, companiesData] = await Promise.all([
        adminApi.getStationPieces(params),
        adminApi.getCompanies(),
      ]);
      setItems(piecesData || []);
      setCompanies(companiesData || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [companyFilter]);

  useEffect(() => { load(); }, []);

  const handleSave = async (form) => {
    const payload = { ...form };
    if (typeof payload.facts === "string") {
      try { payload.facts = JSON.parse(payload.facts); } catch { payload.facts = [payload.facts]; }
    }
    if (typeof payload.options === "string") {
      try { payload.options = JSON.parse(payload.options); } catch { payload.options = [payload.options]; }
    }
    if (editor && editor.id) {
      await adminApi.updateStationPiece(editor.id, payload);
      showToast("Блок обновлён");
    } else {
      await adminApi.createStationPiece(payload);
      showToast("Блок создан");
    }
    load();
  };

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteStationPiece(id);
      showToast("Блок удалён");
      load();
    } catch (err) {
      alert(err.message);
    }
    setConfirmDelete(null);
  };

  const handleSeed = async () => {
    const cid = prompt("ID предприятия для авто-генерации блоков:");
    if (!cid) return;
    try {
      await adminApi.seedStationPieces(cid);
      showToast("Блоки сгенерированы");
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
        <input
          placeholder="Фильтр по company_id"
          value={companyFilter}
          onChange={e => setCompanyFilter(e.target.value)}
          style={{
            flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--line)",
            background: "var(--panel-2)", color: "var(--text)", fontSize: 14
          }}
        />
        <button className="button button-primary compact" onClick={() => load()}>Применить</button>
        <button className="button button-ghost compact" onClick={() => { setCompanyFilter(""); load(); }}>Сброс</button>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <button className="button button-primary compact" onClick={() => setEditor({ is_active: 1, score: 20, piece_index: 0 })}>
          + Создать блок
        </button>
        <button className="button button-ghost compact" onClick={handleSeed}>Авто-генерация</button>
      </div>
      {items.length === 0 && <EmptyState text="Нет блоков" />}
      {items.map(item => {
        // Check if this piece is a 3D game block (piece_index 3 + company has game_profession)
        const company = companies.find(c => c.id === item.company_id);
        const is3dGame = item.piece_index === 3 && company?.game_profession;

        return (
          <div key={item.id} style={{
            background: is3dGame ? "rgba(255,214,41,0.08)" : "var(--panel)",
            border: `1px solid ${is3dGame ? "rgba(255,214,41,0.3)" : "var(--line)"}`,
            borderRadius: 10, padding: 12, marginBottom: 8
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong>{item.title}</strong>
                {is3dGame && <span style={{ fontSize: 12, marginLeft: 6 }}>🎮</span>}
                <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 10 }}>
                  {item.company_id} · блок {item.piece_index} · {item.track || "общий"}
                </span>
                <span style={{ fontSize: 11, marginLeft: 8, color: item.is_active ? "var(--mint)" : "#ff6b6b" }}>
                  {item.is_active ? "активен" : "неактивен"}
                </span>
                {is3dGame && (
                  <span style={{ fontSize: 11, marginLeft: 8, color: "var(--yellow)" }}>
                    🎮 3D-игра ({company.game_profession})
                  </span>
                )}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {!is3dGame && (
                  <>
                    <button className="button button-ghost compact" onClick={() => setEditor(item)}>✏️</button>
                    <button className="button button-ghost compact" onClick={() => setConfirmDelete(item.id)} style={{ color: "#ff6b6b" }}>🗑</button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {editor && (
        <EditorModal
          title={editor.id ? "Редактировать блок" : "Создать блок"}
          data={editor}
          fields={[
            { key: "company_id", label: "ID предприятия" },
            { key: "piece_index", label: "Индекс блока (0-3)", type: "number" },
            { key: "track", label: "Трек", type: "select", options: [
              { value: "", label: "Общий" },
              { value: "business", label: "Бизнес" },
              { value: "career", label: "Карьера" },
            ]},
            { key: "title", label: "Заголовок" },
            { key: "visual", label: "Визуальное описание", type: "textarea" },
            { key: "facts", label: "Факты", type: "array" },
            { key: "task_question", label: "Вопрос задания" },
            { key: "options", label: "Варианты ответов", type: "array" },
            { key: "correct_option_index", label: "Индекс правильного ответа", type: "number" },
            { key: "score", label: "Баллы", type: "number" },
            { key: "is_active", label: "Активен", type: "select", options: [
              { value: 1, label: "Да" },
              { value: 0, label: "Нет" },
            ]},
          ]}
          onSave={handleSave}
          onClose={() => setEditor(null)}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          message="Удалить блок станции?"
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

// ===================== Tab: Questions =====================
function QuestionsTab({ showToast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editor, setEditor] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [answerEditor, setAnswerEditor] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getQuestions();
      setItems(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, []);

  const handleSaveQuestion = async (form) => {
    if (editor && editor.id) {
      await adminApi.updateQuestion(editor.id, form);
      showToast("Вопрос обновлён");
    } else {
      await adminApi.createQuestion(form);
      showToast("Вопрос создан");
    }
    load();
    setEditor(null);
  };

  const handleDeleteQuestion = async (id) => {
    try {
      await adminApi.deleteQuestion(id);
      showToast("Вопрос удалён");
      load();
    } catch (err) {
      alert(err.message);
    }
    setConfirmDelete(null);
  };

  const handleSaveAnswer = async (form) => {
    if (answerEditor && answerEditor.id) {
      await adminApi.updateAnswer(answerEditor.qid, answerEditor.id, form);
      showToast("Ответ обновлён");
    } else {
      await adminApi.createAnswer(answerEditor.qid, form);
      showToast("Ответ создан");
    }
    load();
    setAnswerEditor(null);
  };

  const handleDeleteAnswer = async (qid, aid) => {
    try {
      await adminApi.deleteAnswer(qid, aid);
      showToast("Ответ удалён");
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <button className="button button-primary compact" onClick={() => setEditor({ is_active: 1, sort_order: 0 })}>
          + Создать вопрос
        </button>
      </div>
      {items.length === 0 && <EmptyState text="Нет вопросов" />}
      {items.map(item => (
        <div key={item.id} style={{
          background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 10, padding: 12, marginBottom: 8
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong>{item.text}</strong>
              <span style={{ fontSize: 11, marginLeft: 10, color: "var(--muted)" }}>#{item.id}</span>
              <span style={{ fontSize: 11, marginLeft: 8, color: item.is_active ? "var(--mint)" : "#ff6b6b" }}>
                {item.is_active ? "активен" : "неактивен"}
              </span>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="button button-ghost compact" onClick={() => setExpanded(expanded === item.id ? null : item.id)}>
                {expanded === item.id ? "▲" : "▼"}
              </button>
              <button className="button button-ghost compact" onClick={() => setEditor(item)}>✏️</button>
              <button className="button button-ghost compact" onClick={() => setConfirmDelete(item.id)} style={{ color: "#ff6b6b" }}>🗑</button>
            </div>
          </div>
          {expanded === item.id && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
              <h5 style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>ОТВЕТЫ</h5>
              {item.answers && item.answers.length > 0 ? (
                item.answers.map(a => (
                  <div key={a.id} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "6px 10px", background: "var(--panel-2)", borderRadius: 8, marginBottom: 4
                  }}>
                    <div>
                      <span style={{ fontSize: 13 }}>{a.text}</span>
                      <span style={{ fontSize: 11, color: "var(--muted)", marginLeft: 8 }}>баллы: {a.score}</span>
                      <span style={{ fontSize: 11, color: "var(--muted)", marginLeft: 4 }}>навык: {a.skill}</span>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button className="button button-ghost compact" onClick={() => setAnswerEditor({ ...a, qid: item.id })}>✏️</button>
                      <button className="button button-ghost compact" onClick={() => handleDeleteAnswer(item.id, a.id)} style={{ color: "#ff6b6b", fontSize: 11 }}>🗑</button>
                    </div>
                  </div>
                ))
              ) : (
                <span style={{ fontSize: 12, color: "var(--muted)" }}>Нет ответов</span>
              )}
              <button className="button button-ghost compact" style={{ marginTop: 8 }} onClick={() => setAnswerEditor({ qid: item.id, text: "", score: 0, skill: "initiative" })}>
                + Добавить ответ
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Question editor */}
      {editor && (
        <EditorModal
          title={editor.id ? "Редактировать вопрос" : "Создать вопрос"}
          data={editor}
          fields={[
            { key: "text", label: "Текст вопроса" },
            { key: "sort_order", label: "Порядок", type: "number" },
            { key: "is_active", label: "Активен", type: "select", options: [
              { value: 1, label: "Да" },
              { value: 0, label: "Нет" },
            ]},
          ]}
          onSave={handleSaveQuestion}
          onClose={() => setEditor(null)}
        />
      )}

      {/* Answer editor */}
      {answerEditor && (
        <EditorModal
          title={answerEditor.id ? "Редактировать ответ" : "Создать ответ"}
          data={answerEditor}
          fields={[
            { key: "text", label: "Текст ответа" },
            { key: "score", label: "Баллы", type: "number" },
            { key: "skill", label: "Навык", type: "select", options: [
              { value: "initiative", label: "Инициатива" },
              { value: "analytics", label: "Аналитика" },
              { value: "team", label: "Команда" },
            ]},
          ]}
          onSave={handleSaveAnswer}
          onClose={() => setAnswerEditor(null)}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          message="Удалить вопрос (все ответы тоже будут удалены)?"
          onConfirm={() => handleDeleteQuestion(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

// ===================== Tab: Achievements =====================
function AchievementsTab({ showToast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editor, setEditor] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getAchievements();
      setItems(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, []);

  const handleSave = async (form) => {
    if (editor && editor.id) {
      await adminApi.updateAchievement(editor.id, form);
      showToast("Достижение обновлено");
    } else {
      await adminApi.createAchievement(form);
      showToast("Достижение создано");
    }
    load();
    setEditor(null);
  };

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteAchievement(id);
      showToast("Достижение удалено");
      load();
    } catch (err) {
      alert(err.message);
    }
    setConfirmDelete(null);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <button className="button button-primary compact" onClick={() => setEditor({ is_active: 1, is_game: 0 })}>
          + Создать достижение
        </button>
      </div>
      {items.length === 0 && <EmptyState text="Нет достижений" />}
      {items.map(item => (
        <div key={item.id} style={{
          background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 10, padding: 12, marginBottom: 8
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong>{item.name}</strong>
              <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 10 }}>{item.icon}</span>
              <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 6 }}>— {item.description}</span>
              <span style={{ fontSize: 11, marginLeft: 8, color: "var(--muted)" }}>ключ: {item.condition_key}</span>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="button button-ghost compact" onClick={() => setEditor(item)}>✏️</button>
              <button className="button button-ghost compact" onClick={() => setConfirmDelete(item.id)} style={{ color: "#ff6b6b" }}>🗑</button>
            </div>
          </div>
        </div>
      ))}

      {editor && (
        <EditorModal
          title={editor.id ? "Редактировать достижение" : "Создать достижение"}
          data={editor}
          fields={[
            { key: "id", label: "ID" },
            { key: "name", label: "Название" },
            { key: "icon", label: "Иконка" },
            { key: "description", label: "Описание" },
            { key: "condition_key", label: "Ключ условия" },
            { key: "is_game", label: "Игровое", type: "select", options: [
              { value: 0, label: "Нет" },
              { value: 1, label: "Да" },
            ]},
            { key: "is_active", label: "Активно", type: "select", options: [
              { value: 1, label: "Да" },
              { value: 0, label: "Нет" },
            ]},
          ]}
          onSave={handleSave}
          onClose={() => setEditor(null)}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          message="Удалить достижение?"
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

// ===================== Tab: Tasks =====================
function TasksTab({ showToast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editor, setEditor] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getTasks();
      setItems(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, []);

  const handleSave = async (form) => {
    if (editor && editor.id) {
      await adminApi.updateTask(editor.id, form);
      showToast("Задача обновлена");
    } else {
      await adminApi.createTask(form);
      showToast("Задача создана");
    }
    load();
    setEditor(null);
  };

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteTask(id);
      showToast("Задача удалена");
      load();
    } catch (err) {
      alert(err.message);
    }
    setConfirmDelete(null);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <button className="button button-primary compact" onClick={() => setEditor({ is_active: 1, max_score: 10, task_number: 1 })}>
          + Создать задачу
        </button>
      </div>
      {items.length === 0 && <EmptyState text="Нет задач" />}
      {items.map(item => (
        <div key={item.id} style={{
          background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 10, padding: 12, marginBottom: 8
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong>{item.title}</strong>
              <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 10 }}>
                {item.company_id} · {item.profession} · #{item.task_number}
              </span>
              <span style={{ fontSize: 12, marginLeft: 8, color: "var(--yellow)" }}>{item.max_score} баллов</span>
              <span style={{ fontSize: 11, marginLeft: 8, color: item.is_active ? "var(--mint)" : "#ff6b6b" }}>
                {item.is_active ? "активна" : "неактивна"}
              </span>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="button button-ghost compact" onClick={() => setEditor(item)}>✏️</button>
              <button className="button button-ghost compact" onClick={() => setConfirmDelete(item.id)} style={{ color: "#ff6b6b" }}>🗑</button>
            </div>
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{item.description}</div>
        </div>
      ))}

      {editor && (
        <EditorModal
          title={editor.id ? "Редактировать задачу" : "Создать задачу"}
          data={editor}
          fields={[
            { key: "company_id", label: "ID предприятия" },
            { key: "profession", label: "Профессия" },
            { key: "task_number", label: "Номер задачи (1-3)", type: "number" },
            { key: "title", label: "Заголовок" },
            { key: "description", label: "Описание", type: "textarea" },
            { key: "task_type", label: "Тип задачи" },
            { key: "max_score", label: "Макс. баллов", type: "number" },
            { key: "config_json", label: "Конфигурация (JSON)", type: "json" },
            { key: "is_active", label: "Активна", type: "select", options: [
              { value: 1, label: "Да" },
              { value: 0, label: "Нет" },
            ]},
          ]}
          onSave={handleSave}
          onClose={() => setEditor(null)}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          message="Удалить задачу?"
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

// ===================== Tab: Final Results =====================
function FinalResultsTab({ showToast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editor, setEditor] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getFinalResults();
      setItems(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, []);

  const handleSave = async (form) => {
    if (editor && editor.id) {
      await adminApi.updateFinalResult(editor.id, form);
      showToast("Результат обновлён");
    } else {
      await adminApi.createFinalResult(form);
      showToast("Результат создан");
    }
    load();
    setEditor(null);
  };

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteFinalResult(id);
      showToast("Результат удалён");
      load();
    } catch (err) {
      alert(err.message);
    }
    setConfirmDelete(null);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <button className="button button-primary compact" onClick={() => setEditor({ is_active: 1, tags: [], steps: [] })}>
          + Создать итоговый результат
        </button>
      </div>
      {items.length === 0 && <EmptyState text="Нет результатов" />}
      {items.map(item => (
        <div key={item.id} style={{
          background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 10, padding: 12, marginBottom: 8
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong>{item.title}</strong>
              <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 10 }}>{item.track === "business" ? "Предприниматель" : "Специалист"}</span>
              <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 6 }}>— {item.project_name}</span>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="button button-ghost compact" onClick={() => setEditor(item)}>✏️</button>
              <button className="button button-ghost compact" onClick={() => setConfirmDelete(item.id)} style={{ color: "#ff6b6b" }}>🗑</button>
            </div>
          </div>
        </div>
      ))}

      {editor && (
        <EditorModal
          title={editor.id ? "Редактировать результат" : "Создать результат"}
          data={editor}
          fields={[
            { key: "track", label: "Трек", type: "select", options: [
              { value: "business", label: "Предприниматель" },
              { value: "career", label: "Специалист" },
            ]},
            { key: "title", label: "Заголовок" },
            { key: "project_name", label: "Название проекта" },
            { key: "description", label: "Описание", type: "textarea" },
            { key: "tags", label: "Теги", type: "array" },
            { key: "steps", label: "Шаги", type: "array" },
            { key: "is_active", label: "Активен", type: "select", options: [
              { value: 1, label: "Да" },
              { value: 0, label: "Нет" },
            ]},
          ]}
          onSave={handleSave}
          onClose={() => setEditor(null)}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          message="Удалить итоговый результат?"
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

// ===================== Tab: Scoring Config =====================
function ScoringConfigTab({ showToast }) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getScoringConfig();
      setConfig(data);
      setForm({ ...data });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminApi.updateScoringConfig(form);
      showToast("Конфигурация баллов обновлена");
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!config) return <EmptyState text="Нет данных" />;

  return (
    <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 14, padding: 20 }}>
      <h3 style={{ fontFamily: "Montserrat, sans-serif", marginBottom: 16 }}>Настройки баллов</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {Object.entries(form).map(([key, value]) => {
          if (key === "id" || key === "updated_at") return null;
          return (
            <div key={key}>
              <label style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 4 }}>{key}</label>
              <input
                type="number"
                value={value ?? ""}
                onChange={e => setForm(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                style={{
                  width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--line)",
                  background: "var(--panel-2)", color: "var(--text)", fontSize: 14
                }}
              />
            </div>
          );
        })}
      </div>
      <button className="button button-primary compact" style={{ marginTop: 16 }} onClick={handleSave} disabled={saving}>
        {saving ? "Сохранение..." : "Сохранить"}
      </button>
    </div>
  );
}

// ===================== Tab: Level Thresholds =====================
function LevelThresholdsTab({ showToast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editor, setEditor] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getLevelThresholds();
      setItems(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, []);

  const handleSave = async (form) => {
    await adminApi.updateLevelThreshold(editor.id, form);
    showToast("Порог уровня обновлён");
    load();
    setEditor(null);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      {items.length === 0 && <EmptyState text="Нет порогов уровней" />}
      {items.map(item => (
        <div key={item.id} style={{
          background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 10, padding: 12, marginBottom: 8,
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <div>
            <strong>{item.name}</strong>
            <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 10 }}>мин: {item.min_score}, макс: {item.max_score || "∞"}</span>
            <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 6 }}>порядок: {item.sort_order}</span>
          </div>
          <button className="button button-ghost compact" onClick={() => setEditor(item)}>✏️</button>
        </div>
      ))}

      {editor && (
        <EditorModal
          title="Редактировать порог уровня"
          data={editor}
          fields={[
            { key: "name", label: "Название уровня" },
            { key: "min_score", label: "Мин. баллов", type: "number" },
            { key: "max_score", label: "Макс. баллов (0 = безлимит)", type: "number" },
            { key: "sort_order", label: "Порядок", type: "number" },
          ]}
          onSave={handleSave}
          onClose={() => setEditor(null)}
        />
      )}
    </div>
  );
}

// ===================== Tab: Game Config =====================
function GameConfigTab({ showToast }) {
  const [tab, setTab] = useState("workers");
  const [workers, setWorkers] = useState([]);
  const [docRows, setDocRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editor, setEditor] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [w, d] = await Promise.all([
        adminApi.getGameWorkers(),
        adminApi.getGameDocRows(),
      ]);
      setWorkers(w || []);
      setDocRows(d || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, []);

  const handleSaveWorker = async (form) => {
    if (editor && editor.id) {
      await adminApi.updateGameWorker(editor.id, form);
      showToast("Работник обновлён");
    } else {
      await adminApi.createGameWorker(form);
      showToast("Работник создан");
    }
    load();
    setEditor(null);
  };

  const handleSaveDocRow = async (form) => {
    if (editor && editor.id) {
      await adminApi.updateGameDocRow(editor.id, form);
      showToast("Строка документа обновлена");
    } else {
      await adminApi.createGameDocRow(form);
      showToast("Строка документа создана");
    }
    load();
    setEditor(null);
  };

  const handleDelete = async () => {
    try {
      if (tab === "workers") {
        await adminApi.deleteGameWorker(confirmDelete);
        showToast("Работник удалён");
      } else {
        await adminApi.deleteGameDocRow(confirmDelete);
        showToast("Строка документа удалена");
      }
      load();
    } catch (err) {
      alert(err.message);
    }
    setConfirmDelete(null);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <button className={`button ${tab === "workers" ? "button-primary" : "button-ghost"} compact`} onClick={() => setTab("workers")}>
          Работники ({workers.length})
        </button>
        <button className={`button ${tab === "docRows" ? "button-primary" : "button-ghost"} compact`} onClick={() => setTab("docRows")}>
          Документы ({docRows.length})
        </button>
      </div>

      {tab === "workers" && (
        <>
          <div style={{ marginBottom: 12 }}>
            <button className="button button-primary compact" onClick={() => setEditor({})}>
              + Создать работника
            </button>
          </div>
          {workers.map(item => (
            <div key={item.id} style={{
              background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 10, padding: 12, marginBottom: 8
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong>{item.name}</strong>
                  <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 10 }}>{item.profession}</span>
                  <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 6 }}>уровень {item.level || "—"}</span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="button button-ghost compact" onClick={() => setEditor(item)}>✏️</button>
                  <button className="button button-ghost compact" onClick={() => setConfirmDelete(item.id)} style={{ color: "#ff6b6b" }}>🗑</button>
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {tab === "docRows" && (
        <>
          <div style={{ marginBottom: 12 }}>
            <button className="button button-primary compact" onClick={() => setEditor({})}>
              + Создать строку документа
            </button>
          </div>
          {docRows.map(item => (
            <div key={item.id} style={{
              background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 10, padding: 12, marginBottom: 8
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong>{item.doc_name || item.id}</strong>
                  <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 10 }}>{item.field_label}: {item.field_value}</span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="button button-ghost compact" onClick={() => setEditor(item)}>✏️</button>
                  <button className="button button-ghost compact" onClick={() => setConfirmDelete(item.id)} style={{ color: "#ff6b6b" }}>🗑</button>
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {editor && (
        <EditorModal
          title={editor.id ? "Редактировать" : "Создать"}
          data={editor}
          fields={[
            { key: "name", label: "Имя" },
            { key: "profession", label: "Профессия" },
            { key: "level", label: "Уровень", type: "number" },
          ]}
          onSave={tab === "workers" ? handleSaveWorker : handleSaveDocRow}
          onClose={() => setEditor(null)}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          message="Удалить элемент?"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

// ===================== Tab: Exports =====================
function ExportsTab({ showToast }) {
  const [exports, setExports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getExports();
      setExports(data?.exports || data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <h3 style={{ fontFamily: "Montserrat, sans-serif", marginBottom: 16 }}>Экспорт данных</h3>
      {exports.length === 0 && <EmptyState text="Нет доступных экспортов" />}
      {exports.map((item, idx) => (
        <div key={idx} style={{
          background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 10, padding: 12, marginBottom: 8
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong>{item.name || item.title || `Экспорт #${idx + 1}`}</strong>
              {item.description && <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 8 }}>{item.description}</span>}
            </div>
            <button className="button button-primary compact" onClick={() => {
              if (item.url) {
                window.open(item.url, "_blank");
              } else {
                showToast("Экспорт пока недоступен");
              }
            }}>
              Скачать
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ===================== Main Admin Screen =====================
export default function AdminScreen({ navigate, showToast }) {
  const [tab, setTab] = useState("users");

  const TABS = [
    { id: "users", label: "Пользователи", icon: "👥" },
    { id: "companies", label: "Предприятия", icon: "🏭" },
    { id: "pieces", label: "Блоки станций", icon: "🧩" },
    { id: "questions", label: "Вопросы", icon: "❓" },
    { id: "achievements", label: "Достижения", icon: "🏆" },
    { id: "tasks", label: "Задачи", icon: "📋" },
    { id: "final-results", label: "Итоговые результаты", icon: "📊" },
    { id: "scoring", label: "Баллы", icon: "⚙️" },
    { id: "levels", label: "Уровни", icon: "📈" },
    { id: "game", label: "Игра", icon: "🎮" },
    { id: "exports", label: "Экспорт", icon: "📤" },
  ];

  return (
    <section className="screen active">
      <div className="page-head">
        <div>
          <div className="eyebrow"><span className="live-dot" style={{ background: "var(--yellow)" }}></span> ПАНЕЛЬ АДМИНИСТРАТОРА</div>
          <h1>Администрирование</h1>
          <p>Управление всеми сущностями системы</p>
        </div>
        <button className="button button-ghost compact" onClick={() => navigate("home")}>
          ← На главную
        </button>
      </div>

      {/* Tab navigation */}
      <div style={{
        display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20,
        paddingBottom: 12, borderBottom: "1px solid var(--line)"
      }}>
        {TABS.map(t => (
          <button
            key={t.id}
            className={`button ${tab === t.id ? "button-primary" : "button-ghost"} compact`}
            onClick={() => setTab(t.id)}
            style={{ fontSize: 12 }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "users" && <UsersTab showToast={showToast} />}
      {tab === "companies" && <CompaniesTab showToast={showToast} />}
      {tab === "pieces" && <StationPiecesTab showToast={showToast} />}
      {tab === "questions" && <QuestionsTab showToast={showToast} />}
      {tab === "achievements" && <AchievementsTab showToast={showToast} />}
      {tab === "tasks" && <TasksTab showToast={showToast} />}
      {tab === "final-results" && <FinalResultsTab showToast={showToast} />}
      {tab === "scoring" && <ScoringConfigTab showToast={showToast} />}
      {tab === "levels" && <LevelThresholdsTab showToast={showToast} />}
      {tab === "game" && <GameConfigTab showToast={showToast} />}
      {tab === "exports" && <ExportsTab showToast={showToast} />}
    </section>
  );
}