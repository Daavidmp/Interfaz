class ApiService {
    constructor() {
        this.baseUrl = 'http://localhost:8080/api';
        console.log('🚀 ApiService inicializado. Base URL:', this.baseUrl);
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        console.log(`🌐 Request a: ${url}`);
        
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            console.log(`📊 Response status: ${response.status}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`❌ Error en request ${url}:`, error.message);
            throw error;
        }
    }

    // Series endpoints
    async getAllSeries() {
        return this.request('/series');
    }

    async getSeriesById(id) {
        return this.request(`/series/${id}`);
    }

    async getPopularSeries() {
        return this.request('/series/populares');
    }

    async getSeriesByStatus(status) {
        return this.request(`/series/estado/${encodeURIComponent(status)}`);
    }

    async searchSeries(query) {
        return this.request(`/series/buscar?titulo=${encodeURIComponent(query)}`);
    }

    async getTopRatedSeries() {
        return this.request('/series/top-rated');
    }

    async getRecentSeries() {
        return this.request('/series/recientes');
    }

    async createSeries(seriesData) {
        return this.request('/series', {
            method: 'POST',
            body: JSON.stringify(seriesData)
        });
    }

    async getSeriesCount() {
        return this.request('/series/count');
    }

    // Health check mejorado
    async healthCheck() {
        try {
            console.log('🔌 Probando conexión con backend...');
            const response = await fetch(`${this.baseUrl}/series/test`, {
                method: 'GET',
                mode: 'cors'
            });
            
            const isOk = response.ok;
            console.log('📡 Conexión:', isOk ? '✅ OK' : '❌ Falló');
            
            if (isOk) {
                const text = await response.text();
                console.log('📄 Respuesta:', text);
            }
            
            return isOk;
        } catch (error) {
            console.error('❌ Error en healthCheck:', error.message);
            return false;
        }
    }

    // Alias para compatibilidad
    async testConnection() {
        return this.healthCheck();
    }
}

// Crear instancia global INMEDIATAMENTE
const apiService = new ApiService();

// Exportar de varias formas para asegurar disponibilidad
window.apiService = apiService;
window.ApiService = ApiService;

console.log('✅ apiService creado y disponible globalmente');