import React, { useState, useContext, useRef, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import TopBar from './TopBar';
import GamePage from '../pages/GamePage';
import SettingsPage from './SettingsPage';
import DeadboxPage from '../pages/DeadboxPage';
import LiveboxPage from '../pages/LiveboxPage';
import PokedexPage from '../pages/PokedexPage';
import UsersPage from '../pages/UsersPage';
import CardsShopPage from '../pages/CardsShopPage';
import ChallengesPage from '../pages/ChallengesPage';
import GroupChatPage from '../pages/GroupChatPage';
import { UserGroupContext } from '../contexts/UserGroupContext';
import { THEMES } from './SettingsPage';

export default function DashboardLayout() {
    const { user, group } = useContext(UserGroupContext);
    const navigate = useNavigate();
    const location = useLocation();
    
    // Estados para móvil
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState(getActiveSection());
    const [showCardPrices, setShowCardPrices] = useState(false);
    const [theme, setTheme] = useState('añil');
    const [lockeUrl, setLockeUrl] = useState('');
    const [showSwipeHint, setShowSwipeHint] = useState(true);

    const themeClass = THEMES[theme]?.primary || THEMES['añil'].primary;
    const swipeZoneRef = useRef(null);

    function getActiveSection() {
        const path = location.pathname;
        if (path.includes('settings')) return 'settings';
        if (path.includes('deadbox')) return 'deadbox';
        if (path.includes('livebox')) return 'livebox';
        if (path.includes('pokedex')) return 'pokedex';
        if (path.includes('users')) return 'users';
        if (path.includes('challenges')) return 'challenges';
        if (path.includes('chat')) return 'chat';
        return 'game';
    }

    // Detectar gesto de swipe solo desde el borde
    useEffect(() => {
        if (!swipeZoneRef.current) return;

        let startX = 0;
        let startY = 0;
        let startTime = 0;

        const handleTouchStart = (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            startTime = Date.now();
        };

        const handleTouchEnd = (e) => {
            if (!startX) return;

            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const endTime = Date.now();
            
            const diffX = endX - startX;
            const diffY = endY - startY;
            const timeDiff = endTime - startTime;

            // Solo activar si es un swipe rápido y horizontal
            if (timeDiff < 300 && Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 30) {
                // Swipe de izquierda a derecha desde el borde (primeros 20px)
                if (diffX > 0 && startX < 20 && !isMobileMenuOpen) {
                    setIsMobileMenuOpen(true);
                    setShowSwipeHint(false);
                }
                // Swipe de derecha a izquierda para cerrar (desde cualquier parte)
                else if (diffX < 0 && isMobileMenuOpen) {
                    setIsMobileMenuOpen(false);
                }
            }

            startX = 0;
            startY = 0;
        };

        const swipeZone = swipeZoneRef.current;
        swipeZone.addEventListener('touchstart', handleTouchStart, { passive: true });
        swipeZone.addEventListener('touchend', handleTouchEnd, { passive: true });

        return () => {
            swipeZone.removeEventListener('touchstart', handleTouchStart);
            swipeZone.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isMobileMenuOpen]);

    // Ocultar hint después de 5 segundos
    useEffect(() => {
        if (showSwipeHint) {
            const timer = setTimeout(() => {
                setShowSwipeHint(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [showSwipeHint]);

    const handleNavigation = (section) => {
        setActiveSection(section);
        setIsMobileMenuOpen(false);
        navigate(`/dashboard/${section}`);
    };

    const handleThemeChange = (newTheme) => setTheme(newTheme);
    const handleLockeUrlChange = (newUrl) => setLockeUrl(newUrl);
    const handleToggleCardPrices = () => setShowCardPrices(prev => !prev);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-950 to-pink-900 text-white">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-pink-300 mb-4">No hay usuario autenticado</h2>
                    <p className="text-white/70">Por favor, inicia sesión primero.</p>
                    <button 
                        onClick={() => navigate('/login')}
                        className="mt-4 px-6 py-3 bg-pink-600 hover:bg-pink-700 rounded-lg transition duration-300"
                    >
                        Ir al Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen text-white flex flex-col font-sans bg-gradient-to-br ${themeClass}`}>
            
            {/* TopBar Mejorado para Móvil */}
            <TopBar 
                activeSection={activeSection}
                user={user}
                group={group}
                onMobileMenuToggle={() => {
                    setIsMobileMenuOpen(!isMobileMenuOpen);
                    setShowSwipeHint(false);
                }}
                isMobileMenuOpen={isMobileMenuOpen}
            />
            
            <div className="flex flex-grow relative">
                {/* Zona de detección de swipe - SOLO el borde izquierdo */}
                <div 
                    ref={swipeZoneRef}
                    className="lg:hidden fixed left-0 top-0 bottom-0 z-10"
                    style={{ 
                        width: '20px', // Solo 20px en el borde izquierdo
                        touchAction: 'pan-y', // Permite scroll vertical
                        pointerEvents: isMobileMenuOpen ? 'none' : 'auto' // Desactiva cuando el menú está abierto
                    }}
                />

                {/* Indicador de Swipe para móvil */}
                {showSwipeHint && !isMobileMenuOpen && (
                    <div className="lg:hidden fixed top-1/2 left-2 transform -translate-y-1/2 z-20 animate-bounce">
                        <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-full p-3 shadow-2xl">
                            <span className="text-white text-lg">👉</span>
                        </div>
                    </div>
                )}

                {/* Sidebar para Desktop y Mobile */}
                <aside className={`
                    fixed lg:static inset-y-0 left-0 z-30
                    w-64 lg:w-64 flex-shrink-0 
                    bg-white/10 border-r border-white/10 backdrop-blur-sm
                    transform transition-transform duration-300 ease-in-out
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}>
                    <div className="p-4 lg:p-6 h-full overflow-y-auto">
                        {/* Botón de cerrar para móvil */}
                        <div className="flex justify-between items-center mb-4 lg:hidden">
                            <h3 className="text-xl font-bold text-pink-300">🧭 NAVEGACIÓN</h3>
                            <button 
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 text-white/70 hover:text-white transition duration-200"
                            >
                                ✕
                            </button>
                        </div>

                        <h3 className="text-xl font-bold mb-6 text-pink-300 border-b border-pink-300/50 pb-3 hidden lg:block">
                            🧭 NAVEGACIÓN
                        </h3>
                        
                        {/* Navegación Principal */}
                        <div className="space-y-2 mb-6">
                            {[
                                { id: 'game', icon: '🏠', label: 'Dashboard Principal' },
                                { id: 'deadbox', icon: '⚰️', label: 'Caja de Caídos' },
                                { id: 'livebox', icon: '📦', label: 'Caja de Vivos' },
                                { id: 'challenges', icon: '🎯', label: 'Retos Activos' },
                                { id: 'chat', icon: '💬', label: 'Chat Grupal' },
                                { id: 'pokedex', icon: '📚', label: 'Info Pokémon' },
                                { id: 'users', icon: '👥', label: 'Jugadores' },
                                { id: 'settings', icon: '⚙️', label: 'Configuración' }
                            ].map((item) => (
                                <button 
                                    key={item.id}
                                    onClick={() => handleNavigation(item.id)} 
                                    className={`w-full text-left p-3 rounded-xl transition-all duration-300 flex items-center gap-3 ${
                                        activeSection === item.id 
                                        ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg transform scale-105' 
                                        : 'bg-white/5 hover:bg-white/10 text-white/80 hover:scale-105'
                                    }`}
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    <span className="text-sm font-medium">{item.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Información del grupo */}
                        {group && (
                            <div className="p-4 bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-xl border border-purple-500/30 backdrop-blur-sm mb-6">
                                <h4 className="font-bold text-pink-300 mb-2 text-sm flex items-center gap-2">
                                    👥 GRUPO ACTIVO
                                </h4>
                                <p className="text-white/90 font-semibold truncate">{group.name}</p>
                                <div className="mt-2 text-xs text-white/60">
                                    Miembros: {group.members?.length || 0}
                                </div>
                            </div>
                        )}

                        {/* Acciones Rápidas */}
                        <div>
                            <h4 className="font-bold text-orange-300 mb-3 text-sm flex items-center gap-2">
                                🚀 ACCIONES RÁPIDAS
                            </h4>
                            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                                <button 
                                    onClick={() => handleNavigation('livebox')}
                                    className="w-full p-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg transition-all duration-300 text-xs flex items-center justify-center gap-2 transform hover:scale-105"
                                >
                                    📦 Agregar
                                </button>
                                <button 
                                    onClick={() => handleNavigation('deadbox')}
                                    className="w-full p-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 rounded-lg transition-all duration-300 text-xs flex items-center justify-center gap-2 transform hover:scale-105"
                                >
                                    ⚰️ Muerte
                                </button>
                                <button 
                                    onClick={() => handleNavigation('chat')}
                                    className="w-full p-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-lg transition-all duration-300 text-xs flex items-center justify-center gap-2 transform hover:scale-105"
                                >
                                    💬 Chat
                                </button>
                                <button 
                                    onClick={() => handleNavigation('challenges')}
                                    className="w-full p-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-all duration-300 text-xs flex items-center justify-center gap-2 transform hover:scale-105"
                                >
                                    🎯 Retos
                                </button>
                            </div>
                        </div>

                        {/* Indicador de Swipe para móvil dentro del sidebar */}
                        <div className="lg:hidden mt-6 p-3 bg-gradient-to-r from-pink-500/20 to-purple-600/20 rounded-xl border border-pink-400/30 text-center">
                            <p className="text-xs text-white/70 flex items-center justify-center gap-2">
                                <span>👉</span>
                                Desliza desde el borde para abrir
                                <span>👈</span>
                            </p>
                            <p className="text-xs text-white/50 mt-1">
                                Desliza hacia izquierda para cerrar
                            </p>
                        </div>
                    </div>
                </aside>
                
                {/* Overlay para móvil - Ahora también detecta swipe para cerrar */}
                {isMobileMenuOpen && (
                    <div 
                        className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                        onTouchStart={(e) => {
                            // También permite cerrar con swipe en el overlay
                            const startX = e.touches[0].clientX;
                            const handleTouchEnd = (e) => {
                                const endX = e.changedTouches[0].clientX;
                                if (endX - startX < -50) { // Swipe izquierda
                                    setIsMobileMenuOpen(false);
                                }
                                document.removeEventListener('touchend', handleTouchEnd);
                            };
                            document.addEventListener('touchend', handleTouchEnd, { once: true });
                        }}
                    />
                )}
                
                {/* Main Content - Ahora completamente funcional */}
                <main className="flex-grow p-4 lg:p-6 min-w-0 mt-2 lg:mt-0 relative">
                    <Routes>
                        <Route path="game" element={
                            <GamePage 
                                activeSection={activeSection}
                                showCardPrices={showCardPrices}
                            />
                        } />
                        <Route path="settings" element={
                            <SettingsPage 
                                currentTheme={theme}
                                onThemeChange={handleThemeChange}
                                lockeUrl={lockeUrl}
                                onLockeUrlChange={handleLockeUrlChange}
                                showCardPrices={showCardPrices}
                                onToggleCardPrices={handleToggleCardPrices}
                            />
                        } />
                        <Route path="deadbox" element={<DeadboxPage />} />
                        <Route path="livebox" element={<LiveboxPage />} />
                        <Route path="challenges" element={<ChallengesPage />} />
                        <Route path="chat" element={<GroupChatPage />} />
                        <Route path="pokedex" element={<PokedexPage />} />
                        <Route path="users" element={<UsersPage />} />
                        <Route path="shop" element={<CardsShopPage />} />
                        <Route path="*" element={<GamePage />} />
                    </Routes>
                </main>
            </div>

            {/* Footer Responsive */}
            <footer className="bg-black/30 p-3 text-center text-sm text-white/60 border-t border-white/10 backdrop-blur-sm">
                <div className="flex flex-col lg:flex-row justify-between items-center px-4 lg:px-6 gap-2 lg:gap-0">
                    <span className="flex items-center gap-2 text-xs lg:text-sm">
                        <span>© 2025</span>
                        <span className="text-pink-300 font-bold hidden sm:inline">
                            Interfaz pokemon creada por David Martinez Palacios y su asesor Izan Montalba Alegre
                        </span>
                        <span className="text-pink-300 font-bold sm:hidden">
                            Por David Martinez e Izan Montalba
                        </span>
                    </span>
                    <span className="flex items-center gap-2 text-xs lg:text-sm">
                        <span>🏆</span>
                        <span>Grupo: {group?.name || 'Sin grupo'}</span>
                    </span>
                    <span className="flex items-center gap-2 text-xs lg:text-sm">
                        <span>🎮</span>
                        <span>{user?.username}</span>
                    </span>
                </div>
            </footer>
        </div>
    );
}