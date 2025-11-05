import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import TopBar from './TopBar';
// IMPORTANTE: Asegúrate de que SettingsPage.jsx exista y exporte 'THEMES'
import SettingsPage, { THEMES } from './SettingsPage'; 

// Componente para el menú lateral
function SidebarMenu({ activeSection, onSelect }) {
    const menuItems = [
        { id: 'game', name: '🎮 Dashboard' },
        { id: 'challenges', name: '🔥 Retos Activos' },
        { id: 'deadbox', name: '⚰️ Caja de Caídos' },
        { id: 'users', name: '👥 Jugadores' },
        { id: 'settings', name: '⚙️ Configuración' },
    ];

    return (
        <nav className="p-4 space-y-2">
            <p className="text-xs font-semibold uppercase text-white/50 mb-4">Navegación</p>
            {menuItems.map(item => (
                <button
                    key={item.id}
                    onClick={() => onSelect(item.id)}
                    className={`w-full text-left p-3 rounded-xl transition duration-300 ease-in-out font-semibold
                        ${activeSection === item.id 
                            ? 'bg-fuchsia-700 shadow-lg' 
                            : 'bg-white/5 hover:bg-white/10 text-white/80'}`
                    }
                >
                    {item.name}
                </button>
            ))}
        </nav>
    );
}

// Función para obtener las clases de color del tema
function getThemeClasses(themeId) {
    const theme = THEMES[themeId] || THEMES['añil']; // Por defecto: añil
    return {
        background: `bg-gradient-to-br ${theme.primary}`,
    };
}


export default function DashboardLayout() {
    const navigate = useNavigate();
    const location = useLocation();

    // 1. Estado para la sección activa
    const [activeSection, setActiveSection] = useState(() => {
        const path = location.pathname.split('/').pop();
        return path === 'game' ? 'game' : path || 'game';
    });

    // 2. Estado para el tema visual (persistencia local)
    const [theme, setTheme] = useState(() => localStorage.getItem('ra_theme') || 'añil');

    // 3. Estado para la URL de seguimiento del Locke (persistencia local)
    const [lockeUrl, setLockeUrl] = useState(() => localStorage.getItem('ra_locke_url') || '');

    // 4. Estado para la visibilidad de precios de cartas (persistencia local)
    const [showCardPrices, setShowCardPrices] = useState(() => {
        const storedValue = localStorage.getItem('ra_show_prices');
        // Si no existe en localStorage, por defecto es TRUE.
        return storedValue === null ? true : storedValue === 'true'; 
    });

    // Cargar datos de usuario y grupo (simulación de estado de sesión)
    const storedUser = JSON.parse(localStorage.getItem('ra_user') || 'null');
    const storedGroup = JSON.parse(localStorage.getItem('ra_group') || 'null');

    // --- Efectos para Persistencia ---
    
    // Persistir el tema
    useEffect(() => {
        localStorage.setItem('ra_theme', theme);
    }, [theme]);
    
    // Persistir la URL de seguimiento
    useEffect(() => {
        localStorage.setItem('ra_locke_url', lockeUrl);
    }, [lockeUrl]);
    
    // Persistir la visibilidad de precios
    useEffect(() => {
        localStorage.setItem('ra_show_prices', showCardPrices.toString());
    }, [showCardPrices]);
    

    // Redirección al cargar (sin cambios)
    useEffect(() => {
        // Lógica de redirección
    }, [storedUser, storedGroup, navigate]);

    // --- Handlers de Configuración ---

    function handleLogout() {
        // Lista de todas las claves de sesión que se deben limpiar al salir
        const keysToClear = ['ra_user', 'ra_group', 'ra_estado', 'ra_users', 'ra_theme', 'ra_locke_url', 'ra_show_prices'];
        keysToClear.forEach(key => localStorage.removeItem(key));
        navigate('/');
    }
    
    function handleThemeChange(newThemeId) {
        setTheme(newThemeId);
    }
    
    function handleLockeUrlChange(url) {
        setLockeUrl(url);
    }

    function handleToggleCardPrices() {
        setShowCardPrices(prev => !prev);
    }
    
    // Obtener las clases del tema
    const themeClasses = getThemeClasses(theme);


    return (
        // Aplicar la clase dinámica al fondo del div principal
        <div className={`min-h-screen ${themeClasses.background} text-white`}>
            <TopBar user={storedUser} onLogout={handleLogout} />
            
            <div className="flex pt-6 px-6 gap-6">
                {/* Barra lateral */}
                <aside className="w-64 flex-shrink-0 bg-white/5 rounded-2xl shadow-xl card-glass-dark transition duration-500 ease-in-out">
                    <SidebarMenu activeSection={activeSection} onSelect={setActiveSection} />
                </aside>
                
                {/* Contenido principal */}
                <main className="flex-grow bg-white/5 p-6 rounded-2xl shadow-xl card-glass-dark">
                    
                    {/* Renderiza el contenido principal */}
                    {activeSection === 'game' && (
                        // Pasar la configuración al contexto del Outlet
                        <Outlet context={{ activeSection, showCardPrices }} />
                    )}
                    {activeSection === 'challenges' && <h2 className="text-3xl font-bold">🔥 Retos Activos</h2>}
                    {activeSection === 'deadbox' && <h2 className="text-3xl font-bold">⚰️ Caja de Caídos</h2>}
                    {activeSection === 'users' && <h2 className="text-3xl font-bold">👥 Gestión de Jugadores</h2>}
                    
                    {/* Renderizar SettingsPage */}
                    {activeSection === 'settings' && (
                        <SettingsPage 
                            currentTheme={theme} 
                            onThemeChange={handleThemeChange}
                            lockeUrl={lockeUrl}
                            onLockeUrlChange={handleLockeUrlChange}
                            showCardPrices={showCardPrices} 
                            onToggleCardPrices={handleToggleCardPrices} 
                        />
                    )}
                </main>
            </div>
        </div>
    );
}