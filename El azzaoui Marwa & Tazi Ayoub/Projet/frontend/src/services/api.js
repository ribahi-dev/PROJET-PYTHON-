const API_BASE_URL = "http://127.0.0.1:8000/api";
const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api$/, "");

export default API_BASE_URL;
export { API_BASE_URL, BACKEND_BASE_URL };
export const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem("access");
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    window.location.href = "/login";
  }

  return response;
};

export const authFetchJson = async (url, options = {}) => {
  const response = await authFetch(url, options);
  let json;

  try {
    json = await response.json();
  } catch {
    json = null;
  }

  if (!response.ok) {
    const errorMessage = json?.detail || json?.error || response.statusText || "Erreur réseau";
    const err = new Error(errorMessage);
    err.status = response.status;
    err.body = json;
    throw err;
  }

  return json;
};

// Subscription APIs
export const subscribeToCoach = async (coachId, durationDays = 30) => {
  return authFetchJson(`${API_BASE_URL}/subscriptions/subscribe/`, {
    method: 'POST',
    body: JSON.stringify({ coach_id: coachId, duration_days: durationDays }),
  });
};

export const getSubscriptionStatus = async () => {
  try {
    return await authFetchJson(`${API_BASE_URL}/subscriptions/status/`);
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
};

// Message APIs
export const getContacts = async () => {
  return authFetchJson(`${API_BASE_URL}/messages/contacts/`);
};

export const getConversation = async (userId) => {
  return authFetchJson(`${API_BASE_URL}/messages/conversation/${userId}/`);
};

export const sendMessage = async (receiverId, coachId, content) => {
  if (!content.trim()) return;

  const payload = {
    receiver_id: receiverId,
    coach_id: coachId,
    content,
  };

  return authFetchJson(`${API_BASE_URL}/messages/send/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

// Appointment APIs
export const createAppointmentSlot = async (date, time, notes = '') => {
  const response = await authFetch(`${API_BASE_URL}/appointments/create/`, {
    method: "POST",
    body: JSON.stringify({
      date,
      time,
      notes,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const errorText = errorBody?.error || errorBody?.detail || response.statusText;
    console.error("CREATE SLOT ERROR:", errorBody || errorText);
    throw new Error(errorText || "Erreur création de créneau");
  }

  return response.json();
};

export const createAppointment = createAppointmentSlot;

export const getAvailableSlots = async () => {
  return authFetchJson(`${API_BASE_URL}/appointments/available/`);
};

export const bookAppointmentSlot = async (appointmentId) => {
  return authFetchJson(`${API_BASE_URL}/appointments/${appointmentId}/book/`, {
    method: 'POST',
  });
};

export const getMyAppointments = async () => {
  return authFetchJson(`${API_BASE_URL}/appointments/my/`);
};

export const getUserById = async (userId) => {
  return authFetchJson(`${API_BASE_URL}/users/${userId}/`);
};

export const confirmAppointment = async (appointmentId) => {
  return authFetchJson(`${API_BASE_URL}/appointments/${appointmentId}/confirm/`, {
    method: 'PATCH',
  });
};

// Progress APIs
export const addProgress = async (weight, notes = '', programId = null) => {
  const body = { weight, notes };
  if (programId) {
    body.program_id = programId;
  }

  return authFetchJson(`${API_BASE_URL}/progress/add/`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
};

export const getMyProgress = async () => {
  return authFetchJson(`${API_BASE_URL}/progress/`);
};

export const getPrograms = async () => {
  return authFetchJson(`${API_BASE_URL}/programs/`);
};

// Profile APIs
export const getProfile = async () => {
  return authFetchJson(`${API_BASE_URL}/users/profile/`);
};

export const updateProfile = async (data) => {
  return authFetchJson(`${API_BASE_URL}/users/profile/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};
