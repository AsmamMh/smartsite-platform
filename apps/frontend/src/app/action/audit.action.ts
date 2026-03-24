import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001",
});

function getAuthToken(): string | null {
  const directToken = localStorage.getItem("access_token");
  if (directToken) return directToken;
  const persisted = localStorage.getItem("smartsite-auth");
  if (!persisted) return null;
  try {
    const parsed = JSON.parse(persisted);
    return parsed?.state?.user?.access_token || null;
  } catch {
    return null;
  }
}

export async function trackAuditEvent(payload: {
  actionType?: string;
  actionLabel?: string;
  resourceType?: string;
  resourceId?: string;
  severity?: string;
  status?: string;
  details?: string;
}) {
  const token = getAuthToken();
  if (!token) return;
  try {
    await api.post("/audit-logs/track", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    // silent by design (tracking should not break UX)
  }
}

export async function trackLogout(sessionId?: string) {
  const token = getAuthToken();
  if (!token) return;
  try {
    await api.post(
      "/auth/logout",
      { sessionId },
      { headers: { Authorization: `Bearer ${token}` } },
    );
  } catch {
    // silent by design
  }
}
