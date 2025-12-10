// profile.js - Versión súper simplificada
class ProfileManager {
    constructor() {
        this.init();
    }

    init() {
        // 1. Verificar si hay usuario
        const user = authManager.getCurrentUser();
        
        if (!user) {
            this.showNotLoggedIn();
            return;
        }

        // 2. Cargar perfil
        this.loadProfile(user);
        
        // 3. Setup de eventos
        this.setupEvents();
    }

    showNotLoggedIn() {
        // Reemplazar todo el contenido de la página
        document.body.innerHTML = `
            <style>
                .not-logged-in {
                    text-align: center;
                    padding: 100px 20px;
                    background: #0f0f0f;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                }
                .not-logged-in h1 {
                    color: #e50914;
                    margin-bottom: 20px;
                }
                .not-logged-in p {
                    color: #ccc;
                    font-size: 1.2rem;
                    margin-bottom: 30px;
                }
                .login-btn {
                    background: #e50914;
                    color: white;
                    padding: 12px 30px;
                    border-radius: 5px;
                    text-decoration: none;
                    font-weight: bold;
                    display: inline-block;
                    margin-top: 20px;
                }
                .login-btn:hover {
                    background: #f40612;
                }
            </style>
            <div class="not-logged-in">
                <h1>🔒 Acceso Restringido</h1>
                <p>Debes iniciar sesión para ver tu perfil</p>
                <a href="index.html" class="login-btn">Ir a Iniciar Sesión</a>
                <p style="margin-top: 30px; color: #888; font-size: 0.9rem;">
                    Si crees que esto es un error, verifica que hayas iniciado sesión correctamente.
                </p>
            </div>
        `;
    }

    loadProfile(user) {
        console.log('👤 Cargando perfil para:', user.username || user.email);
        
        // Datos básicos
        document.getElementById('profileUsername').textContent = user.username || 'Usuario';
        document.getElementById('profileEmail').textContent = user.email || 'Sin email';
        
        // Avatar
        if (user.avatar) {
            document.getElementById('avatarImage').src = user.avatar;
            document.getElementById('avatarImage').style.display = 'block';
            document.getElementById('defaultAvatarIcon').style.display = 'none';
            document.getElementById('removeAvatarBtn').style.display = 'inline-block';
        }
        
        // Estadísticas
        this.loadStats(user);
        
        // Contenido
        this.loadContent(user);
    }

    loadStats(user) {
        document.getElementById('ratedCount').textContent = user.ratings ? Object.keys(user.ratings).length : 0;
        document.getElementById('listsCount').textContent = user.lists ? user.lists.length : 0;
        document.getElementById('commentsCountProfile').textContent = user.comments ? user.comments.length : 0;
    }

    loadContent(user) {
        // Series valoradas
        this.loadRatedSeries(user);
        
        // Listas
        this.loadLists(user);
    }

    loadRatedSeries(user) {
        const container = document.getElementById('ratedSeries');
        if (!container) return;
        
        const ratings = user.ratings || {};
        
        if (Object.keys(ratings).length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
                    <i class="fas fa-star" style="color: #666; font-size: 2rem;"></i>
                    <h4>No has valorado series</h4>
                    <p>¡Explora y comparte tu opinión!</p>
                    <a href="search.html" class="btn btn-primary" style="margin-top: 1rem;">
                        <i class="fas fa-search"></i> Buscar series
                    </a>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
                    <i class="fas fa-star" style="color: #ffd700; font-size: 2rem;"></i>
                    <h4>${Object.keys(ratings).length} series valoradas</h4>
                    <p>Pronto verás la lista completa aquí</p>
                </div>
            `;
        }
    }

    loadLists(user) {
        const container = document.getElementById('userLists');
        if (!container) return;
        
        const lists = user.lists || [];
        
        if (lists.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <i class="fas fa-list" style="color: #666; font-size: 2rem;"></i>
                    <h4>No tienes listas</h4>
                    <p>Crea listas para organizar tus series favoritas</p>
                    <button class="btn btn-primary" onclick="profileManager.createList()" style="margin-top: 1rem;">
                        <i class="fas fa-plus"></i> Crear primera lista
                    </button>
                </div>
            `;
        } else {
            container.innerHTML = '';
            lists.forEach(list => {
                const div = document.createElement('div');
                div.className = 'list-card';
                div.innerHTML = `
                    <h4>${list.name}</h4>
                    <p>${list.description || 'Sin descripción'}</p>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
                        <small>${list.series?.length || 0} series</small>
                        <button class="btn btn-small btn-danger" onclick="this.closest('.list-card').remove()">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                container.appendChild(div);
            });
        }
    }

    setupEvents() {
        // Logout ya está manejado por authManager
        
        // Avatar
        document.getElementById('changeAvatarBtn')?.addEventListener('click', () => {
            this.changeAvatar();
        });
        
        document.getElementById('removeAvatarBtn')?.addEventListener('click', () => {
            this.removeAvatar();
        });
        
        // Crear lista
        document.getElementById('createListBtn')?.addEventListener('click', () => {
            this.createList();
        });
    }

    changeAvatar() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            if (!file.type.startsWith('image/')) {
                alert('Solo se permiten imágenes');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const user = authManager.getCurrentUser();
                if (user) {
                    user.avatar = e.target.result;
                    localStorage.setItem('seriesbox_user', JSON.stringify(user));
                    
                    document.getElementById('avatarImage').src = e.target.result;
                    document.getElementById('avatarImage').style.display = 'block';
                    document.getElementById('defaultAvatarIcon').style.display = 'none';
                    document.getElementById('removeAvatarBtn').style.display = 'inline-block';
                    
                    alert('¡Avatar actualizado!');
                }
            };
            reader.readAsDataURL(file);
        };
        
        input.click();
    }

    removeAvatar() {
        if (!confirm('¿Eliminar avatar?')) return;
        
        const user = authManager.getCurrentUser();
        if (user) {
            delete user.avatar;
            localStorage.setItem('seriesbox_user', JSON.stringify(user));
            
            document.getElementById('avatarImage').style.display = 'none';
            document.getElementById('defaultAvatarIcon').style.display = 'block';
            document.getElementById('removeAvatarBtn').style.display = 'none';
            
            alert('Avatar eliminado');
        }
    }

    createList() {
        const name = prompt('Nombre de la lista:');
        if (!name) return;
        
        const description = prompt('Descripción (opcional):') || '';
        
        const user = authManager.getCurrentUser();
        if (user) {
            if (!user.lists) user.lists = [];
            
            user.lists.push({
                id: Date.now(),
                name: name,
                description: description,
                series: []
            });
            
            localStorage.setItem('seriesbox_user', JSON.stringify(user));
            this.loadLists(user);
            alert('¡Lista creada!');
        }
    }
}

// Crear instancia global
let profileManager;

// Inicializar cuando cargue la página
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando ProfileManager...');
    
    // Verificar que authManager esté disponible
    if (typeof authManager === 'undefined') {
        console.error('❌ authManager no está definido');
        alert('Error: No se pudo cargar el sistema de autenticación');
        return;
    }
    
    profileManager = new ProfileManager();
    window.profileManager = profileManager;
});