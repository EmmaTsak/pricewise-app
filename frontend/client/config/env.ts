const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const socketUrl = import.meta.env.VITE_SOCKET_URL;

// Small safety check so mistakes are easier to spot during development.
if (!apiBaseUrl) {
  throw new Error("Missing VITE_API_BASE_URL in frontend environment variables.");
}

if (!socketUrl) {
  throw new Error("Missing VITE_SOCKET_URL in frontend environment variables.");
}

export const env = {
  apiBaseUrl,
  socketUrl,
};