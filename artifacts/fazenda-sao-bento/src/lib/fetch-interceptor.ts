/**
 * Intercepts the global fetch to attach the Authorization header.
 * This ensures the generated @workspace/api-client-react automatically
 * sends the JWT token stored in localStorage.
 */
const originalFetch = window.fetch;

window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const token = localStorage.getItem("fsb_token");
  
  if (token) {
    init = init || {};
    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${token}`);
    init.headers = headers;
  }

  return originalFetch(input, init);
};

export {};
