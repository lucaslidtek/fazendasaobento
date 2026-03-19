import { 
  DEMO_DASHBOARD, 
  DEMO_HARVESTS, 
  DEMO_TRANSPORTS, 
  DEMO_MACHINES, 
  DEMO_FUELINGS, 
  DEMO_PRODUCTS, 
  DEMO_TRUCKS,
  DEMO_STOCK_MOVEMENTS,
  DEMO_USERS
} from "./demo-data";

/**
 * Intercepts the global fetch to return Mock Data for a pure static prototype.
 * This replaces the need for an Express api-server during the Vercel deploy.
 */
const originalFetch = window.fetch;

window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
  
  // Intercepting API calls
  if (url.includes("/api/")) {
    console.log(`[Mock API Interceptor] Intercepting: ${url}`);
    
    let data: any = null;
    
    if (url.endsWith("/auth/login")) {
      data = {
        user: { id: 1, name: "Admin Demo", email: "admin@fazenda.com", role: "admin", createdAt: new Date().toISOString() },
        token: "mock-jwt-token-123"
      };
    } else if (url.endsWith("/dashboard/summary")) {
      data = DEMO_DASHBOARD;
    } else if (url.endsWith("/harvest")) {
      data = DEMO_HARVESTS;
    } else if (url.endsWith("/transport")) {
      data = DEMO_TRANSPORTS;
    } else if (url.endsWith("/machines")) {
      data = DEMO_MACHINES;
    } else if (url.endsWith("/fueling")) {
      data = DEMO_FUELINGS;
    } else if (url.endsWith("/products")) {
      data = DEMO_PRODUCTS;
    } else if (url.endsWith("/stock-movements")) {
      data = DEMO_STOCK_MOVEMENTS;
    } else if (url.endsWith("/trucks")) {
      data = DEMO_TRUCKS;
    } else if (url.includes("/users")) {
      data = DEMO_USERS;
    } else if (url.endsWith("/auth/me")) {
      data = { id: 1, name: "Admin Demo", email: "admin@fazenda.com", role: "admin", createdAt: new Date().toISOString() };
    } else {
      // Fallback for empty/other list routes
      data = [];
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // Not an API call or fallback
  return originalFetch(input, init);
};

export {};
