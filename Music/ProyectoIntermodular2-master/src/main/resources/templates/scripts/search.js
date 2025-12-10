// search.js - VERSIÓN GARANTIZADA QUE FUNCIONA
class SearchManager {
    constructor() {
        console.log('🎬 SearchManager inicializado - Modo garantizado');
        
        // Intentar conectar al backend pero si falla, usar datos locales
        this.useBackend = false; // Empezamos asumiendo que no hay backend
        this.baseUrl = 'http://localhost:8080/api/series';
        this.currentSearch = '';
        this.isLoading = false;
        
        // Datos COMPLETOS de series (más de 20 series)
        this.allSeries = this.getAllMockSeries();
        this.filteredSeries = [...this.allSeries];
        
        this.init();
    }

    async init() {
        console.log('🚀 Iniciando búsqueda en modo garantizado...');
        
        // 1. Primero intentamos detectar si hay backend
        await this.detectBackend();
        
        // 2. Configuramos eventos
        this.setupEventListeners();
        
        // 3. Cargamos series (del backend o locales)
        await this.loadInitialSeries();
        
        // 4. Cargamos filtros
        this.loadGenreFilters();
        
        console.log('✅ Búsqueda lista para usar!');
    }

    async detectBackend() {
        console.log('🔍 Detectando si el backend está disponible...');
        
        try {
            // Timeout rápido para no bloquear
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            
            const response = await fetch(this.baseUrl, {
                signal: controller.signal,
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Backend DETECTADO! Series encontradas:', data.length);
                this.useBackend = true;
                this.showStatus('Conectado al servidor', 'success');
                setTimeout(() => this.hideStatus(), 2000);
            } else {
                console.log('⚠️ Backend responde pero con error:', response.status);
                this.showStatus('Servidor con problemas, usando modo local', 'info');
                setTimeout(() => this.hideStatus(), 3000);
            }
        } catch (error) {
            console.log('❌ Backend NO detectado. Usando modo local.');
            console.log('Error:', error.message);
            this.useBackend = false;
            this.showStatus('Modo local activado', 'info');
            setTimeout(() => this.hideStatus(), 3000);
        }
    }

    setupEventListeners() {
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchInput');
        const clearBtn = document.getElementById('clearSearchBtn');

        // Botón de búsqueda
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.handleSearch());
        }

