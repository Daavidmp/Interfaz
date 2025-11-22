import React, { useContext } from "react";
import { UserGroupContext } from '../contexts/UserGroupContext';
import { supabase } from '../supabaseClient';

export default function TopBar({ user, group }) {
  const { groupMembers } = useContext(UserGroupContext);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  // Calcular estadísticas rápidas
  const userStats = groupMembers.find(member => member.user_id === user?.id);
  const totalMembers = groupMembers.length;
  const totalLives = groupMembers.reduce((sum, member) => sum + (member.lives || 0), 0);

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between p-4 bg-gradient-to-r from-pink-700 to-purple-900 rounded-b-2xl shadow-2xl">
      {/* Logo y información del grupo */}
      <div className="flex items-center gap-3">
        <img 
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png" 
          className="w-12 h-12 rounded-full bg-white/10 p-1 border-2 border-pink-400" 
          alt="logo"
        />
        <div>
          <div className="font-extrabold text-xl">Reto Añil PRO</div>
          <div className="text-sm text-white/80">
            Grupo: {group?.name || 'Sin grupo'} 
            {group && <span className="ml-2">({totalMembers} miembros)</span>}
          </div>
        </div>
      </div>

      {/* Información del usuario y estadísticas */}
      <div className="flex items-center gap-6">
        {/* Estadísticas del grupo */}
        {group && (
          <div className="hidden md:flex items-center gap-4 text-sm">
            <div className="text-center">
              <div className="text-green-400 font-bold text-lg">{totalLives}</div>
              <div className="text-white/60 text-xs">Vidas Totales</div>
            </div>
            <div className="text-center">
              <div className="text-blue-400 font-bold text-lg">{totalMembers}</div>
              <div className="text-white/60 text-xs">Jugadores</div>
            </div>
          </div>
        )}

        {/* Información del usuario */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <div className="text-white font-semibold text-lg">{user?.username}</div>
            <div className="text-xs text-pink-300 flex gap-3">
              <span>Balance: ₿{userStats?.balance || '0'}</span>
              <span>|</span>
              <span>Vidas: ❤️{userStats?.lives || '0'}/20</span>
            </div>
          </div>
          
          {/* Botón de salir */}
          <button 
            onClick={handleLogout} 
            className="px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 transition duration-300 font-semibold shadow-md flex items-center gap-2"
          >
            <span>Salir</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

