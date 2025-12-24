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

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  private async request(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
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

  async deleteSurvey(id: number): Promise<void> {
    return this.request(`/surveys/${id}`, {
      method: 'DELETE',
    });
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

  async deleteQuestion(id: number): Promise<void> {
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
