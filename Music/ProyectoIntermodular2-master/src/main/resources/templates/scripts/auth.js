// auth.js - Versión corregida y funcional
class AuthManager {
    constructor() {
        this.setupEventListeners();
        this.checkAuthState();
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginFormElement');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('registerFormElement');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Form switchers
        document.getElementById('showRegister')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showRegisterForm();
        });

        document.getElementById('showLogin')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginForm();
        });

        // Logout button
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            this.handleLogout();
        });
    }

    showLoginForm() {
        document.getElementById('loginForm').classList.add('active');
        document.getElementById('registerForm').classList.remove('active');
    }

    showRegisterForm() {
        document.getElementById('registerForm').classList.add('active');
        document.getElementById('loginForm').classList.remove('active');
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        if (!email || !password) {
            alert('Por favor completa todos los campos');
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/api/usuarios/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, contrasenya: password })
            });
            
            const data = await response.json();
            
            if (data.success && data.user) {
                // Crear objeto de usuario completo
                const userData = {
                    id: data.user.id,
                    username: data.user.username,
                    email: data.user.email,
                    isAuthenticated: true,
                    joinDate: new Date().toLocaleDateString('es-ES'),
                    ratings: {},
                    lists: [],
                    comments: []
                };
                
                // GUARDAR EN AMBAS CLAVES PARA COMPATIBILIDAD
                localStorage.setItem('seriesbox_user', JSON.stringify(userData));
                localStorage.setItem('currentUser', JSON.stringify(userData));
                
                alert('¡Login exitoso!');
                window.location.href = 'home.html';
            } else {
                alert(data.message || 'Error en login');
            }
        } catch (error) {
            alert('Error de conexión: ' + error.message);
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const email = document.getElementById('registerEmail').value;
        const username = document.getElementById('registerUsername').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        
        // Validaciones básicas
        if (!email || !username || !password || !confirmPassword) {
            alert('Por favor completa todos los campos');
            return;
        }
        
        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }
        
        if (password.length < 6) {
            alert('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/api/usuarios/registro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    email,
                    contrasenya: password,
                    confirmarContrasenya: confirmPassword
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Auto-login después del registro
                await this.handleLoginAfterRegister(email, password);
            } else {
                alert(data.message || 'Error en registro');
            }
        } catch (error) {
            alert('Error de conexión: ' + error.message);
        }
    }

    async handleLoginAfterRegister(email, password) {
        try {
            const response = await fetch('http://localhost:8080/api/usuarios/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, contrasenya: password })
            });
            
            const data = await response.json();
            
            if (data.success && data.user) {
                const userData = {
                    id: data.user.id,
                    username: data.user.username,
                    email: data.user.email,
                    isAuthenticated: true,
                    joinDate: new Date().toLocaleDateString('es-ES'),
                    ratings: {},
                    lists: [],
                    comments: []
                };
                
                localStorage.setItem('seriesbox_user', JSON.stringify(userData));
                localStorage.setItem('currentUser', JSON.stringify(userData));
                
                alert('¡Registro exitoso!');
                window.location.href = 'home.html';
            }
        } catch (error) {
            alert('Error en auto-login: ' + error.message);
        }
    }

    handleLogout() {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            localStorage.removeItem('seriesbox_user');
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        }
    }

    checkAuthState() {
        const user = this.getCurrentUser();
        const currentPage = window.location.pathname.split('/').pop();
        
        // Páginas que requieren autenticación
        const authPages = ['home.html', 'search.html', 'profile.html', 'series-detail.html', 'top-rated.html'];
        
        // Página de login
        const loginPage = 'index.html';
        
        // Si está en página protegida y no hay usuario, redirigir a login
        if (authPages.includes(currentPage) && !user) {
            window.location.href = loginPage;
        }
        
        // Si está en login y ya está autenticado, redirigir a home
        if (currentPage === loginPage && user) {
            window.location.href = 'home.html';
        }
    }

    getCurrentUser() {
        // Primero intentar con seriesbox_user
        let user = localStorage.getItem('seriesbox_user');
        if (user) {
            return JSON.parse(user);
        }
        
        // Luego con currentUser
        user = localStorage.getItem('currentUser');
        if (user) {
            return JSON.parse(user);
        }
        
        return null;
    }

    isAuthenticated() {
        return this.getCurrentUser() !== null;
    }
}

// Crear instancia global
const authManager = new AuthManager();
window.authManager = authManager;