const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function getToken() {
  try {
    return window.localStorage?.getItem("disasterlink_token");
  } catch {
    return null;
  }
}

async function request(path, { method = "GET", body, auth = false, params } = {}) {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) url.searchParams.set(key, value);
    });
  }

  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let detail = `Request failed with status ${response.status}`;
    try {
      const errBody = await response.json();
      detail = errBody.detail || detail;
    } catch {
      // response had no JSON body
    }
    const error = new Error(detail);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) return null;
  return response.json();
}

// ---------- Auth ----------
export const authApi = {
  signup: (payload) => request("/api/auth/signup", { method: "POST", body: payload }),
  login: (phone, password) => request("/api/auth/login", { method: "POST", body: { phone, password } }),
  me: () => request("/api/auth/me", { auth: true }),
};

// ---------- Alerts ----------
export const alertsApi = {
  list: (params) => request("/api/alerts", { params }),
  get: (id) => request(`/api/alerts/${id}`),
  riskIndicators: (id) => request(`/api/alerts/${id}/risk-indicators`),
  create: (payload) => request("/api/alerts", { method: "POST", body: payload, auth: true }),
};

// ---------- Places (shelters / hospitals / police) ----------
export const placesApi = {
  findNearby: ({ lat, lng, placeType, radiusKm }) =>
    request("/api/places", { params: { lat, lng, place_type: placeType, radius_km: radiusKm } }),
  get: (id) => request(`/api/places/${id}`),
};

// ---------- SOS ----------
export const sosApi = {
  create: (payload) => request("/api/sos", { method: "POST", body: payload }),
  get: (id) => request(`/api/sos/${id}`),
  update: (id, payload) => request(`/api/sos/${id}`, { method: "PATCH", body: payload }),
  listQueue: (statusFilter) => request("/api/sos", { params: { status_filter: statusFilter }, auth: true }),
  stats: () => request("/api/sos/stats/summary", { auth: true }),
  updateStatus: (id, payload) =>
    request(`/api/sos/${id}/status`, { method: "PATCH", body: payload, auth: true }),
  history: (id) => request(`/api/sos/${id}/history`, { auth: true }),
};

// ---------- Emergency contacts ----------
export const contactsApi = {
  list: (params) => request("/api/emergency-contacts", { params }),
};

// ---------- AI Assistant ----------
export const assistantApi = {
  topics: (language) => request("/api/assistant/topics", { params: { language } }),
  topic: (key, language) => request(`/api/assistant/topics/${key}`, { params: { language } }),
  query: (message, language) => request("/api/assistant/query", { method: "POST", body: { message, language } }),
};

export { getToken };
