import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GroupSelector from "../components/GroupSelector";

// Función auxiliar para añadir el usuario actual a la lista de jugadores del grupo
function updateUsersForGroup(currentUser, isCreation = false) {
    // Objeto de jugador con el nickname del usuario logeado
    const userEntry = {
        id: currentUser.id,
        name: currentUser.username, // 🔑 Usamos el username como nickname
        balance: currentUser.balance || 1000,
    };
    
    // Si es creación, la lista empieza solo con el creador
    let existingUsers = isCreation ? [] : JSON.parse(localStorage.getItem("ra_users") || "[]");

    // Prevenir duplicados
    const isPresent = existingUsers.find(u => u.id === userEntry.id);
    
    let updatedUsers = existingUsers;
    if (!isPresent) {
        updatedUsers = [...existingUsers, userEntry];
    }

    localStorage.setItem("ra_users", JSON.stringify(updatedUsers));
}


export default function GroupPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("ra_user") || "null"); 
  
  useEffect(()=>{ if(!user) navigate("/"); }, [user, navigate]); 
  
  const [groups, setGroups] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ra_groups") || "[]"); } catch { return []; }
  });

  useEffect(() => { localStorage.setItem("ra_groups", JSON.stringify(groups)); }, [groups]);

  function createGroup(name) {
    if (!name || !name.trim()) return alert("Pon un nombre al grupo");
    
    const g = { id: Date.now(), name: name.trim(), members: [user.id] };
    
    setGroups(prev => [...prev, g]);
    
    // 🔑 1. Inicializar ra_users solo con el creador
    updateUsersForGroup(user, true); 

    localStorage.setItem("ra_group", JSON.stringify(g)); 
    navigate('/game');
  }

  function joinGroup(g) {
    if (!g) return;
    
    // Asegurarse de que el usuario esté en la lista de miembros del grupo (metadatos del grupo)
    const updatedGroup = { ...g, members: g.members || [] };
    if (!updatedGroup.members.includes(user.id)) updatedGroup.members.push(user.id);
    
    const next = groups.map(x => x.id === updatedGroup.id ? updatedGroup : x);
    setGroups(next);
    
    // 🔑 2. Añadir el usuario al ra_users
    updateUsersForGroup(user, false); 
    
    localStorage.setItem("ra_group", JSON.stringify(updatedGroup)); 
    navigate('/game');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-950 to-fuchsia-950 p-6">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-extrabold text-center text-white mb-8">
            Selección de Grupo <span className="text-pink-400">/ Locke</span>
        </h1>
        
        <GroupSelector groups={groups} onJoin={joinGroup} onCreate={createGroup} />

        <div className="mt-8 p-6 bg-white/10 rounded-2xl shadow-2xl transition duration-500 hover:shadow-purple-500/20">
          <h2 className="text-2xl font-bold mb-5 text-purple-300">Grupos disponibles ({groups.length})</h2>
          <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {groups.length ? groups.map(g => (
              <div key={g.id} className="flex items-center justify-between bg-white/5 p-4 rounded-xl transition duration-300 hover:bg-white/10 transform hover:scale-[1.01] shadow-md">
                <div>
                  <div className="font-semibold text-lg">{g.name}</div>
                  <div className="text-sm text-white/70">{(g.members?.length||0)} miembros</div>
                </div>
                <button 
                    onClick={()=>joinGroup(g)} 
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-pink-600 to-purple-700 font-semibold transition duration-300 hover:from-pink-500 hover:to-purple-600 shadow-lg"
                >
                    Unirse
                </button>
              </div>
            )) : <p className="text-white/70 text-center py-4">No hay grupos todavía. ¡Sé el primero en crear uno!</p>}
          </div>
        </div>
      </div>
    </div>
  );
}


