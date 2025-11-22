import React, { useState } from "react";

export default function GroupSelector({ groups, onJoin, onCreate }) {
  const [name, setName] = useState("");
  return (
    <div className="space-y-6">
      <div className="p-4 border border-pink-500/50 rounded-xl bg-white/5">
        <input 
            value={name} 
            onChange={e=>setName(e.target.value)} 
            placeholder="Introduce un nuevo nombre de grupo" 
            className="w-full p-3 rounded-md bg-white/10 text-white placeholder-white/50 focus:ring-2 focus:ring-pink-400 transition duration-300 border border-transparent focus:border-pink-400"
        />
        <button 
            onClick={()=> { if(!name.trim()) return alert('El nombre no puede estar vacío'); onCreate(name); setName(''); }} 
            className="mt-4 w-full py-3 rounded-full bg-gradient-to-r from-green-500 to-teal-500 font-bold transition duration-300 hover:from-green-600 hover:to-teal-600 transform hover:scale-[1.01] shadow-lg"
        >
            Crear nuevo grupo
        </button>
      </div>
      
      {/* Lista de grupos para unirse (solo si el array de grupos en el state está vacío, si no, se repite la lista de GroupPage) */}
      {/* Lo mantengo simple, pero el diseño de GroupPage ya muestra la lista con botón Unirse. */}
      {/* Este componente ahora se enfoca en la CREACIÓN. */}
      
    </div>
  );
}

