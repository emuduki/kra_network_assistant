const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

async function request(path, options = {}) {
  const url = `${API_URL}${path}`;
  let response;

  try {
    response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      credentials: 'include',
      ...options,
    });
  } catch (networkError) {
    const message = networkError.message || 'Failed to fetch';
    const error = new Error(message);
    error.response = {
      data: null,
      status: null,
      statusText: null,
      url,
    };
    error.isNetworkError = true;
    throw error;
  }

  let body = null;
  try {
    body = await response.json();
  } catch (err) {
    // ignore parse failure
  }

  if (!response.ok) {
    const message = body?.error || body?.message || `Request failed with status ${response.status} ${response.statusText}`;
    const error = new Error(message);
    error.response = {
      data: body,
      status: response.status,
      statusText: response.statusText,
      url,
    };
    throw error;
  }

  return { data: body };
}


const apiClient = {
  get: (path, options) => request(path, { method: 'GET', ...options }),
  post: (path, data, options) => request(path, { method: 'POST', body: JSON.stringify(data), ...options }),
  patch: (path, data, options) => request(path, { method: 'PATCH', body: JSON.stringify(data), ...options }),
  delete: (path, options) => request(path, { method: 'DELETE', ...options }),
};

export default apiClient;