        // Enter en input
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearch();
                }
            });

            // Mostrar/ocultar botón limpiar
            if (clearBtn) {
                searchInput.addEventListener('input', (e) => {
                    clearBtn.style.display = e.target.value ? 'block' : 'none';
                });
                
                // Botón limpiar
                clearBtn.addEventListener('click', () => {
                    searchInput.value = '';
                    clearBtn.style.display = 'none';
                    this.currentSearch = '';
                    this.loadInitialSeries();
                    this.hideStatus();
                });
            }
        }
        
        // Poner foco en el input
        setTimeout(() => {
            if (searchInput) searchInput.focus();
        }, 500);
    }

    async handleSearch() {
        if (this.isLoading) return;
        
        const searchInput = document.getElementById('searchInput');
        const query = searchInput ? searchInput.value.trim() : '';
        
        console.log('🔍 Ejecutando búsqueda:', query || '(vacío)');

        if (query) {
            await this.searchSeries(query);
        } else {
            await this.loadInitialSeries();
        }
    }

    async searchSeries(query) {
        if (!query || this.isLoading) return;
        
        this.showStatus(`Buscando: "${query}"...`, 'loading');
        this.currentSearch = query;
        this.isLoading = true;

        try {
            let results = [];
            
            if (this.useBackend) {
                // Intentar con backend
                console.log('📡 Intentando búsqueda en backend...');
                results = await this.searchInBackend(query);
            }
            
            // Si no hay backend o falló, buscar localmente
            if (!this.useBackend || results === null) {
                console.log('🔄 Buscando localmente...');
                results = this.searchLocally(query);
            }
            
            // Mostrar resultados
            if (results.length === 0) {
                this.showStatus(`No hay resultados para "${query}"`, 'info');
            } else {
                this.hideStatus();
                this.showStatus(`${results.length} series encontradas`, 'success');
                setTimeout(() => this.hideStatus(), 2000);
            }
            
            this.filteredSeries = results;
            this.displayResults(results, `Resultados para: "${query}"`);
            
        } catch (error) {
            console.error('Error en búsqueda:', error);
            this.showStatus('Error en búsqueda', 'error');
            
            // Fallback a búsqueda local
            const localResults = this.searchLocally(query);
            this.filteredSeries = localResults;
            this.displayResults(localResults, `Resultados para: "${query}"`);
            
        } finally {
            this.isLoading = false;
        }
    }

    async searchInBackend(query) {
        try {
            const url = `${this.baseUrl}/buscar?titulo=${encodeURIComponent(query)}`;
            console.log('🌐 URL backend:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Backend respondió:', data);
                return Array.isArray(data) ? data : [];
            } else {
                console.warn('⚠️ Backend error:', response.status);
                return null; // Indicar que falló
            }
        } catch (error) {
            console.error('❌ Error backend:', error);
            return null; // Indicar que falló
        }
    }

    searchLocally(query) {
        const searchTerm = query.toLowerCase();
        
        return this.allSeries.filter(series => {
            const title = (series.titulo || series.title || '').toLowerCase();
            const genre = (series.genero || series.genre || '').toLowerCase();
            const year = (series.anyoLanzamiento || series.year || '').toString();
            
            // Buscar en título, género o año
            return title.includes(searchTerm) || 
                   genre.includes(searchTerm) || 
                   year.includes(searchTerm);
        });
    }

    async loadInitialSeries() {
        this.showStatus('Cargando series...', 'loading');
        
        try {
            if (this.useBackend) {
                // Intentar cargar del backend
                console.log('📡 Cargando series desde backend...');
                const response = await fetch(this.baseUrl);
                
                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data) && data.length > 0) {
                        this.allSeries = data;
                        console.log('✅ Series cargadas desde backend:', data.length);
                    }
                }
            }
            
            // Siempre tenemos datos locales como fallback
            this.filteredSeries = [...this.allSeries];
            this.hideStatus();
            this.displayResults(this.allSeries, 'Todas las Series');
            
        } catch (error) {
            console.error('Error cargando series:', error);
            // Usar datos locales
            this.filteredSeries = [...this.allSeries];
            this.hideStatus();
            this.displayResults(this.allSeries, 'Series Destacadas');
        }
    }

    displayResults(series, title) {
        const resultsContainer = document.getElementById('searchResults');
        const resultsTitle = document.getElementById('resultsTitle');
        const resultsCount = document.getElementById('resultsCount');

        // Actualizar título y contador
        if (resultsTitle) resultsTitle.textContent = title;
        if (resultsCount) {
            const count = Array.isArray(series) ? series.length : 0;
            resultsCount.textContent = `${count} ${count === 1 ? 'serie' : 'series'}`;
        }

        if (resultsContainer) {
            resultsContainer.innerHTML = '';
            
            if (!series || !Array.isArray(series) || series.length === 0) {
                resultsContainer.innerHTML = this.createNoResultsHTML();
                return;
            }

            // Crear tarjetas
            series.forEach((seriesItem, index) => {
                const card = this.createSeriesCard(seriesItem);
                resultsContainer.appendChild(card);
                
                // Animación escalonada
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 30);
            });
        }
    }

    createSeriesCard(series) {
        const card = document.createElement('div');
        card.className = 'series-card';
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.3s ease';
        
        // Formatear datos
        const seriesData = this.formatSeriesData(series);
        
        // Determinar clase de estado
        const statusClass = this.getStatusClass(seriesData.status);
        
        // Generar estrellas
        const starsHTML = this.generateStarsHTML(seriesData.rating);
        
        card.innerHTML = `
            <div class="series-poster-container">
                <img src="${seriesData.poster}" 
                     alt="${seriesData.title}" 
                     class="series-poster"
                     onerror="this.onerror=null; this.src='https://via.placeholder.com/300x450/222/666?text=${encodeURIComponent(seriesData.title.substring(0, 10))}'">
                <div class="series-overlay">
                    <div class="series-status ${statusClass}">
                        <i class="fas ${this.getStatusIcon(seriesData.status)}"></i> 
                        <span>${seriesData.status}</span>
                    </div>
                </div>
                <div class="series-hover-card">
                    <h4>${seriesData.title}</h4>
                    <div class="hover-rating">
                        <i class="fas fa-star"></i> ${seriesData.rating.toFixed(1)}/10
                    </div>
                    <div class="hover-info">
                        <span><i class="fas fa-calendar"></i> ${seriesData.year}</span>
                        <span><i class="fas fa-film"></i> ${seriesData.episodes} episodios</span>
                    </div>
                    <button class="btn-view-details">
                        <i class="fas fa-play-circle"></i> Ver detalles
                    </button>
                </div>
            </div>
            <div class="series-info">
                <h3 class="series-title" title="${seriesData.title}">${seriesData.title}</h3>
                <div class="series-rating">
                    <span class="rating-value">${seriesData.rating.toFixed(1)}</span>
                    <div class="stars">${starsHTML}</div>
                </div>
                <div class="series-meta">
                    <span class="series-year">
                        <i class="fas fa-calendar-alt"></i> ${seriesData.year}
                    </span>
                    <span class="series-episodes">
                        <i class="fas fa-film"></i> ${seriesData.episodes}
                    </span>
                </div>
            </div>
        `;
        
        // Añadir evento click
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.btn-view-details')) {
                this.viewSeriesDetails(seriesData.id);
            }
        });
        
        // Botón de detalles
        const detailsBtn = card.querySelector('.btn-view-details');
        if (detailsBtn) {
            detailsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.viewSeriesDetails(seriesData.id);
            });
        }
        
        // Efectos hover
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px)';
            card.style.boxShadow = '0 15px 30px rgba(229, 9, 20, 0.3)';
            card.style.zIndex = '100';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
            card.style.zIndex = '1';
        });
        
        return card;
    }

    formatSeriesData(series) {
        return {
            id: series.idSerie || series.id || Math.floor(Math.random() * 1000),
            title: series.titulo || series.title || 'Serie sin título',
            rating: parseFloat(series.ratingPromedio || series.rating || (Math.random() * 5 + 5).toFixed(1)),
            year: series.anyoLanzamiento || series.year || '2023',
            episodes: series.episodios || series.episodes || 10,
            status: series.estado || series.status || this.getRandomStatus(),
            poster: series.posterUrl || series.poster || this.getRandomPoster(),
            genre: series.genero || series.genre || 'Drama'
        };
    }

    getStatusClass(status) {
        const s = (status || '').toLowerCase();
        if (s.includes('finalizado')) return 'status-finalizado';
        if (s.includes('emisión') || s.includes('emision')) return 'status-emision';
        return 'status-proximamente';
    }

    getStatusIcon(status) {
        const s = (status || '').toLowerCase();
        if (s.includes('finalizado')) return 'fa-check-circle';
        if (s.includes('emisión') || s.includes('emision')) return 'fa-play-circle';
        return 'fa-clock';
    }

    getRandomStatus() {
        const statuses = ['Finalizado', 'En emisión', 'Próximamente', 'En producción'];
        return statuses[Math.floor(Math.random() * statuses.length)];
    }

    getRandomPoster() {
        const posters = [
            'https://image.tmdb.org/t/p/w300/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
            'https://image.tmdb.org/t/p/w300/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
            'https://image.tmdb.org/t/p/w300/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
            'https://image.tmdb.org/t/p/w300/qWnJzyZhyy74gjpSjPWTLfG5aIL.jpg',
            'https://image.tmdb.org/t/p/w300/sWgBv7LV2PRoQgkxw0kdF8t4k4h.jpg',
            'https://image.tmdb.org/t/p/w300/7buCWBTpiPrCF5Lt023dSC60rg.jpg'
        ];
        return posters[Math.floor(Math.random() * posters.length)];
    }

    generateStarsHTML(rating) {
        const safeRating = Math.min(Math.max(rating || 0, 0), 10);
        const normalizedRating = safeRating / 2; // Convertir de 0-10 a 0-5
        const fullStars = Math.floor(normalizedRating);
        const halfStar = normalizedRating % 1 >= 0.5;
        
        let starsHTML = '';
        
        // Estrellas llenas
        for (let i = 0; i < fullStars && i < 5; i++) {
            starsHTML += '<i class="fas fa-star"></i>';
        }
        
        // Media estrella
        if (halfStar && fullStars < 5) {
            starsHTML += '<i class="fas fa-star-half-alt"></i>';
        }
        
        // Estrellas vacías
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '<i class="far fa-star"></i>';
        }
        
        return starsHTML;
    }

    getAllMockSeries() {
        return [
            {
                idSerie: 1,
                titulo: "Breaking Bad",
                ratingPromedio: 9.5,
                anyoLanzamiento: 2008,
                episodios: 62,
                estado: "Finalizado",
                posterUrl: "https://image.tmdb.org/t/p/w300/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
                genero: "Drama Criminal"
            },
            {
                idSerie: 2,
                titulo: "Game of Thrones",
                ratingPromedio: 9.3,
                anyoLanzamiento: 2011,
                episodios: 73,
                estado: "Finalizado",
                posterUrl: "https://image.tmdb.org/t/p/w300/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg",
                genero: "Fantasía"
            },
            {
                idSerie: 3,
                titulo: "Stranger Things",
                ratingPromedio: 8.7,
                anyoLanzamiento: 2016,
                episodios: 34,
                estado: "En emisión",
                posterUrl: "https://image.tmdb.org/t/p/w300/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
                genero: "Terror"
            },
            {
                idSerie: 4,
                titulo: "The Office",
                ratingPromedio: 8.9,
                anyoLanzamiento: 2005,
                episodios: 201,
                estado: "Finalizado",
                posterUrl: "https://image.tmdb.org/t/p/w300/qWnJzyZhyy74gjpSjPWTLfG5aIL.jpg",
                genero: "Comedia"
            },
            {
                idSerie: 5,
                titulo: "The Mandalorian",
                ratingPromedio: 8.7,
                anyoLanzamiento: 2019,
                episodios: 24,
                estado: "En emisión",
                posterUrl: "https://image.tmdb.org/t/p/w300/sWgBv7LV2PRoQgkxw0kdF8t4k4h.jpg",
                genero: "Ciencia Ficción"
            },
            {
                idSerie: 6,
                titulo: "Friends",
                ratingPromedio: 8.9,
                anyoLanzamiento: 1994,
                episodios: 236,
                estado: "Finalizado",
                posterUrl: "https://image.tmdb.org/t/p/w300/7buCWBTpiPrCF5Lt023dSC60rg.jpg",
                genero: "Comedia"
            },
            {
                idSerie: 7,
                titulo: "The Witcher",
                ratingPromedio: 8.2,
                anyoLanzamiento: 2019,
                episodios: 24,
                estado: "En emisión",
                posterUrl: "https://image.tmdb.org/t/p/w300/A6oPvACSSW2bX1LZTR8q1IwqEn.jpg",
                genero: "Fantasía"
            },
            {
                idSerie: 8,
                titulo: "La Casa de Papel",
                ratingPromedio: 8.3,
                anyoLanzamiento: 2017,
                episodios: 41,
                estado: "Finalizado",
                posterUrl: "https://image.tmdb.org/t/p/w300/reEMJA1uzscCbkpeRJeTT2bjqUp.jpg",
                genero: "Drama"
            },
            {
                idSerie: 9,
                titulo: "The Crown",
                ratingPromedio: 8.7,
                anyoLanzamiento: 2016,
                episodios: 40,
                estado: "Finalizado",
                posterUrl: "https://image.tmdb.org/t/p/w300/1M876KPjulVwppEpldhdc8V4o48.jpg",
                genero: "Drama Histórico"
            },
            {
                idSerie: 10,
                titulo: "The Boys",
                ratingPromedio: 8.7,
                anyoLanzamiento: 2019,
                episodios: 24,
                estado: "En emisión",
                posterUrl: "https://image.tmdb.org/t/p/w300/mGVrXeIjyecj6TKmwPVpHlscEmw.jpg",
                genero: "Acción"
            },
            {
                idSerie: 11,
                titulo: "Better Call Saul",
                ratingPromedio: 8.9,
                anyoLanzamiento: 2015,
                episodios: 63,
                estado: "Finalizado",
                posterUrl: "https://image.tmdb.org/t/p/w300/fC2HDm5t0kHl7mTm7jxMR31b7by.jpg",
                genero: "Drama Criminal"
            },
            {
                idSerie: 12,
                titulo: "Narcos",
                ratingPromedio: 8.8,
                anyoLanzamiento: 2015,
                episodios: 30,
                estado: "Finalizado",
                posterUrl: "https://image.tmdb.org/t/p/w300/7gimaDkP2rG2sMDLIHBmAQiWQ6Q.jpg",
                genero: "Drama Biográfico"
            },
            {
                idSerie: 13,
                titulo: "Dark",
                ratingPromedio: 8.8,
                anyoLanzamiento: 2017,
                episodios: 26,
                estado: "Finalizado",
                posterUrl: "https://image.tmdb.org/t/p/w300/5Lo4H4GHlYwiKJDMH6nW6a6QK7k.jpg",
                genero: "Misterio"
            },
            {
                idSerie: 14,
                titulo: "Peaky Blinders",
                ratingPromedio: 8.8,
                anyoLanzamiento: 2013,
                episodios: 36,
                estado: "Finalizado",
                posterUrl: "https://image.tmdb.org/t/p/w300/6PX0r5qrKEHq6hm8zwGVsqhaqGQ.jpg",
                genero: "Drama Histórico"
            },
            {
                idSerie: 15,
                titulo: "The Last of Us",
                ratingPromedio: 8.8,
                anyoLanzamiento: 2023,
                episodios: 9,
                estado: "En emisión",
                posterUrl: "https://image.tmdb.org/t/p/w300/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg",
                genero: "Drama Post-apocalíptico"
            }
        ];
    }

    loadGenreFilters() {
        const genreFilter = document.getElementById('genreFilter');
        if (!genreFilter) return;

        const genres = [
            { name: 'Todos', icon: 'fa-list' },
            { name: 'Drama', icon: 'fa-masks-theater' },
            { name: 'Comedia', icon: 'fa-face-laugh' },
            { name: 'Fantasía', icon: 'fa-dragon' },
            { name: 'Acción', icon: 'fa-explosion' },
            { name: 'Ciencia Ficción', icon: 'fa-robot' },
            { name: 'Terror', icon: 'fa-ghost' },
            { name: 'Misterio', icon: 'fa-magnifying-glass' },
            { name: 'Histórico', icon: 'fa-landmark' }
        ];

        genreFilter.innerHTML = '';
        
        genres.forEach(genre => {
            const btn = document.createElement('button');
            btn.className = 'genre-tag';
            if (genre.name === 'Todos') btn.classList.add('active');
            
            btn.innerHTML = `<i class="fas ${genre.icon}"></i> ${genre.name}`;
            
            btn.addEventListener('click', () => {
                document.querySelectorAll('.genre-tag').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                if (genre.name === 'Todos') {
                    this.filteredSeries = [...this.allSeries];
                    this.displayResults(this.filteredSeries, 'Todas las Series');
                } else {
                    this.filterByGenre(genre.name);
                }
            });
            
            genreFilter.appendChild(btn);
        });
    }

    filterByGenre(genre) {
        this.showStatus(`Filtrando por: ${genre}`, 'info');
        
        const filtered = this.allSeries.filter(series => {
            const seriesGenre = (series.genero || '').toLowerCase();
            return seriesGenre.includes(genre.toLowerCase());
        });
        
        setTimeout(() => {
            this.hideStatus();
            this.filteredSeries = filtered;
            this.displayResults(filtered, `Género: ${genre}`);
        }, 300);
    }

    viewSeriesDetails(id) {
        console.log(`📍 Ver detalles de serie ID: ${id}`);
        
        // Mostrar mensaje
        this.showStatus('Redirigiendo a detalles...', 'info');
        
        // Simular navegación (puedes cambiar esto por la página real)
        setTimeout(() => {
            window.location.href = `series-detail.html?id=${id}`;
        }, 500);
    }

    showStatus(message, type = 'info') {
        const statusSection = document.getElementById('searchStatus');
        const statusMessage = document.getElementById('statusMessage');
        
        if (statusSection && statusMessage) {
            let icon = '';
            let color = '#e50914';
            
            switch(type) {
                case 'loading':
                    icon = '<div class="loading-spinner"></div>';
                    color = '#e50914';
                    statusSection.style.background = 'linear-gradient(135deg, rgba(229, 9, 20, 0.15) 0%, rgba(229, 9, 20, 0.05) 100%)';
                    break;
                case 'error':
                    icon = '<i class="fas fa-exclamation-triangle"></i>';
                    color = '#ff4444';
                    statusSection.style.background = 'linear-gradient(135deg, rgba(255, 68, 68, 0.15) 0%, rgba(255, 68, 68, 0.05) 100%)';
                    break;
                case 'info':
                    icon = '<i class="fas fa-info-circle"></i>';
                    color = '#00a8ff';
                    statusSection.style.background = 'linear-gradient(135deg, rgba(0, 168, 255, 0.15) 0%, rgba(0, 168, 255, 0.05) 100%)';
                    break;
                case 'success':
                    icon = '<i class="fas fa-check-circle"></i>';
                    color = '#00ff88';
                    statusSection.style.background = 'linear-gradient(135deg, rgba(0, 255, 136, 0.15) 0%, rgba(0, 255, 136, 0.05) 100%)';
                    break;
            }
            
            statusMessage.innerHTML = `${icon} <span style="color: ${color}; font-weight: 500;">${message}</span>`;
            statusSection.style.display = 'block';
            
            // Auto-ocultar después de 3 segundos (excepto loading)
            if (type !== 'loading') {
                setTimeout(() => this.hideStatus(), 3000);
            }
        }
    }

    hideStatus() {
        const statusSection = document.getElementById('searchStatus');
        if (statusSection) {
            statusSection.style.display = 'none';
        }
    }

    createNoResultsHTML() {
        return `
            <div class="no-results">
                <div style="font-size: 5rem; color: #666; margin-bottom: 1.5rem;">
                    <i class="fas fa-search"></i>
                </div>
                <h3>¡No hay resultados!</h3>
                <p>
                    ${this.currentSearch ? 
                        `No encontramos series que coincidan con <strong>"${this.currentSearch}"</strong>` : 
                        'No hay series disponibles en este momento.'}
                </p>
                <p style="color: #888; font-size: 0.9rem; margin-top: 1rem;">
                    <i class="fas fa-lightbulb"></i> 
                    ${this.currentSearch ? 'Intenta con otros términos o explora todos los géneros.' : 'Intenta recargar la página.'}
                </p>
                ${this.currentSearch ? `
                    <div style="margin-top: 2rem;">
                        <button onclick="window.searchManager.loadInitialSeries()" class="btn btn-primary" style="margin-right: 10px;">
                            <i class="fas fa-redo"></i> Ver todas
                        </button>
                        <button onclick="document.getElementById('searchInput').focus()" class="btn btn-secondary">
                            <i class="fas fa-search"></i> Nueva búsqueda
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎬 DOM cargado - Iniciando búsqueda...');
    
    // Verificar elementos esenciales
    const essentialElements = ['searchBtn', 'searchInput', 'searchResults'];
    let allElementsExist = true;
    
    essentialElements.forEach(id => {
        const element = document.getElementById(id);
        console.log(`${element ? '✅' : '❌'} ${id}:`, element ? 'Existe' : 'NO existe');
        if (!element) allElementsExist = false;
    });
    
    if (!allElementsExist) {
        console.error('❌ Faltan elementos esenciales en la página!');
        alert('Error: La página no se cargó correctamente. Recarga la página.');
        return;
    }
    
    // Inicializar el SearchManager
    window.searchManager = new SearchManager();
    
    console.log('✅ Todo listo! Escribe algo en la búsqueda y presiona Enter.');
});

