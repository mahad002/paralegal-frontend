const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'https://paralegal-backend.onrender.com';

// Request cache to prevent duplicate requests
const requestCache = new Map<string, Promise<any>>();

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T | { error: string }> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Create a cache key for GET requests
  const cacheKey = options.method === 'GET' ? `${endpoint}${JSON.stringify(options)}` : null;
  
  // Return cached promise for duplicate GET requests
  if (cacheKey && requestCache.has(cacheKey)) {
    return requestCache.get(cacheKey);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout

  const requestPromise = (async () => {
    try {
      const isFormData = options.body instanceof FormData;

      const headers = {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      };

      console.log(`API Request to: ${API_URL}${endpoint}`);

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
        return { error: data.message || data.error || `HTTP ${response.status}: ${response.statusText}` };
      }

      return data;
    } catch (error) {
      clearTimeout(timeout);
      
      const errorMessage = error instanceof Error ? 
        error.name === 'AbortError' ? 
          'Request timed out. Please try again.' : 
          error.message : 
        'Network error occurred';
      console.error('API Error:', errorMessage);

      return { 
        error: error instanceof Error ? 
          error.name === 'AbortError' ? 
            'Request timed out. Please try again.' : 
            error.message : 
          'Network error occurred'
      };
    } finally {
      // Remove from cache after request completes
      if (cacheKey) {
        requestCache.delete(cacheKey);
      }
    }
  })().catch(() => {
    // Defensive catch to prevent unhandled rejections
    return { error: 'Request failed unexpectedly' };
  });

  // Cache GET requests
  if (cacheKey) {
    requestCache.set(cacheKey, requestPromise);
  }

  return requestPromise;
}

export { fetchAPI };