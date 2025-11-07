import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Settings, Users, Swords, Shield } from 'lucide-react';

/**
 * SidebarMenu: Componente para la barra lateral.
 * Utiliza Link de React Router para la navegación.
 */
export default function SidebarMenu({ activeSection }) {
    const menuItems = [
        { id: 'game', name: '🎮 Dashboard', icon: Gamepad2, path: '/dashboard/game' },
        { id: 'challenges', name: '🔥 Retos Activos', icon: Swords, path: '/dashboard/challenges' },
        { id: 'deadbox', name: '⚰️ Caja de Caídos', icon: Shield, path: '/dashboard/deadbox' },
        { id: 'users', name: '👥 Jugadores', icon: Users, path: '/dashboard/users' },
        { id: 'settings', name: '⚙️ Configuración', icon: Settings, path: '/dashboard/settings' },
    ];

    return (
        <nav className="p-4 space-y-2 bg-gray-800 rounded-xl shadow-2xl h-full sticky top-4">
            <p className="text-xs font-semibold uppercase text-white/50 mb-4 px-3">Navegación</p>
            {menuItems.map(item => (
                <Link
                    key={item.id}
                    to={item.path}
                    // activeSection se compara con el segmento de la ruta (ej: 'game')
                    className={`flex items-center w-full text-left p-3 rounded-xl transition duration-300 ease-in-out font-semibold
                        ${activeSection === item.id 
                            ? 'bg-fuchsia-700 shadow-lg text-white' 
                            : 'bg-white/5 hover:bg-white/10 text-white/80'}`
                    }
                >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                </Link>
            ))}
        </nav>
    );
}