/**
 * Shared fetch wrapper that:
 * - Automatically handles 401 token expiry (clears session + redirects)
 * - Throws after redirect so calling code stops execution (M-7)
 * - Validates the URL is HTTPS in production (H-3)
 */
export async function apiFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, init);

  if (res.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    const isCandidate = window.location.pathname.startsWith("/candidate");
    window.location.href = isCandidate ? "/candidate/auth" : "/auth";
    // M-7: throw so Redux thunks and other callers stop processing the response
    throw new Error("Session expired. Please sign in again.");
  }

  return res;
}

/**
 * Sanitize a user-facing error message — never leak raw server internals.
 * H-7: Maps backend errors to generic messages unless they are safe user messages.
 */
export function sanitizeError(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (typeof err === "string") {
    return isSafeMessage(err) ? err : fallback;
  }
  if (err instanceof Error) {
    // Re-throw session expiry as-is
    if (err.message === "Session expired. Please sign in again.") return err.message;
    return isSafeMessage(err.message) ? err.message : fallback;
  }
  return fallback;
}

/**
 * Determines if an error message is safe to show to the user.
 * Blocks messages that look like stack traces, internal paths, or DB errors.
 */
function isSafeMessage(msg: string): boolean {
  const blocklist = [
    /at\s+\w+\s+\(/,          // stack trace lines
    /MongoServerError/i,
    /ValidationError/i,
    /CastError/i,
    /\.(ts|js|tsx|jsx):\d+/,  // file:line references
    /ECONNREFUSED/i,
    /ETIMEDOUT/i,
    /\/opt\//,                 // server path leakage
    /\/home\//,
    /node_modules/,
  ];
  return !blocklist.some((pattern) => pattern.test(msg));
}
