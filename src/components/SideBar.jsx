import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Settings, Users, Swords, Shield, Package, BookOpen, Menu, X } from 'lucide-react';

export default function SidebarMenu({ activeSection }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const menuItems = [
        { id: 'game', name: '🎮 Dashboard', icon: Gamepad2, path: '/dashboard/game' },
        { id: 'challenges', name: '🔥 Retos Activos', icon: Swords, path: '/dashboard/challenges' },
        { id: 'deadbox', name: '⚰️ Caja de Caídos', icon: Shield, path: '/dashboard/deadbox' },
        { id: 'livebox', name: '📦 Caja de Vivos', icon: Package, path: '/dashboard/livebox' },
        { id: 'pokedex', name: '📚 Info Pokémon', icon: BookOpen, path: '/dashboard/pokedex' },
        { id: 'users', name: '👥 Jugadores', icon: Users, path: '/dashboard/users' },
        { id: 'settings', name: '⚙️ Configuración', icon: Settings, path: '/dashboard/settings' },
    ];

    return (
        <>
            {/* Botón de menú hamburguesa para móvil */}
            <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-fuchsia-700 text-white rounded-xl shadow-lg"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Overlay para móvil */}
            {isMobileMenuOpen && (
                <div 
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar - Responsive */}
            <nav className={`
                fixed lg:sticky top-0 left-0 z-40
                w-80 lg:w-auto
                h-screen lg:h-full
                p-4 space-y-2 bg-gray-800 rounded-xl shadow-2xl
                transform transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                
                {/* Header del sidebar para móvil */}
                <div className="flex items-center justify-between mb-4 lg:hidden">
                    <p className="text-sm font-semibold uppercase text-white/50 px-3">Navegación</p>
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-2 text-white/70 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Header para desktop */}
                <p className="text-xs font-semibold uppercase text-white/50 mb-4 px-3 hidden lg:block">
                    Navegación
                </p>

                {/* Items del menú */}
                {menuItems.map(item => (
                    <Link
                        key={item.id}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center w-full text-left p-3 rounded-xl transition duration-300 ease-in-out font-semibold
                            ${activeSection === item.id 
                                ? 'bg-fuchsia-700 shadow-lg text-white' 
                                : 'bg-white/5 hover:bg-white/10 text-white/80'}`
                        }
                    >
                        <item.icon className="w-5 h-5 mr-3" />
                        <span className="text-sm lg:text-base">{item.name}</span>
                    </Link>
                ))}
            </nav>
        </>
    );
}