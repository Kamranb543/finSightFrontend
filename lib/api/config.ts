// API Configuration - Change this URL to point to your backend
// For production, set NEXT_PUBLIC_API_BASE_URL in Vercel environment variables
// Example: https://web-production-1a153.up.railway.app/api
const getApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (envUrl) {
    // Ensure it doesn't have trailing slash and includes /api
    console.log(envUrl);
    return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
  }
  // Default to localhost for development
  return "http://localhost:8000/api";
};

export const API_BASE_URL = getApiBaseUrl();
