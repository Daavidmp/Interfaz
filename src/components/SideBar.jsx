import React from "react";

// 🔑 REMOVIDO: onCreateUser prop
export default function SideBar({ users, muertes = {}, initialLives = 20 }) {
  return (
    <div className="p-4 bg-white/5 rounded-xl shadow-inner">
      {/* 🔑 ELIMINADO: Todo el bloque de "Añadir jugador" */}
      
      <div className="text-sm font-semibold uppercase text-pink-300 border-b border-pink-300/50 pb-2 mb-3">Jugadores y Vidas</div>
      <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
        {users.map(u => {
          const deaths = muertes[u.id] ?? 0;
          const remainingLives = initialLives - deaths;
          const isGameOver = remainingLives <= 0;

          return (
            <div 
                key={u.id} 
                className={`p-3 rounded-lg flex items-center justify-between transition duration-200 ${isGameOver ? 'bg-red-900/10 opacity-70' : 'bg-white/8 hover:bg-white/15'}`}
            >
              <div className="font-semibold">{u.name}</div>
              <div className={`font-extrabold text-lg flex items-center gap-1 ${isGameOver ? 'text-red-400' : 'text-green-300'}`}>
                {isGameOver ? '☠️ ELIMINADO' : `❤️ ${remainingLives}`}
              </div>
            </div>
          );
        })}
        {!users.length && <p className="text-white/60 text-center py-2">No hay jugadores en este grupo. Únete a un grupo para empezar.</p>}
      </div>
    </div>
  );
}