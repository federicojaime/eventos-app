// apiService.js - Servicio para comunicación con la API

// URL base de la API
const API_BASE_URL = 'http://localhost/api-eventos';

// Clase para gestionar tokens
class TokenManager {
  static getToken() {
    return localStorage.getItem('auth_token');
  }

  static setToken(token) {
    localStorage.setItem('auth_token', token);
  }

  static removeToken() {
    localStorage.removeItem('auth_token');
  }

  static isAuthenticated() {
    return !!this.getToken();
  }
}

// Clase principal del servicio de API
class ApiService {
  // Métodos de autenticación
  static async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      
      if (data.ok && data.data.jwt) {
        TokenManager.setToken(data.data.jwt);
      }
      
      return data;
    } catch (error) {
      console.error('Error en login:', error);
      return {
        ok: false,
        msg: 'Error en la conexión con el servidor',
        data: null
      };
    }
  }
  
  static async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/user/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error en registro:', error);
      return {
        ok: false,
        msg: 'Error en la conexión con el servidor',
        data: null
      };
    }
  }
  
  static logout() {
    TokenManager.removeToken();
  }
  
  // Método para verificar autenticación
  static async validateToken() {
    const token = TokenManager.getToken();
    if (!token) {
      return { ok: false };
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/user/token/validate`, {
        headers: {
          'Authorization': token
        }
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error validando token:', error);
      return { ok: false };
    }
  }
  
  // Métodos para eventos
  static async getEvents(limit = 10, offset = 0) {
    try {
      const response = await fetch(`${API_BASE_URL}/events?limit=${limit}&offset=${offset}`);
      return await response.json();
    } catch (error) {
      console.error('Error obteniendo eventos:', error);
      return {
        ok: false,
        msg: 'Error en la conexión con el servidor',
        data: []
      };
    }
  }
  
  static async getEvent(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/event/${id}`);
      return await response.json();
    } catch (error) {
      console.error(`Error obteniendo evento ${id}:`, error);
      return {
        ok: false,
        msg: 'Error en la conexión con el servidor',
        data: null
      };
    }
  }
  
  static async getUserEvents(limit = 10, offset = 0) {
    if (!TokenManager.isAuthenticated()) {
      return {
        ok: false,
        msg: 'Usuario no autenticado',
        data: []
      };
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/user/events?limit=${limit}&offset=${offset}`, {
        headers: {
          'Authorization': TokenManager.getToken()
        }
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error obteniendo eventos del usuario:', error);
      return {
        ok: false,
        msg: 'Error en la conexión con el servidor',
        data: []
      };
    }
  }
  
  static async createEvent(eventData) {
    if (!TokenManager.isAuthenticated()) {
      return {
        ok: false,
        msg: 'Usuario no autenticado',
        data: null
      };
    }
    
    try {
      // Usar FormData para manejar archivos
      const formData = new FormData();
      
      // Agregar la imagen si existe
      if (eventData.flyerImage) {
        formData.append('flyerImage', eventData.flyerImage);
      }
      
      // Agregar el resto de los campos
      Object.keys(eventData).forEach(key => {
        // Ignorar la imagen que ya se agregó
        if (key !== 'flyerImage') {
          // Si es un objeto (como socialMedia o coordenadas), convertirlo a JSON
          if (typeof eventData[key] === 'object' && eventData[key] !== null) {
            formData.append(key, JSON.stringify(eventData[key]));
          } else {
            formData.append(key, eventData[key]);
          }
        }
      });
      
      const response = await fetch(`${API_BASE_URL}/event`, {
        method: 'POST',
        headers: {
          'Authorization': TokenManager.getToken()
        },
        body: formData
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error creando evento:', error);
      return {
        ok: false,
        msg: 'Error en la conexión con el servidor',
        data: null
      };
    }
  }
  
  static async updateEvent(id, eventData) {
    if (!TokenManager.isAuthenticated()) {
      return {
        ok: false,
        msg: 'Usuario no autenticado',
        data: null
      };
    }
    
    try {
      // Usar FormData para manejar archivos
      const formData = new FormData();
      
      // Agregar la imagen si existe
      if (eventData.flyerImage) {
        formData.append('flyerImage', eventData.flyerImage);
      }
      
      // Agregar el resto de los campos
      Object.keys(eventData).forEach(key => {
        // Ignorar la imagen que ya se agregó
        if (key !== 'flyerImage') {
          // Si es un objeto (como socialMedia o coordenadas), convertirlo a JSON
          if (typeof eventData[key] === 'object' && eventData[key] !== null) {
            formData.append(key, JSON.stringify(eventData[key]));
          } else {
            formData.append(key, eventData[key]);
          }
        }
      });
      
      const response = await fetch(`${API_BASE_URL}/event/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': TokenManager.getToken()
        },
        body: formData
      });
      
      return await response.json();
    } catch (error) {
      console.error(`Error actualizando evento ${id}:`, error);
      return {
        ok: false,
        msg: 'Error en la conexión con el servidor',
        data: null
      };
    }
  }
  
  static async deleteEvent(id) {
    if (!TokenManager.isAuthenticated()) {
      return {
        ok: false,
        msg: 'Usuario no autenticado',
        data: null
      };
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/event/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': TokenManager.getToken()
        }
      });
      
      return await response.json();
    } catch (error) {
      console.error(`Error eliminando evento ${id}:`, error);
      return {
        ok: false,
        msg: 'Error en la conexión con el servidor',
        data: null
      };
    }
  }
}

export default ApiService;
export { TokenManager };