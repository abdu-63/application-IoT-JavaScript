import { jwtDecode } from 'jwt-decode';

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
}

interface TokenPayload {
  userId: string;
  email: string;
  role: 'admin' | 'user';
  exp: number;
  iat: number;
}

interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

const API_BASE_URL = 'http://localhost:3000/api';

export class AuthService {
  private static readonly TOKEN_KEY = 'iot_token';
  private static readonly USER_KEY = 'iot_user';

  // Vérification du token
  static verifyToken(token: string): TokenPayload | null {
    try {
      const decoded: TokenPayload = jwtDecode(token);
      
      // Vérifier l'expiration
      if (decoded.exp * 1000 < Date.now()) {
        return null;
      }

      return decoded;
    } catch {
      return null;
    }
  }

  // Login avec validation
  static async login(email: string, password: string): Promise<{ user: User; token: string } | null> {
    // Validation des entrées
    if (!email || !password) {
      throw new Error('Email et mot de passe requis');
    }

    // Validation format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Format email invalide');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur de connexion');
      }

      const data: AuthResponse = await response.json();
      
      // Sauvegarder le token et l'utilisateur
      localStorage.setItem(this.TOKEN_KEY, data.token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
      
      // Log d'activité
      this.logActivity('login', data.user.id);

      return { user: data.user, token: data.token };
    } catch (error: any) {
      throw new Error(error.message || 'Erreur de connexion');
    }
  }

  // Register
  static async register(email: string, password: string): Promise<{ user: User; token: string }> {
    // Validation des entrées
    if (!email || !password) {
      throw new Error('Email et mot de passe requis');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Format email invalide');
    }

    if (password.length < 6) {
      throw new Error('Le mot de passe doit contenir au moins 6 caractères');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur d\'inscription');
      }

      const data: AuthResponse = await response.json();
      
      // Sauvegarder le token et l'utilisateur
      localStorage.setItem(this.TOKEN_KEY, data.token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
      
      this.logActivity('register', data.user.id);

      return { user: data.user, token: data.token };
    } catch (error: any) {
      throw new Error(error.message || 'Erreur d\'inscription');
    }
  }

  // Logout
  static logout(): void {
    const user = this.getCurrentUser();
    if (user) {
      this.logActivity('logout', user.id);
    }
    
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem('isAuthenticated'); // Ancien système
  }

  // Obtenir l'utilisateur courant
  static getCurrentUser(): User | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return null;

    const payload = this.verifyToken(token);
    if (!payload) {
      this.logout();
      return null;
    }

    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  // Vérifier si authentifié
  static isAuthenticated(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return false;

    const payload = this.verifyToken(token);
    return payload !== null;
  }

  // Logger les activités
  private static logActivity(action: string, userId: string): void {
    const logs = JSON.parse(localStorage.getItem('activity_logs') || '[]');
    logs.push({
      id: Date.now().toString(),
      action,
      userId,
      timestamp: new Date().toISOString(),
      ip: 'localhost' // En production: obtenir l'IP réelle
    });
    
    // Garder seulement les 100 derniers logs
    if (logs.length > 100) {
      logs.splice(0, logs.length - 100);
    }
    
    localStorage.setItem('activity_logs', JSON.stringify(logs));
  }

  // Obtenir les logs d'activité
  static getActivityLogs() {
    return JSON.parse(localStorage.getItem('activity_logs') || '[]');
  }
}
