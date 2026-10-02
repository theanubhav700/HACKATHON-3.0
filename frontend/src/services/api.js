const rawUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
const API_BASE = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;

const getHeaders = () => {
  const token = localStorage.getItem('fake_money_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // ─── Auth ───
  register: async (userData) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data;
  },

  login: async (credentials) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data;
  },

  logout: async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: getHeaders(),
      });
    } catch {
      // Ignore logout fetch error
    }
  },

  // ─── User ───
  getProfile: async () => {
    const res = await fetch(`${API_BASE}/user/profile`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch profile');
    return data;
  },

  getBalance: async () => {
    const res = await fetch(`${API_BASE}/user/balance`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch balance');
    return data;
  },

  changePassword: async (passwords) => {
    const res = await fetch(`${API_BASE}/user/password`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(passwords),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update password');
    return data;
  },

  changePin: async (pins) => {
    const res = await fetch(`${API_BASE}/user/pin`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(pins),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update PIN');
    return data;
  },

  addVirtualFunds: async ({ amount, paymentPin }) => {
    const res = await fetch(`${API_BASE}/user/add-virtual-funds`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ amount, paymentPin }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to add virtual funds');
    return data;
  },

  // ─── Payments ───
  verifyPin: async (pin) => {
    const res = await fetch(`${API_BASE}/payments/verify-pin`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ pin }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'PIN verification failed');
    return data;
  },

  getRegisteredRecipients: async () => {
    const res = await fetch(`${API_BASE}/payments/registered-recipients`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch registered recipients');
    return data;
  },

  lookupRecipient: async (identifier) => {
    const res = await fetch(`${API_BASE}/payments/lookup-recipient?identifier=${encodeURIComponent(identifier)}`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Recipient not found');
    return data;
  },

  makePayment: async (paymentData) => {
    const res = await fetch(`${API_BASE}/payments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(paymentData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Payment processing failed');
    return data;
  },

  receivePayment: async (receiveData) => {
    const res = await fetch(`${API_BASE}/payments/receive-simulated`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(receiveData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to receive simulated payment');
    return data;
  },

  // ─── Transactions ───
  getTransactions: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'ALL') query.append('status', params.status);
    if (params.search) query.append('search', params.search);

    const res = await fetch(`${API_BASE}/transactions?${query.toString()}`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch transactions');
    return data;
  },

  getTransactionById: async (transactionId) => {
    const res = await fetch(`${API_BASE}/transactions/${transactionId}`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch transaction details');
    return data;
  },

  clearTransactions: async () => {
    const res = await fetch(`${API_BASE}/transactions/clear`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to clear transactions');
    return data;
  },

  // ─── Feedbacks ───
  getFeedbacks: async () => {
    const res = await fetch(`${API_BASE}/feedback`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch feedbacks');
    return data;
  },

  submitFeedback: async (feedbackData) => {
    const res = await fetch(`${API_BASE}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedbackData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to submit feedback');
    return data;
  },

  deleteFeedback: async (id) => {
    const res = await fetch(`${API_BASE}/feedback/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete feedback');
    return data;
  },

  clearFeedbacks: async () => {
    const res = await fetch(`${API_BASE}/feedback`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to clear feedbacks');
    return data;
  },
};
