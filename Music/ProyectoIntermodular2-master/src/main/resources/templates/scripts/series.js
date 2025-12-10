// Series data and functionality - Versión con modal de trailer
let seriesData = [];

// Sample comments
const sampleComments = [
    {
        id: 1,
        seriesId: 1,
        user: "AnimeLover23",
        date: "15 Oct 2023",
        text: "Increíble serie! La animación y la trama son espectaculares. Definitivamente una de las mejores que he visto."
    }
];

// Servicio para comunicarse con el backend Spring Boot
class ApiService {
    constructor() {
        this.baseUrl = 'http://localhost:8080/api';
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (options.body) {
            config.body = JSON.stringify(options.body);
        }

        try {
            const response = await fetch(url, config);
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const contentLength = response.headers.get('content-length');
            if (contentLength === '0') {
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    async getAllSeries() {
        return this.request('/series');
    }

    async getSeriesById(id) {
        return this.request(`/series/${id}`);
    }

    async getTopRatedSeries() {
        return this.request('/series/top-rated');
    }
}

// Instancia global del servicio
const apiService = new ApiService();

// Series functionality - Versión con modal de trailer
class SeriesManager {
    constructor() {
        this.isLoading = false;
        this.init();
    }

    async init() {
        await this.loadInitialData();
        this.setupModalEvents();
    }

    async loadInitialData() {
        this.showLoading('Cargando series...');
        
        try {
            const backendSeries = await apiService.getAllSeries();
            seriesData = backendSeries.map(series => this.convertSeriesToFrontendFormat(series));
            window.seriesData = seriesData;
            
            this.hideLoading();
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showNotification('Error al cargar las series', 'error');
            seriesData = this.getFallbackData();
            window.seriesData = seriesData;
            this.hideLoading();
        }
    }

    getFallbackData() {
        return [
            {
                id: 1,
                title: "The Last of Us",
                rating: 4.8,
                year: 2023,
                episodes: 9,
                status: "Finalizado",
                genres: ["Drama", "Post-apocalíptico", "Aventura"],
                synopsis: "Un hombre rudo lleva a una niña de 14 años a través de un Estados Unidos postapocalíptico.",
                poster: "https://cdn.myanimelist.net/images/anime/1015/138006.jpg",
                trailer: "https://www.youtube.com/embed/2f7C-8n0Rr0"
            }
        ];
    }

    showLoading(message = 'Cargando...') {
        this.hideLoading();
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading';
        loadingDiv.id = 'globalLoading';
        loadingDiv.innerHTML = `${message}`;
        document.body.appendChild(loadingDiv);
        this.isLoading = true;
    }

    hideLoading() {
        const loadingDiv = document.getElementById('globalLoading');
        if (loadingDiv) {
            loadingDiv.remove();
        }
        this.isLoading = false;
    }

    showNotification(message, type = 'info') {
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notif => notif.remove());

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;

        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 1rem 1.5rem;
                    border-radius: 6px;
                    color: white;
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    max-width: 400px;
                    animation: slideIn 0.3s ease;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                }
                .notification-info { background: #007bff; }
                .notification-success { background: #28a745; }
                .notification-warning { background: #ffc107; color: #000; }
                .notification-error { background: #dc3545; }
                .notification-close {
                    background: none;
                    border: none;
                    color: inherit;
                    font-size: 1.2rem;
                    cursor: pointer;
                    padding: 0;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }

        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    setupModalEvents() {
        // Trailer modal
        const closeTrailerModal = document.getElementById('closeTrailerModal');
        const trailerModal = document.getElementById('trailerModal');

        if (closeTrailerModal && trailerModal) {
            closeTrailerModal.addEventListener('click', () => {
                this.closeTrailerModal();
            });

            trailerModal.addEventListener('click', (e) => {
                if (e.target === trailerModal) {
                    this.closeTrailerModal();
                }
            });

            // Cerrar con tecla ESC
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && trailerModal.style.display === 'flex') {
                    this.closeTrailerModal();
                }
            });
        }
    }

    closeTrailerModal() {
        const trailerModal = document.getElementById('trailerModal');
        const trailerVideo = document.getElementById('trailerVideo');
        
        if (trailerModal) {
            trailerModal.style.display = 'none';
        }
        if (trailerVideo) {
            // Pausar el video y resetear la fuente
            trailerVideo.src = '';
        }
    }

    openTrailerModal(trailerUrl) {
        const trailerModal = document.getElementById('trailerModal');
        const trailerVideo = document.getElementById('trailerVideo');
        
        if (trailerModal && trailerVideo) {
            // Añadir parámetros para mejor experiencia
            const enhancedUrl = trailerUrl + '?autoplay=1&rel=0&modestbranding=1';
            trailerVideo.src = enhancedUrl;
            trailerModal.style.display = 'flex';
            
            // Enfocar el modal para que funcione ESC
            trailerModal.focus();
        }
    }

    // Convertir datos del backend al formato esperado por el frontend
    convertSeriesToFrontendFormat(series) {
        const genreOptions = [
            ["Acción", "Aventura", "Fantasía"],
            ["Drama", "Psicológico", "Misterio"],
            ["Comedia", "Romance", "Vida cotidiana"],
            ["Ciencia Ficción", "Cyberpunk", "Thriller"]
        ];
        
        const randomGenres = genreOptions[Math.floor(Math.random() * genreOptions.length)];
        
        return {
            id: series.id_serie || series.idSerie,
            title: series.titulo,
            rating: series.rating_promedio || series.ratingPromedio || 0,
            year: series.anyo_lanzamiento || series.anyoLanzamiento,
            episodes: series.episodios,
            status: series.estado,
            genres: randomGenres,
            synopsis: series.sinopsis || "Sin sinopsis disponible",
            poster: series.poster_url || series.posterUrl || this.getDefaultPoster(series.titulo),
            trailer: series.trailer_url || series.trailerUrl // URL completa de embed de YouTube
        };
    }

    getDefaultPoster(title) {
        const defaultImages = [
            'https://cdn.myanimelist.net/images/anime/1015/138006.jpg',
            'https://cdn.myanimelist.net/images/anime/1286/99889.jpg',
            'https://cdn.myanimelist.net/images/anime/1806/126216.jpg'
        ];
        return defaultImages[Math.floor(Math.random() * defaultImages.length)];
    }

    getStatusClass(status) {
        const statusMap = {
            'Finalizado': 'status-finalizado',
            'En emision': 'status-emision',
            'En emisión': 'status-emision',
            'Proximamente': 'status-proximamente',
            'Próximamente': 'status-proximamente'
        };
        return statusMap[status] || 'status-proximamente';
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5 ? 1 : 0;
        const emptyStars = 5 - fullStars - halfStar;
        
        let starsHTML = '';
        
        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<i class="fas fa-star"></i>';
        }
        
        if (halfStar) {
            starsHTML += '<i class="fas fa-star-half-alt"></i>';
        }
        
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '<i class="far fa-star"></i>';
        }
        
        return starsHTML;
    }

    createSeriesCard(series) {
        const seriesCard = document.createElement('div');
        seriesCard.className = 'series-card';
        seriesCard.setAttribute('data-series-id', series.id);
        
        const statusClass = this.getStatusClass(series.status);
        
        seriesCard.innerHTML = `
            <div class="series-poster-container">
                <img src="${series.poster}" alt="${series.title}" class="series-poster" 
                     onerror="this.src='https://cdn.myanimelist.net/images/anime/1015/138006.jpg'">
                <div class="series-overlay">
                    <div class="series-status ${statusClass}">${series.status}</div>
                </div>
            </div>
            <div class="series-info">
                <h3 class="series-title">${series.title}</h3>
                <div class="series-rating">
                    <span class="rating-value">${series.rating.toFixed(1)}</span>
                    <div class="stars">
                        ${this.generateStars(series.rating)}
                    </div>
                </div>
                <div class="series-meta">
                    <span class="series-year">${series.year}</span>
                    <span class="series-episodes">${series.episodes} eps</span>
                </div>
            </div>
        `;

        seriesCard.addEventListener('click', () => {
            window.location.href = `series-detail.html?id=${series.id}`;
        });

        return seriesCard;
    }

    async loadSeriesGrid(containerId, seriesList = null) {
        const container = document.getElementById(containerId);
        if (!container) return;

        this.showLoading('Cargando series...');

        try {
            let dataToDisplay = seriesList || seriesData;

            container.innerHTML = '';
            
            if (dataToDisplay.length === 0) {
                container.innerHTML = `
                    <div class="no-data" style="grid-column: 1 / -1;">
                        <i class="fas fa-tv" style="font-size: 3rem; margin-bottom: 1rem; color: #666;"></i>
                        <p>No se encontraron series</p>
                    </div>
                `;
                return;
            }

            dataToDisplay.forEach(series => {
                const seriesCard = this.createSeriesCard(series);
                container.appendChild(seriesCard);
            });

        } catch (error) {
            console.error('Error loading series:', error);
            container.innerHTML = `
                <div class="error-message" style="grid-column: 1 / -1;">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error al cargar las series</p>
                </div>
            `;
        } finally {
            this.hideLoading();
        }
    }

    async loadSeriesDetail(seriesId) {
        this.showLoading('Cargando detalles de la serie...');

        try {
            const series = await apiService.getSeriesById(seriesId);
            if (!series) {
                this.showNotification('Serie no encontrada', 'error');
                window.location.href = 'home.html';
                return;
            }

            const formattedSeries = this.convertSeriesToFrontendFormat(series);

            // Actualizar la UI con los datos reales
            document.title = `SeriesBox - ${formattedSeries.title}`;
            document.getElementById('detailPoster').src = formattedSeries.poster;
            document.getElementById('detailPoster').alt = formattedSeries.title;
            document.getElementById('detailTitle').textContent = formattedSeries.title;
            document.getElementById('detailYear').textContent = formattedSeries.year;
            document.getElementById('detailEpisodes').textContent = `${formattedSeries.episodes} Episodios`;
            document.getElementById('detailStatus').textContent = formattedSeries.status;
            document.getElementById('detailRating').textContent = formattedSeries.rating.toFixed(1);
            document.getElementById('detailSynopsis').textContent = formattedSeries.synopsis;

            // Actualizar géneros
            const genresContainer = document.getElementById('detailGenres');
            if (genresContainer) {
                genresContainer.innerHTML = '';
                formattedSeries.genres.forEach(genre => {
                    const genreBadge = document.createElement('span');
                    genreBadge.className = 'genre-badge';
                    genreBadge.textContent = genre;
                    genresContainer.appendChild(genreBadge);
                });
            }

            // Actualizar estrellas
            const detailStars = document.getElementById('detailStars');
            if (detailStars) {
                detailStars.innerHTML = this.generateStars(formattedSeries.rating);
            }

            // CONFIGURACIÓN DEL TRAILER - MODAL CON IFRAME
            const trailerBtn = document.getElementById('trailerBtn');
            if (trailerBtn) {
                trailerBtn.addEventListener('click', () => {
                    if (formattedSeries.trailer && formattedSeries.trailer.trim() !== '') {
                        this.openTrailerModal(formattedSeries.trailer);
                        this.showNotification('Reproduciendo trailer...', 'info');
                    } else {
                        this.showNotification('Trailer no disponible para esta serie', 'warning');
                    }
                });
            }

            // Cargar comentarios
            this.loadComments(formattedSeries.id);

            this.showNotification(`"${formattedSeries.title}" cargada correctamente`, 'success');

        } catch (error) {
            console.error('Error loading series detail:', error);
            this.showNotification('Error al cargar los detalles de la serie', 'error');
            window.location.href = 'home.html';
        } finally {
            this.hideLoading();
        }
    }

    loadComments(seriesId) {
        const commentsList = document.getElementById('commentsList');
        const commentsCount = document.getElementById('commentsCount');

        if (!commentsList || !commentsCount) return;

        const seriesComments = sampleComments.filter(comment => comment.seriesId === seriesId);
        
        commentsList.innerHTML = '';
        commentsCount.textContent = seriesComments.length;

        if (seriesComments.length === 0) {
            commentsList.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-comments" style="font-size: 2rem; margin-bottom: 1rem; color: #666;"></i>
                    <p>No hay comentarios aún. ¡Sé el primero en comentar!</p>
                </div>
            `;
            return;
        }

        seriesComments.forEach(comment => {
            const commentElement = document.createElement('div');
            commentElement.className = 'comment';
            
            commentElement.innerHTML = `
                <div class="comment-header">
                    <span class="comment-user">${comment.user}</span>
                    <span class="comment-date">${comment.date}</span>
                </div>
                <p>${comment.text}</p>
            `;
            
            commentsList.appendChild(commentElement);
        });
    }
}

// Inicializar el manager de series
const seriesManager = new SeriesManager();

// Funciones globales para uso en HTML
async function loadSeriesGrid(containerId, seriesList = null) {
    await seriesManager.loadSeriesGrid(containerId, seriesList);
}

async function loadSeriesDetail(seriesId) {
    await seriesManager.loadSeriesDetail(seriesId);
}

// Hacer seriesData disponible globalmente
window.seriesData = seriesData;
window.loadSeriesGrid = loadSeriesGrid;
window.loadSeriesDetail = loadSeriesDetail;
window.loadTopRatedSeries = loadTopRatedSeries;
window.searchSeries = searchSeries;
window.seriesManager = seriesManager;  // ¡IMPORTANTE!

// Y que seriesManager se inicialice automáticamente:
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM cargado, verificando página actual...');
    
    // Inicializar seriesManager si no está inicializado
    if (!window._seriesManagerInitialized) {
        window.seriesManager = new SeriesManager();
        window._seriesManagerInitialized = true;
    }
});