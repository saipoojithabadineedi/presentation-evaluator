// API service for connecting React Frontend to Spring Boot backend

const API_BASE_URL = 'http://localhost:8080/api/v1';

function handleNetworkError(err: any, defaultMsg: string): never {
  if (err.name === 'TypeError' || err.message?.includes('fetch') || err.message?.includes('Failed to fetch')) {
    throw new Error('Backend server on port 8080 is unreachable. Please ensure the Spring Boot server is running.');
  }
  throw err instanceof Error ? err : new Error(defaultMsg);
}

export async function loginUserApi(email: string, pass: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Authentication failed. Please check your credentials.');
    }
    return data;
  } catch (err: any) {
    handleNetworkError(err, 'Authentication failed.');
  }
}

export async function registerUserApi(name: string, email: string, pass: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password: pass }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Registration failed.');
    }
    return data;
  } catch (err: any) {
    handleNetworkError(err, 'Registration failed.');
  }
}

export async function requestPasswordResetApi(email: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to request verification code.');
    }
    return data;
  } catch (err: any) {
    handleNetworkError(err, 'Failed to request verification code.');
  }
}

export async function verifyOtpApi(email: string, otp: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Invalid verification code.');
    }
    return data;
  } catch (err: any) {
    handleNetworkError(err, 'Invalid verification code.');
  }
}

export async function confirmPasswordResetApi(email: string, resetToken: string, newPass: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, resetToken, newPassword: newPass }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to reset password.');
    }
    return data;
  } catch (err: any) {
    handleNetworkError(err, 'Failed to reset password.');
  }
}

export async function startAIAnalysisApi(payload: {
  userId?: string;
  title: string;
  fileType: 'video' | 'audio' | 'slides';
  fileName: string;
  fileSize: string;
  durationSeconds?: number;
  wpm?: number;
  clarityScore?: number;
  fillerWordCount?: number;
  fillerWordRate?: number;
  silenceRatioPercent?: number;
  deliveryScore?: number;
}) {
  try {
    const res = await fetch(`${API_BASE_URL}/evaluations/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Backend AI analysis failed');
    return await res.json();
  } catch (error) {
    console.warn('Backend API connection offline, using client-side AI engine fallback:', error);
    return null;
  }
}

export async function performVectorSearchApi(queryText: string, limit = 5) {
  try {
    const res = await fetch(`${API_BASE_URL}/vector-search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ queryText, limit }),
    });
    if (!res.ok) throw new Error('Backend vector search failed');
    return await res.json();
  } catch (error) {
    console.warn('Backend vector search offline:', error);
    return [];
  }
}
