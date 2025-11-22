import React, { useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { UserGroupContext } from '../contexts/UserGroupContext'; 

const INITIAL_LIVES = 20;
const INITIAL_BALANCE = 5000;

export default function GroupPage() {
    const { user, selectGroup, isLoadingAuth } = useContext(UserGroupContext);
    
    const [groups, setGroups] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [groupName, setGroupName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [joinPassword, setJoinPassword] = useState('');
    const [selectedGroup, setSelectedGroup] = useState(null);
    const navigate = useNavigate();

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
                password,
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

    // --- Funciones de Modificación ---
    async function createGroup() {
        if (!groupName.trim() || !storedUser?.id) return;
        
        // Validar contraseñas
        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }
        
        if (password.length < 4) {
            alert('La contraseña debe tener al menos 4 caracteres');
            return;
        }

        try {
            // 1. Crear el grupo con contraseña
            const { data: groupData, error: groupError } = await supabase
                .from('groups')
                .insert([{ 
                    name: groupName, 
                    created_by: storedUser.id,
                    password: password
                }])
                .select(`
                    id, 
                    name, 
                    created_by,
                    password,
                    group_members (
                        user_id,
                        username,
                        balance,
                        lives
                    )
                `)
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

            // Limpiar formulario
            setGroupName('');
            setPassword('');
            setConfirmPassword('');
            
            // Recargar la lista de grupos
            await fetchGroups(); 
            
            alert(`¡Grupo "${groupData.name}" creado exitosamente!`);
            
        } catch (error) {
            console.error('Error completo:', error);
            alert('Error al crear grupo: ' + error.message);
        }
    }

    async function joinGroup(groupId, groupPassword) {
        if (!storedUser?.id) return;
        
        try {
            // Verificar contraseña antes de unirse
            const group = groups.find(g => g.id === groupId);
            if (!group) {
                alert('Grupo no encontrado');
                return;
            }

            if (group.password !== groupPassword) {
                alert('Contraseña incorrecta');
                return;
            }

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
            
            // Limpiar estado de unión
            setSelectedGroup(null);
            setJoinPassword('');
            
            await fetchGroups(); 
            
            alert(`¡Te has unido al grupo "${group.name}" exitosamente!`);
        } catch (error) {
            console.error('Error completo:', error);
            alert('Error al unirse al grupo: ' + error.message);
        }
    }

    // Función para verificar contraseña al entrar
    function handleSelectGroup(group) { 
        if (!group.group_members || group.group_members.length === 0) {
            return alert("Error: El grupo no cargó sus miembros. Revisa tu RLS en 'group_members'.");
        }

        // Si el grupo tiene contraseña, pedirla
        if (group.password) {
            const enteredPassword = prompt(`Ingresa la contraseña para el grupo "${group.name}":`);
            if (enteredPassword === null) return;
            
            if (enteredPassword !== group.password) {
                alert('Contraseña incorrecta');
                return;
            }
        }
        
        selectGroup(group); 
        navigate('/dashboard/game');
    }

    // Función para preparar la unión a un grupo
    function prepareJoinGroup(group) {
        setSelectedGroup(group);
        setJoinPassword('');
    }

    // Función para cancelar unión
    function cancelJoin() {
        setSelectedGroup(null);
        setJoinPassword('');
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
                    <div className="space-y-4">
                        <input
                            type="text"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder="Nombre del nuevo grupo"
                            className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Contraseña del grupo"
                                className="p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400"
                            />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repetir contraseña"
                                className="p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400"
                            />
                        </div>
                        <button
                            onClick={createGroup}
                            className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!groupName.trim() || !password || !confirmPassword}
                        >
                            Crear Grupo
                        </button>
                    </div>
                </div>

                {/* Modal para unirse a grupo con contraseña */}
                {selectedGroup && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                        <div className="bg-white/20 backdrop-blur-lg p-6 rounded-xl shadow-lg max-w-md w-full">
                            <h3 className="text-2xl font-bold mb-4 text-pink-300">
                                Unirse a {selectedGroup.name}
                            </h3>
                            <p className="text-white/80 mb-4">Este grupo está protegido con contraseña</p>
                            <input
                                type="password"
                                value={joinPassword}
                                onChange={(e) => setJoinPassword(e.target.value)}
                                placeholder="Ingresa la contraseña del grupo"
                                className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400 mb-4"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && joinPassword) {
                                        joinGroup(selectedGroup.id, joinPassword);
                                    }
                                }}
                            />
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => joinGroup(selectedGroup.id, joinPassword)}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition duration-300 disabled:opacity-50"
                                    disabled={!joinPassword}
                                >
                                    Unirse
                                </button>
                                <button
                                    onClick={cancelJoin}
                                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition duration-300"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Lista de Grupos */}
                <h2 className="text-2xl font-bold mb-4 text-pink-300">
                    Grupos Disponibles ({groups.length})
                </h2>
                
                {groups.length === 0 ? (
                    <p className="text-white/70">No hay grupos disponibles. ¡Crea uno!</p>
                ) : (
                    <div className="space-y-4">
                        {groups.map(group => {
                            const isMember = group.group_members?.some(m => m.user_id === storedUser.id) || false;
                            const memberCount = group.group_members?.length || 0;
                            const hasPassword = !!group.password;
                            
                            return (
                                <div key={group.id} className="bg-white/10 p-5 rounded-xl shadow-lg flex justify-between items-center transition duration-300 hover:bg-white/20">
                                    <div className="flex items-center space-x-4">
                                        <div>
                                            <div className="text-xl font-bold flex items-center gap-2">
                                                {group.name}
                                                {hasPassword && (
                                                    <span className="text-yellow-400 text-sm">🔒</span>
                                                )}
                                            </div>
                                            <div className="text-sm text-white/70 mt-1">
                                                {memberCount} {memberCount === 1 ? 'miembro' : 'miembros'}
                                                {hasPassword && (
                                                    <span className="ml-2 text-yellow-400">Protegido</span>
                                                )}
                                            </div>
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
                                            onClick={() => prepareJoinGroup(group)}
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