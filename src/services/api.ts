// API service for connecting React Frontend to Spring Boot + PostgreSQL pgvector backend

const API_BASE_URL = 'http://localhost:8080/api/v1';

export async function loginUserApi(email: string, pass: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass }),
    });
    if (!res.ok) throw new Error('Backend authentication failed');
    return await res.json();
  } catch (error) {
    console.warn('Backend connection unavailable, using client-side auth fallback:', error);
    return null;
  }
}

export async function registerUserApi(name: string, email: string, pass: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password: pass }),
    });
    if (!res.ok) throw new Error('Backend registration failed');
    return await res.json();
  } catch (error) {
    console.warn('Backend connection unavailable, using client-side registration fallback:', error);
    return null;
  }
}

export async function startAIAnalysisApi(payload: {
  userId?: string;
  title: string;
  fileType: 'video' | 'audio' | 'slides';
  fileName: string;
  fileSize: string;
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
