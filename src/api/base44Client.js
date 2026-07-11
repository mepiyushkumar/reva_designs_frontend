/* eslint-disable */
// @ts-nocheck

const API_BASE_URL = (import.meta.env.VITE_SERVER_API_URL) || 'http://localhost:8080';
const TOKEN_KEY = 'reva_designs_token';

const getToken = () => {
  if (typeof window !== 'undefined') {
    return window.localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

const setToken = (token) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(TOKEN_KEY, token);
  }
};

const clearToken = () => {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(TOKEN_KEY);
  }
};

const normalizeRecord = (value) => {
  if (Array.isArray(value)) {
    return value.map(normalizeRecord);
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  const normalized = { ...value };
  if (normalized._id && !normalized.id) {
    normalized.id = String(normalized._id);
  }

  if (Array.isArray(normalized.images)) {
    normalized.images = normalized.images.filter(Boolean);
  }

  return normalized;
};

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(new Error('Unable to read the selected file.'));
  reader.readAsDataURL(file);
});

async function request(path, options = {}) {
  const { method = 'GET', body, requiresAuth = true, headers = {} } = options;
  const url = `${API_BASE_URL}${path}`;

  const init = {
    method,
    headers: {
      ...headers,
    },
  };

  if (body !== undefined && body !== null) {
    init.headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }

  const token = getToken();
  if (token && requiresAuth) {
    init.headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, init);
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  const payload = data && typeof data === 'object' && !Array.isArray(data) && data.success && Object.prototype.hasOwnProperty.call(data, 'data')
    ? data.data
    : data;
  const normalizedData = normalizeRecord(payload);

  if (!response.ok) {
    const error = new Error(data?.message || response.statusText || 'Request failed');
    error.status = response.status;
    throw error;
  }

  return normalizedData;
}

// Helper to create entity API
function createEntityApi(entityName) {
  return {
    list: async (sort = '-created_date', limit = 50) => {
      return request(`/entities/${entityName}?sort=${sort}&limit=${limit}`);
    },
    get: async (id) => {
      return request(`/entities/${entityName}/${id}`);
    },
    filter: async (filters = {}, sort = '-created_date', limit = 50) => {
      const query = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        query.append(key, filters[key]);
      });
      query.append('sort', sort);
      query.append('limit', limit);
      return request(`/entities/${entityName}?${query.toString()}`);
    },
    create: async (data) => {
      return request(`/entities/${entityName}`, {
        method: 'POST',
        body: data,
      });
    },
    update: async (id, data) => {
      return request(`/entities/${entityName}/${id}`, {
        method: 'PUT',
        body: data,
      });
    },
    delete: async (id) => {
      return request(`/entities/${entityName}/${id}`, {
        method: 'DELETE',
      });
    },
  };
}

export const base44 = {
  integrations: {
    Core: {
      UploadFile: async ({ file }) => {
        const file_url = await readFileAsDataUrl(file);
        return { file_url };
      },
      SendEmail: async () => {
        throw new Error('Email sending is not configured in this environment.');
      },
    },
  },
  auth: {
    loginViaEmailPassword: async (email, password) => {
      const data = await request('/auth/login', {
        method: 'POST',
        body: { email, password },
        requiresAuth: false,
      });
      if (data?.token) {
        setToken(data.token);
      }
      return data;
    },
    register: async (credentials) => {
      return request('/auth/register', {
        method: 'POST',
        body: credentials,
        requiresAuth: false,
      });
    },
    verifyOtp: async (data) => {
      const result = await request('/auth/verify-otp', {
        method: 'POST',
        body: data,
        requiresAuth: false,
      });
      if (result?.token) {
        setToken(result.token);
      }
      return result;
    },
    resendOtp: async (email) => {
      return request('/auth/resend-otp', {
        method: 'POST',
        body: { email },
        requiresAuth: false,
      });
    },
    resetPasswordRequest: async (email) => {
      return request('/auth/forgot-password', {
        method: 'POST',
        body: { email },
        requiresAuth: false,
      });
    },
    resetPassword: async (data) => {
      return request('/auth/reset-password', {
        method: 'POST',
        body: data,
        requiresAuth: false,
      });
    },
    updateMe: async (data) => {
      return request('/auth/me', {
        method: 'PUT',
        body: data,
      });
    },
    logout: () => {
      clearToken();
    },
    getMe: async () => {
      return request('/auth/me');
    },
    setToken,
    getToken,
  },
  entities: {
    Product: createEntityApi('Product'),
    Category: createEntityApi('Category'),
    CartItem: createEntityApi('CartItem'),
    WishlistItem: createEntityApi('WishlistItem'),
    Collection: createEntityApi('Collection'),
    Coupon: createEntityApi('Coupon'),
    Review: createEntityApi('Review'),
    Order: createEntityApi('Order'),
    OrderItem: createEntityApi('OrderItem'),
    Address: createEntityApi('Address'),
    StoreSettings: createEntityApi('StoreSettings'),
    PaymentSettings: createEntityApi('PaymentSettings'),
    Banner: createEntityApi('Banner'),
    Newsletter: createEntityApi('Newsletter'),
    UserActivity: createEntityApi('UserActivity'),
  },
};
