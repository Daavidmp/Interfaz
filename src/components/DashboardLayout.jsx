import React, { useState, useContext } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import TopBar from './TopBar';
import GamePage from '../pages/GamePage';
import SettingsPage from './SettingsPage';
import DeadboxPage from '../pages/DeadboxPage';
import UsersPage from '../pages/UsersPage';
import CardsShopPage from '../pages/CardsShopPage';
import { UserGroupContext } from '../contexts/UserGroupContext';
import { THEMES } from './SettingsPage';

export default function DashboardLayout() {
    const { user, group } = useContext(UserGroupContext);
    const navigate = useNavigate();
    const location = useLocation();
    
    // Obtener la sección activa desde la URL
    const getActiveSection = () => {
        const path = location.pathname;
        if (path.includes('settings')) return 'settings';
        if (path.includes('shop')) return 'shop';
        if (path.includes('deadbox')) return 'deadbox';
        if (path.includes('users')) return 'users';
        return 'game';
    };
    
    const [activeSection, setActiveSection] = useState(getActiveSection());
    const [showCardPrices, setShowCardPrices] = useState(false);
    const [theme, setTheme] = useState('añil');
    const [lockeUrl, setLockeUrl] = useState('');

    const themeClass = THEMES[theme]?.primary || THEMES['añil'].primary;

    const handleNavigation = (section) => {
        setActiveSection(section);
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
            
            <TopBar 
                activeSection={activeSection}
                user={user}
                group={group}
            />
            
            <div className="flex flex-grow">
                {/* Sidebar */}
                <aside className="w-64 flex-shrink-0 bg-white/10 border-r border-white/10">
                    <div className="p-6 h-full">
                        <h3 className="text-xl font-bold mb-6 text-pink-300 border-b border-pink-300/50 pb-3">NAVEGACIÓN</h3>
                        <div className="space-y-3">
                            <button 
                                onClick={() => handleNavigation('game')} 
                                className={`w-full text-left p-4 rounded-xl transition duration-300 ${
                                    activeSection === 'game' 
                                    ? 'bg-pink-600 text-white shadow-lg' 
                                    : 'bg-white/5 hover:bg-white/10 text-white/80'
                                }`}
                            >
                                🎮 Dashboard Principal
                            </button>
                            <button 
                                onClick={() => handleNavigation('shop')} 
                                className={`w-full text-left p-4 rounded-xl transition duration-300 ${
                                    activeSection === 'shop' 
                                    ? 'bg-pink-600 text-white shadow-lg' 
                                    : 'bg-white/5 hover:bg-white/10 text-white/80'
                                }`}
                            >
                                🛒 Tienda de Cartas
                            </button>
                            <button 
                                onClick={() => handleNavigation('deadbox')} 
                                className={`w-full text-left p-4 rounded-xl transition duration-300 ${
                                    activeSection === 'deadbox' 
                                    ? 'bg-pink-600 text-white shadow-lg' 
                                    : 'bg-white/5 hover:bg-white/10 text-white/80'
                                }`}
                            >
                                ⚰️ Caja de Caídos
                            </button>
                            <button 
                                onClick={() => handleNavigation('users')} 
                                className={`w-full text-left p-4 rounded-xl transition duration-300 ${
                                    activeSection === 'users' 
                                    ? 'bg-pink-600 text-white shadow-lg' 
                                    : 'bg-white/5 hover:bg-white/10 text-white/80'
                                }`}
                            >
                                👥 Jugadores
                            </button>
                            <button 
                                onClick={() => handleNavigation('settings')} 
                                className={`w-full text-left p-4 rounded-xl transition duration-300 ${
                                    activeSection === 'settings' 
                                    ? 'bg-pink-600 text-white shadow-lg' 
                                    : 'bg-white/5 hover:bg-white/10 text-white/80'
                                }`}
                            >
                                ⚙️ Configuración
                            </button>
                        </div>

                        {/* Información del grupo */}
                        {group && (
                            <div className="mt-8 p-4 bg-white/5 rounded-lg border border-white/10">
                                <h4 className="font-bold text-pink-300 mb-2">Grupo Activo</h4>
                                <p className="text-sm text-white/80">{group.name}</p>
                                <div className="mt-2 text-xs text-white/60">
                                    ID: {group.id?.slice(0, 8)}...
                                </div>
                            </div>
                        )}

                        {/* Información del usuario */}
                        <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                            <h4 className="font-bold text-pink-300 mb-2">Jugador</h4>
                            <p className="text-sm text-white/80">{user.username}</p>
                            <div className="mt-2 text-xs text-white/60">
                                {user.email}
                            </div>
                        </div>

                        {/* Estadísticas rápidas */}
                        <div className="mt-6 p-4 bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-lg border border-purple-500/30">
                            <h4 className="font-bold text-pink-300 mb-3 text-sm">ESTADÍSTICAS RÁPIDAS</h4>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-white/70">Balance:</span>
                                    <span className="text-yellow-400 font-bold">₿{user?.balance || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-white/70">Vidas:</span>
                                    <span className="text-green-400 font-bold">
                                        {group?.members?.find(m => m.user_id === user.id)?.lives || 20}/20
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-white/70">Miembros:</span>
                                    <span className="text-blue-400 font-bold">{group?.members?.length || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
                
                {/* Main Content */}
                <main className="flex-grow p-6">
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
                        <Route path="users" element={<UsersPage />} />
                        <Route path="shop" element={<CardsShopPage />} />
                        <Route path="*" element={<GamePage />} />
                    </Routes>
                </main>
            </div>

            {/* Footer */}
            <footer className="bg-black/20 p-3 text-center text-sm text-white/50 border-t border-white/10">
                <div className="flex justify-between items-center px-6">
                    <span>© 2024 Reto Añil PRO - Pokémon Locke Challenge</span>
                    <span>Grupo: {group?.name || 'Sin grupo seleccionado'}</span>
                    <span>Usuario: {user?.username}</span>
                </div>
            </footer>
        </div>
    );
}