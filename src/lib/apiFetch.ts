/**
 * Shared fetch wrapper that automatically handles 401 token expiry
 * by clearing localStorage and redirecting to the auth page.
 */
export async function apiFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, init);

  if (res.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Redirect based on current path
    const isCandidate = window.location.pathname.startsWith("/candidate");
    window.location.href = isCandidate ? "/candidate/auth" : "/auth";
  }

  return res;
}
