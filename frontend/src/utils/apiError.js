/**
 * Human-readable message from Axios / API errors (auth, validation, network).
 */
export function getApiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return fallback;

  const data = error.response?.data;

  if (typeof data?.message === 'string' && data.message.trim()) {
    return data.message.trim();
  }

  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    return 'Cannot reach the server. Start the backend, then check that VITE_API_URL ends with /api (for example http://localhost:5005/api).';
  }

  if (error.code === 'ECONNABORTED') {
    return 'The request timed out. Check your connection and try again.';
  }

  const status = error.response?.status;
  if (status === 503) {
    return data?.message || 'Service temporarily unavailable. Try again in a moment.';
  }
  if (status === 500) {
    return 'Server error. If this persists, verify MongoDB is running and MONGODB_URI is set.';
  }

  return fallback;
}
