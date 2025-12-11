import { API_BASE_URL } from "./config";

interface RequestOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  skipCredentials?: boolean;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const DEFAULT_TIMEOUT = 30000; // 30 seconds
const DEFAULT_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 1000; // 1 second

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError("Request timeout - server may be starting up. Please try again.", 408, "TIMEOUT");
    }
    throw error;
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    timeout = DEFAULT_TIMEOUT,
    retries = DEFAULT_RETRIES,
    retryDelay = DEFAULT_RETRY_DELAY,
    skipCredentials = false,
    ...fetchOptions
  } = options;

  const url = `${API_BASE_URL}${endpoint}`;
  console.log(url);
  const requestOptions: RequestInit = {
    ...fetchOptions,
    credentials: skipCredentials ? "omit" : "include",
    headers: {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    },
  };

  let lastError: Error | ApiError = new Error("Unknown error");

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, requestOptions, timeout);

      if (!response.ok) {
        let errorMessage = "An error occurred. Please try again.";
        let errorCode = "UNKNOWN_ERROR";

        // Set user-friendly default messages based on status code
        if (response.status === 400) {
          errorMessage = "Invalid request. Please check your input and try again.";
        } else if (response.status === 401) {
          errorMessage = "Invalid username or password. Please try again.";
        } else if (response.status === 403) {
          errorMessage = "You don't have permission to perform this action.";
        } else if (response.status === 404) {
          errorMessage = "The requested resource was not found.";
        } else if (response.status === 500) {
          errorMessage = "Server error. Please try again later.";
        }

        try {
          const data = await response.json();
          
          if (data && typeof data === 'object' && !Array.isArray(data)) {
            const dataObj = data as Record<string, unknown>;
            // Check for Simple JWT error format (detail field)
            // Also check for non_field_errors array (Django REST Framework format)
            if (dataObj.detail) {
              errorMessage = String(dataObj.detail);
            } else if (dataObj.non_field_errors && Array.isArray(dataObj.non_field_errors) && dataObj.non_field_errors.length > 0) {
              errorMessage = dataObj.non_field_errors[0] as string;
            } else if (dataObj.error) {
              errorMessage = String(dataObj.error);
            } else if (dataObj.message) {
              errorMessage = String(dataObj.message);
            }
            errorCode = (dataObj.code as string) || errorCode;
          }
        } catch {
          // If response is not JSON, use status text if available, otherwise keep default
          if (response.statusText) {
            errorMessage = response.statusText;
          }
        }

        // Don't retry on client errors (4xx), except 408 (timeout)
        if (response.status >= 400 && response.status < 500 && response.status !== 408) {
          throw new ApiError(errorMessage, response.status, errorCode);
        }

        // Retry on server errors (5xx) or timeout (408)
        if (attempt < retries) {
          await sleep(retryDelay * (attempt + 1));
          continue;
        }

        throw new ApiError(errorMessage, response.status, errorCode);
      }

      // Handle empty responses
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const text = await response.text();
        return text ? JSON.parse(text) : ({} as T);
      }

      return {} as T;
    } catch (error) {
      lastError = error instanceof ApiError ? error : new Error(String(error));

      // Don't retry on client errors or if it's the last attempt
      if (error instanceof ApiError && error.status && error.status >= 400 && error.status < 500 && error.status !== 408) {
        throw error;
      }

      if (attempt < retries) {
        // Network errors - retry
        if (error instanceof TypeError && error.message.includes("fetch")) {
          await sleep(retryDelay * (attempt + 1));
          continue;
        }

        // Timeout errors - retry
        if (error instanceof ApiError && error.code === "TIMEOUT") {
          await sleep(retryDelay * (attempt + 1));
          continue;
        }
      }
    }
  }

  // All retries exhausted
  if (lastError instanceof ApiError && lastError.code === "TIMEOUT") {
    throw new ApiError(
      "Server is taking too long to respond. It may be starting up. Please wait a moment and try again.",
      408,
      "TIMEOUT"
    );
  }

  if (lastError instanceof TypeError && lastError.message.includes("fetch")) {
    throw new ApiError(
      "Unable to connect to server. The server may be starting up. Please wait a moment and try again.",
      0,
      "NETWORK_ERROR"
    );
  }

  throw lastError;
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data),
      headers:
        data instanceof FormData
          ? options?.headers
          : { "Content-Type": "application/json", ...options?.headers },
    }),

  patch: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  put: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: "DELETE" }),
};

export { ApiError };

