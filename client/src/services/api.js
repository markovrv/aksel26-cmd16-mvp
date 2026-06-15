const API_BASE = "/api";

// --- Token management ---
const TOKEN_KEY = "marshrutka-token";
const REFRESH_KEY = "marshrutka-refresh";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(accessToken, refreshToken) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function isAuthenticated() {
  return !!getToken();
}

// --- Core fetch wrapper ---
async function request(path, options = {}) {
  const { method = "GET", body, auth = false, params } = options;

  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  let url = `${API_BASE}${path}`;
  if (params) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) qs.set(k, String(v));
    });
    const qstr = qs.toString();
    if (qstr) url += `?${qstr}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Handle 401 — try refresh
  if (res.status === 401 && auth) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      headers["Authorization"] = `Bearer ${getToken()}`;
      const retryRes = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      const retryData = await retryRes.json().catch(() => null);
      if (!retryRes.ok) {
        throw new ApiError(retryRes.status, retryData?.error || retryRes.statusText);
      }
      return retryData;
    }
    // Refresh failed — clear tokens
    clearTokens();
    throw new ApiError(401, "Сессия истекла. Пожалуйста, войдите снова.");
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(res.status, data?.error || data?.message || res.statusText);
  }

  return data;
}

async function tryRefresh() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    setTokens(data.accessToken, data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

// --- Auth API ---
export const auth = {
  register(data) {
    return request("/auth/register", { method: "POST", body: data });
  },
  login(email, password) {
    return request("/auth/login", { method: "POST", body: { email, password } });
  },
  refresh() {
    return request("/auth/refresh", {
      method: "POST",
      body: { refreshToken: getRefreshToken() },
    });
  },
  logout() {
    return request("/auth/logout", { method: "POST", auth: true });
  },
};

// --- Profile API ---
export const profile = {
  get() {
    return request("/profile", { auth: true });
  },
  update(data) {
    return request("/profile", { method: "PUT", body: data, auth: true });
  },
  saveAvatar(avatarData) {
    return request("/profile/avatar", { method: "PUT", body: avatarData, auth: true });
  },
  saveAchievements(achievementIds) {
    return request("/profile/achievements", { method: "POST", body: { achievementIds }, auth: true });
  },
  saveTrack(data) {
    return request("/profile/track", { method: "PUT", body: data, auth: true });
  },
  getProgress() {
    return request("/profile/progress", { auth: true });
  },
  reset() {
    return request("/profile/reset", { method: "POST", auth: true });
  },
};

// --- Companies API ---
export const companies = {
  list(params = {}) {
    return request("/companies", { params, auth: true });
  },
  get(id) {
    return request(`/companies/${id}`, { auth: true });
  },
  getTasks(companyId) {
    return request(`/companies/${companyId}/tasks`, { auth: true });
  },
  getPieces(companyId) {
    return request(`/companies/${companyId}/pieces`, { auth: true });
  },
};

// --- Station Pieces API ---
export const stationPieces = {
  complete(companyId, pieceIndex, data = {}) {
    return request(`/station-pieces/${companyId}/complete`, {
      method: "POST",
      body: { pieceIndex, ...data },
      auth: true,
    });
  },
};

// --- Tasks API ---
export const tasks = {
  solve(taskId, data) {
    return request(`/tasks/${taskId}/solve`, { method: "POST", body: data, auth: true });
  },
};

// --- Questions API ---
export const questions = {
  list() {
    return request("/questions", { auth: true });
  },
  submit(answers) {
    return request("/questions/submit", { method: "POST", body: { answers }, auth: true });
  },
};

// --- Portfolio API ---
export const portfolio = {
  get() {
    return request("/portfolio", { auth: true });
  },
};

// --- Teacher API ---
export const teacher = {
  getStudents(params = {}) {
    return request("/teacher/students", { params, auth: true });
  },
  login(password) {
    return request("/teacher/login", { method: "POST", body: { password } });
  },
};

// --- Statistics API ---
export const statistics = {
  getGlobal() {
    return request("/statistics");
  },
  getTracks() {
    return request("/statistics/tracks");
  },
  getProfessions() {
    return request("/statistics/professions");
  },
  getScores() {
    return request("/statistics/scores");
  },
};

// --- Config API ---
export const config = {
  get() {
    return request("/config");
  },
  getScoring() {
    return request("/config/scoring");
  },
  getLevels() {
    return request("/config/levels");
  },
  getGame() {
    return request("/config/game");
  },
};

// --- Final Result API ---
export const finalResult = {
  get(track) {
    return request(`/final-result/${track}`, { auth: true });
  },
};

export default {
  auth,
  profile,
  companies,
  stationPieces,
  tasks,
  questions,
  portfolio,
  teacher,
  statistics,
  config,
  finalResult,
  getToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  isAuthenticated,
  _request: request,
};
