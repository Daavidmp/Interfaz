import React, { useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { UserGroupContext } from '../contexts/UserGroupContext'; 

const INITIAL_LIVES = 20;
const INITIAL_BALANCE = 5000;

export default function GroupPage() {
    // 🔑 USAR CONTEXTO
    const { user, selectGroup, isLoadingAuth } = useContext(UserGroupContext);
    
    const [groups, setGroups] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [groupName, setGroupName] = useState('');
    const navigate = useNavigate();

    // Alias para el usuario (leído del contexto)
    const storedUser = user;

    // --- Funciones de Carga de Datos ---
    async function fetchGroups() {
        if (!storedUser?.id) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        const { data, error } = await supabase
            .from('groups')
            .select(`
                id, 
                name, 
                created_by,
                group_members (
                    user_id,
                    username,
                    balance,
                    lives
                )
            `);

        if (error) {
            console.error('Error al cargar grupos:', error);
            setError('Error al cargar grupos. Revisa RLS SELECT en "groups".');
        } else {
            setGroups(data || []);
        }
        setIsLoading(false);
    }

    // --- Funciones de Modificación (createGroup y joinGroup quedan iguales, usan storedUser) ---
    async function createGroup() {
        if (!groupName.trim() || !storedUser?.id) return;
        
        try {
            // 1. Crear el grupo
            const { data: groupData, error: groupError } = await supabase
                .from('groups')
                .insert([{ name: groupName, created_by: storedUser.id }])
                .select()
                .single();

            if (groupError) throw groupError;

            // 2. Añadir al creador como miembro del grupo
            const { error: memberError } = await supabase
                .from('group_members')
                .insert([{
                    group_id: groupData.id,
                    user_id: storedUser.id,
                    username: storedUser.username,
                    balance: INITIAL_BALANCE,
                    lives: INITIAL_LIVES,
                }]);

            if (memberError) throw memberError;

            setGroupName('');
            await fetchGroups(); 
            
        } catch (error) {
            alert('Error al crear grupo: ' + error.message);
        }
    }

    async function joinGroup(groupId) {
        if (!storedUser?.id) return;
        
        try {
            const { error } = await supabase
                .from('group_members')
                .insert([{
                    group_id: groupId,
                    user_id: storedUser.id,
                    username: storedUser.username,
                    balance: INITIAL_BALANCE,
                    lives: INITIAL_LIVES,
                }]);

            if (error) {
                if (error.code === '23505') { 
                    alert('Ya eres miembro de este grupo.');
                } else {
                    throw error;
                }
            }
            await fetchGroups(); 
        } catch (error) {
            alert('Error al unirse al grupo: ' + error.message);
        }
    }

    // 🔑 FUNCIÓN CLAVE PARA ENTRAR AL DASHBOARD
    function handleSelectGroup(group) { 
        if (!group.group_members || group.group_members.length === 0) {
            return alert("Error: El grupo no cargó sus miembros. Revisa tu RLS en 'group_members'.");
        }
        
        // 1. Llama a la función del Contexto para guardar el grupo (setGroup)
        selectGroup(group); 
        
        // 2. Navegar
        navigate('/dashboard/game');
    }

    // --- Efecto de Carga Inicial ---
    useEffect(() => {
        if (!isLoadingAuth) { 
            fetchGroups();
        }
    }, [isLoadingAuth]);

    // --- Renderizado de Carga y Redirección ---
    if (isLoadingAuth || isLoading) { 
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-950 to-fuchsia-950 text-white">
                <div className="text-center">
                    <h1 className="text-3xl font-bold">Cargando grupos...</h1>
                    {error && <p className="text-red-400 mt-2">{error}</p>}
                    <div className="border-t-4 border-b-4 border-pink-400 border-solid rounded-full w-12 h-12 animate-spin mx-auto mt-4"></div>
                </div>
            </div>
        );
    }
    
    // Si no hay usuario después de cargar, redirigir a login
    if (!user) {
        navigate('/login');
        return null;
    }


    // --- Renderizado Principal ---
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-950 to-fuchsia-950 p-6 text-white">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-extrabold mb-8 text-pink-400">Selección de Grupo</h1>
                
                {/* Bloque de Crear Grupo */}
                <div className="bg-white/10 p-6 rounded-xl shadow-lg mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-purple-300">Crear Nuevo Grupo</h2>
                    <div className="flex space-x-4">
                        <input
                            type="text"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder="Nombre del nuevo grupo"
                            className="flex-grow p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400"
                        />
                        <button
                            onClick={createGroup}
                            className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 shadow-md"
                            disabled={!groupName.trim()}
                        >
                            Crear
                        </button>
                    </div>
                </div>

                {/* Lista de Grupos */}
                <h2 className="text-2xl font-bold mb-4 text-pink-300">Grupos Disponibles ({groups.length})</h2>
                {groups.length === 0 ? (
                    <p className="text-white/70">No hay grupos disponibles. ¡Crea uno!</p>
                ) : (
                    <div className="space-y-4">
                        {groups.map(group => {
                            const isMember = group.group_members.some(m => m.user_id === storedUser.id);
                            const memberCount = group.group_members.length;
                            
                            return (
                                <div key={group.id} className="bg-white/10 p-5 rounded-xl shadow-lg flex justify-between items-center transition duration-300 hover:bg-white/20">
                                    <div>
                                        <div className="text-xl font-bold">{group.name}</div>
                                        <div className="text-sm text-white/70 mt-1">
                                            {memberCount} {memberCount === 1 ? 'miembro' : 'miembros'}
                                        </div>
                                    </div>
                                    {isMember ? (
                                        <button 
                                            onClick={() => handleSelectGroup(group)}
                                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 shadow-md"
                                        >
                                            Entrar
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => joinGroup(group.id)}
                                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 shadow-md"
                                        >
                                            Unirse
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
