// auth-backend.js - Versión mínima
const backendAuth = {
    baseUrl: 'http://localhost:8080/api/usuarios',
    
    async login(email, password) {
        try {
            const response = await fetch(`${this.baseUrl}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, contrasenya: password })
            });
            
            const data = await response.json();
            
            if (data.success && data.user) {
                // Guardar en localStorage
                const userData = {
                    ...data.user,
                    isAuthenticated: true,
                    joinDate: new Date().toLocaleDateString('es-ES')
                };
                
                localStorage.setItem('seriesbox_user', JSON.stringify(userData));
                return { success: true, user: userData };
            }
            
            return { success: false, message: data.message || 'Error' };
            
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Error de conexión' };
        }
    },
    
    async register(username, email, password, confirmPassword) {
        try {
            const response = await fetch(`${this.baseUrl}/registro`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username, email, contrasenya: password, confirmarContrasenya: confirmPassword
                })
            });
            
            const data = await response.json();
            
            if (data.success && data.user) {
                // Auto-login
                return this.login(email, password);
            }
            
            return { success: false, message: data.message || 'Error' };
            
        } catch (error) {
            console.error('Register error:', error);
            return { success: false, message: 'Error de conexión' };
        }
    },
    
    getCurrentUser() {
        const saved = localStorage.getItem('seriesbox_user');
        return saved ? JSON.parse(saved) : null;
    },
    
    isAuthenticated() {
        const user = this.getCurrentUser();
        return user && user.isAuthenticated === true;
    },
    
    logout() {
        localStorage.removeItem('seriesbox_user');
        window.location.href = 'index.html';
    }
};

window.backendAuth = backendAuth;