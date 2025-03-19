const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://paralegal-backend.onrender.com';

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T | { error: string }> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout

  try {
    const isFormData = options.body instanceof FormData;

    const headers = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }), // Avoid Content-Type for FormData
      ...(token ? { Authorization: `Bearer ${token}` } : {}), // Only add Authorization if token exists
      ...options.headers,
    };

    console.log(`API Request to: ${API_URL}${endpoint}`);
    console.log("Headers:", headers);

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { message: text };
      }
    }

    if (!response.ok) {
      console.error(`API Error [${response.status}]:`, data.message || data.error || 'API request failed');
      return { error: data.message || data.error || 'API request failed' };
    }

    return data;
  } catch (error) {
    clearTimeout(timeout);
    console.error('API Error:', error);

    return { 
      error: error instanceof Error ? 
        error.name === 'AbortError' ? 
          'Request timed out. Please try again.' : 
          error.message : 
        'Network error occurred'
    };
  }
}

export { fetchAPI };
