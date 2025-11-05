import React from "react";

export default function TopBar({ user, onLogout }) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between p-4 bg-gradient-to-r from-pink-700 to-purple-900 rounded-b-2xl shadow-2xl">
      <div className="flex items-center gap-3">
        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png" className="w-12 h-12 rounded-full bg-white/10 p-1 border-2 border-pink-400" alt="logo"/>
        <div>
          <div className="font-extrabold text-xl">Reto Añil PRO</div>
          <div className="text-sm text-white/80">Dashboard de Grupo</div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end">
            <div className="text-white font-semibold text-lg">{user?.username}</div>
            <div className="text-xs text-pink-300">Balance: ₿{user?.balance || 1000} | ❤️{user?.lives || 3}</div>
        </div>
        <button onClick={onLogout} className="px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 transition duration-300 font-semibold shadow-md">
            Salir
        </button>
      </div>
    </header>
  );
}