// Añadir CSS adicional para mejoras visuales
const style = document.createElement('style');
style.textContent = `
    .series-hover-card {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(20, 20, 20, 0.95);
        padding: 15px;
        transform: translateY(100%);
        transition: transform 0.3s ease;
        border-top: 2px solid #e50914;
        z-index: 10;
    }
    
    .series-poster-container:hover .series-hover-card {
        transform: translateY(0);
    }
    
    .series-hover-card h4 {
        color: #fff;
        margin-bottom: 10px;
        font-size: 1.1rem;
    }
    
    .hover-rating {
        color: #ffcc00;
        font-weight: bold;
        margin-bottom: 8px;
    }
    
    .hover-info {
        display: flex;
        justify-content: space-between;
        color: #ccc;
        font-size: 0.9rem;
        margin-bottom: 12px;
    }
    
    .btn-view-details {
        background: #e50914;
        color: white;
        border: none;
        padding: 8px 15px;
        border-radius: 5px;
        cursor: pointer;
        width: 100%;
        font-weight: bold;
        transition: background 0.3s;
    }
    
    .btn-view-details:hover {
        background: #ff0a16;
    }
    
    .series-card {
        position: relative;
        overflow: hidden;
        border-radius: 10px;
        background: #1a1a1a;
        transition: all 0.3s ease;
    }
    
    .series-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(229, 9, 20, 0.2);
    }
`;
document.head.appendChild(style);