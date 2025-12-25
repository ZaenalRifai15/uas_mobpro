import { API_URL } from '@/constants/api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'responden';
  created_at: string;
}

export interface Survey {
  id: number;
  title: string;
  description?: string;
  created_by: number;
  is_active: boolean;
  created_at: string;
  creator?: User;
  questions?: Question[];
}

export interface Question {
  id: number;
  survey_id: number;
  question_text: string;
  order: number;
}

export interface Response {
  id: number;
  survey_id: number;
  user_id: number;
  submitted_at: string;
}

export interface Answer {
  id: number;
  response_id: number;
  question_id: number;
  answer: boolean;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  // Make request method public for custom API calls
  async request(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(typeof options.headers === 'object' && options.headers !== null ? (options.headers as Record<string, string>) : {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const url = `${API_URL}${endpoint}`;
    console.log(`[API] Request: ${options.method || 'GET'} ${url}`);
    console.log('[API] Headers:', headers);
    if (options.body) {
      console.log('[API] Body:', options.body);
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log(`[API] Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        // Try to read JSON error message if available, otherwise use generic message
        let errorMsg = `Request failed with status ${response.status}`;
        try {
          const error = await response.json();
          console.error('[API] Error response:', error);
          errorMsg = error.message || errorMsg;
        } catch (_e) {
          console.error('[API] Could not parse error response as JSON');
        }
        throw new Error(errorMsg);
      }

      // Handle empty / no-content responses (e.g., 204) gracefully
      const text = await response.text();
      console.log('[API] Response text:', text);
      
      if (!text) return { success: true, message: 'Operation completed successfully' };
      try {
        const jsonData = JSON.parse(text);
        console.log('[API] Parsed JSON:', jsonData);
        return jsonData;
      } catch (_e) {
        console.warn('[API] Could not parse response as JSON, returning wrapped text');
        // If response is not valid JSON, return the raw text wrapped in object
        return { success: true, message: text };
      }
    } catch (error) {
      console.error('[API] Request error:', error);
      throw error;
    }
  }

  // Auth
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(name: string, email: string, password: string, role: string = 'responden') {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });
  }

  // Surveys
  async getSurveys(): Promise<Survey[]> {
    return this.request('/surveys');
  }

  async getSurvey(id: number): Promise<Survey> {
    return this.request(`/surveys/${id}`);
  }

  async createSurvey(data: {
    title: string;
    description?: string;
    created_by: number;
  }): Promise<Survey> {
    return this.request('/surveys', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSurvey(id: number, data: Partial<Survey>): Promise<Survey> {
    return this.request(`/surveys/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSurvey(id: number): Promise<DeleteResponse> {
    console.log('[API] deleteSurvey called with ID:', id);
    console.log('[API] Request URL:', `${API_URL}/surveys/${id}`);
    
    try {
      const result = await this.request(`/surveys/${id}`, {
        method: 'DELETE',
      });
      console.log('[API] deleteSurvey response:', result);
      return result;
    } catch (error) {
      console.error('[API] deleteSurvey error:', error);
      throw error;
    }
  }

  // Questions
  async createQuestion(data: {
    survey_id: number;
    question_text: string;
    order: number;
  }): Promise<Question> {
    return this.request('/questions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteQuestion(id: number): Promise<DeleteResponse> {
    return this.request(`/questions/${id}`, {
      method: 'DELETE',
    });
  }

  // Responses
  async createResponse(data: {
    survey_id: number;
    user_id: number;
  }): Promise<Response> {
    return this.request('/responses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Answers
  async createAnswer(data: {
    response_id: number;
    question_id: number;
    answer: boolean;
  }): Promise<Answer> {
    return this.request('/answers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Analytics
  async generateAnalytics(surveyId: number) {
    return this.request(`/surveys/${surveyId}/generate-analytics`, {
      method: 'POST',
    });
  }

  async getSurveyAnalytics(surveyId: number) {
    return this.request(`/surveys/${surveyId}/analytics`);
  }
}

export default new ApiService();
