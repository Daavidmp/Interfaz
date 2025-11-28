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
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('myGroups');
    const [groupToDelete, setGroupToDelete] = useState(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [groupToLeave, setGroupToLeave] = useState(null);
    const [leaveConfirmation, setLeaveConfirmation] = useState('');
    const [isLeaving, setIsLeaving] = useState(false);
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
        
        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }
        
        if (password.length < 4) {
            alert('La contraseña debe tener al menos 4 caracteres');
            return;
        }

        try {
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
            setPassword('');
            setConfirmPassword('');
            await fetchGroups(); 
            alert(`¡Grupo "${groupData.name}" creado exitosamente!`);
            setActiveTab('myGroups');
            
        } catch (error) {
            console.error('Error completo:', error);
            alert('Error al crear grupo: ' + error.message);
        }
    }

    async function joinGroup(groupId, groupPassword) {
        if (!storedUser?.id) return;
        
        try {
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
            
            setSelectedGroup(null);
            setJoinPassword('');
            await fetchGroups(); 
            alert(`¡Te has unido al grupo "${group.name}" exitosamente!`);
            setActiveTab('myGroups');
        } catch (error) {
            console.error('Error completo:', error);
            alert('Error al unirse al grupo: ' + error.message);
        }
    }

    // Función para ELIMINAR grupo permanentemente (solo creador)
    async function deleteGroup() {
        if (!groupToDelete || !storedUser?.id) return;
        
        const expectedText = `eliminar ${groupToDelete.name}`;
        if (deleteConfirmation !== expectedText) {
            alert(`Por favor, escribe exactamente: "${expectedText}" para confirmar la eliminación.`);
            return;
        }

        setIsDeleting(true);
        try {
            console.log('🔍 Iniciando eliminación del grupo:', groupToDelete.id);
            
            // Verificar que el usuario es el creador
            if (groupToDelete.created_by !== storedUser.id) {
                alert('No tienes permisos para eliminar este grupo. Solo el creador puede eliminarlo.');
                return;
            }

            // PASO 1: Eliminar datos de transacciones relacionadas (si existe la tabla)
            try {
                console.log('🗑️ Eliminando transacciones relacionadas...');
                const { error: transactionsError } = await supabase
                    .from('transactions')
                    .delete()
                    .eq('group_id', groupToDelete.id);
                
                if (transactionsError && transactionsError.code !== '42P01') {
                    console.log('Error en transacciones:', transactionsError);
                }
            } catch (e) {
                console.log('Tabla transactions probablemente no existe, continuando...');
            }

            // PASO 2: Eliminar datos de apuestas relacionadas (si existe la tabla)
            try {
                console.log('🗑️ Eliminando apuestas relacionadas...');
                const { error: betsError } = await supabase
                    .from('bets')
                    .delete()
                    .eq('group_id', groupToDelete.id);
                
                if (betsError && betsError.code !== '42P01') {
                    console.log('Error en bets:', betsError);
                }
            } catch (e) {
                console.log('Tabla bets probablemente no existe, continuando...');
            }

            // PASO 3: Eliminar datos de partidos relacionados (si existe la tabla)
            try {
                console.log('🗑️ Eliminando partidos relacionados...');
                const { error: matchesError } = await supabase
                    .from('matches')
                    .delete()
                    .eq('group_id', groupToDelete.id);
                
                if (matchesError && matchesError.code !== '42P01') {
                    console.log('Error en matches:', matchesError);
                }
            } catch (e) {
                console.log('Tabla matches probablemente no existe, continuando...');
            }

            // PASO 4: Eliminar todos los miembros del grupo
            console.log('🗑️ Eliminando miembros del grupo...');
            const { error: membersError } = await supabase
                .from('group_members')
                .delete()
                .eq('group_id', groupToDelete.id);

            if (membersError) {
                console.error('Error eliminando miembros:', membersError);
            }

            // PASO 5: Finalmente eliminar el grupo
            console.log('🗑️ Eliminando grupo de la base de datos...');
            const { data, error: groupError } = await supabase
                .from('groups')
                .delete()
                .eq('id', groupToDelete.id)
                .select();

            if (groupError) {
                console.error('Error eliminando grupo:', groupError);
                throw groupError;
            }

            console.log('✅ Grupo eliminado exitosamente');
            
            // Limpiar estados y recargar
            setGroupToDelete(null);
            setDeleteConfirmation('');
            await fetchGroups();
            
            alert(`¡Grupo "${groupToDelete.name}" eliminado permanentemente!`);
            
        } catch (error) {
            console.error('❌ Error completo al eliminar grupo:', error);
            alert('Error al eliminar grupo: ' + error.message);
        } finally {
            setIsDeleting(false);
        }
    }

    // Función para SALIRSE del grupo (miembros)
    async function leaveGroup() {
        if (!groupToLeave || !storedUser?.id) return;
        
        const expectedText = `salir de ${groupToLeave.name}`;
        if (leaveConfirmation !== expectedText) {
            alert(`Por favor, escribe exactamente: "${expectedText}" para confirmar.`);
            return;
        }

        setIsLeaving(true);
        try {
            // Solo eliminar al usuario de la tabla group_members
            const { error } = await supabase
                .from('group_members')
                .delete()
                .eq('group_id', groupToLeave.id)
                .eq('user_id', storedUser.id);

            if (error) throw error;

            setGroupToLeave(null);
            setLeaveConfirmation('');
            await fetchGroups();
            alert(`¡Has salido del grupo "${groupToLeave.name}"!`);
            
        } catch (error) {
            console.error('Error al salir del grupo:', error);
            alert('Error al salir del grupo: ' + error.message);
        } finally {
            setIsLeaving(false);
        }
    }

    // Función para preparar la ELIMINACIÓN de un grupo
    function prepareDeleteGroup(group) {
        setGroupToDelete(group);
        setDeleteConfirmation('');
    }

    // Función para preparar SALIRSE de un grupo
    function prepareLeaveGroup(group) {
        setGroupToLeave(group);
        setLeaveConfirmation('');
    }

    // Función para cancelar eliminación
    function cancelDelete() {
        setGroupToDelete(null);
        setDeleteConfirmation('');
    }

    // Función para cancelar salir del grupo
    function cancelLeave() {
        setGroupToLeave(null);
        setLeaveConfirmation('');
    }

    // Función para verificar contraseña al entrar
    function handleSelectGroup(group) { 
        if (!group.group_members || group.group_members.length === 0) {
            return alert("Error: El grupo no cargó sus miembros. Revisa tu RLS en 'group_members'.");
        }

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

    // Verificar si el usuario es el creador del grupo
    function isGroupCreator(group) {
        return group.created_by === storedUser?.id;
    }

    // Filtrar grupos según el término de búsqueda
    const filteredGroups = groups.filter(group => 
        group.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Obtener grupos del usuario
    const myGroups = groups.filter(group => 
        group.group_members?.some(m => m.user_id === storedUser?.id)
    );

    // Obtener grupos disponibles para unirse (no soy miembro)
    const availableGroups = groups.filter(group => 
        !group.group_members?.some(m => m.user_id === storedUser?.id)
    );

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
                <h1 className="text-4xl font-extrabold mb-8 text-pink-400">Gestión de Grupos</h1>
                
                {/* Navegación por pestañas */}
                <div className="flex border-b border-white/20 mb-8">
                    <button
                        className={`py-3 px-6 font-medium transition-colors ${
                            activeTab === 'myGroups' 
                                ? 'text-pink-400 border-b-2 border-pink-400' 
                                : 'text-white/70 hover:text-white'
                        }`}
                        onClick={() => setActiveTab('myGroups')}
                    >
                        Mis Grupos ({myGroups.length})
                    </button>
                    <button
                        className={`py-3 px-6 font-medium transition-colors ${
                            activeTab === 'search' 
                                ? 'text-pink-400 border-b-2 border-pink-400' 
                                : 'text-white/70 hover:text-white'
                        }`}
                        onClick={() => setActiveTab('search')}
                    >
                        Buscar Grupos ({availableGroups.length})
                    </button>
                    <button
                        className={`py-3 px-6 font-medium transition-colors ${
                            activeTab === 'create' 
                                ? 'text-pink-400 border-b-2 border-pink-400' 
                                : 'text-white/70 hover:text-white'
                        }`}
                        onClick={() => setActiveTab('create')}
                    >
                        Crear Grupo
                    </button>
                </div>

                {/* Contenido de las pestañas */}
                <div className="tab-content">
                    {/* Pestaña: Mis Grupos */}
                    {activeTab === 'myGroups' && (
                        <div className="bg-white/10 p-6 rounded-xl shadow-lg">
                            <h2 className="text-2xl font-bold mb-4 text-purple-300">Mis Grupos</h2>
                            
                            {myGroups.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-white/70 mb-4">No estás en ningún grupo todavía.</p>
                                    <button 
                                        onClick={() => setActiveTab('search')}
                                        className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                                    >
                                        Buscar Grupos
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {myGroups.map(group => {
                                        const memberCount = group.group_members?.length || 0;
                                        const hasPassword = !!group.password;
                                        const isCreator = isGroupCreator(group);
                                        
                                        return (
                                            <div key={group.id} className="bg-white/10 p-5 rounded-xl shadow-lg flex justify-between items-center transition duration-300 hover:bg-white/20">
                                                <div className="flex items-center space-x-4">
                                                    <div>
                                                        <div className="text-xl font-bold flex items-center gap-2">
                                                            {group.name}
                                                            {hasPassword && (
                                                                <span className="text-yellow-400 text-sm">🔒</span>
                                                            )}
                                                            {isCreator && (
                                                                <span className="text-pink-400 text-sm" title="Creador del grupo">👑</span>
                                                            )}
                                                        </div>
                                                        <div className="text-sm text-white/70 mt-1">
                                                            {memberCount} {memberCount === 1 ? 'miembro' : 'miembros'}
                                                            {hasPassword && (
                                                                <span className="ml-2 text-yellow-400">Protegido</span>
                                                            )}
                                                            {isCreator && (
                                                                <span className="ml-2 text-pink-400">Eres el creador</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    {isCreator ? (
                                                        // Botón ELIMINAR para el creador
                                                        <button 
                                                            onClick={() => prepareDeleteGroup(group)}
                                                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 shadow-md"
                                                            title="Eliminar grupo permanentemente"
                                                        >
                                                            Eliminar
                                                        </button>
                                                    ) : (
                                                        // Botón SALIR para miembros
                                                        <button 
                                                            onClick={() => prepareLeaveGroup(group)}
                                                            className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 shadow-md"
                                                            title="Salir del grupo"
                                                        >
                                                            Salir
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => handleSelectGroup(group)}
                                                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 shadow-md"
                                                    >
                                                        Entrar
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Pestaña: Buscar Grupos */}
                    {activeTab === 'search' && (
                        <div className="bg-white/10 p-6 rounded-xl shadow-lg">
                            <h2 className="text-2xl font-bold mb-4 text-purple-300">Buscar Grupos</h2>
                            
                            {/* Barra de búsqueda */}
                            <div className="mb-6">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Buscar grupos por nombre..."
                                    className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400"
                                />
                            </div>
                            
                            {availableGroups.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-white/70 mb-4">No hay grupos disponibles para unirte.</p>
                                    <button 
                                        onClick={() => setActiveTab('create')}
                                        className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                                    >
                                        Crear un Grupo
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {availableGroups
                                        .filter(group => 
                                            group.name.toLowerCase().includes(searchTerm.toLowerCase())
                                        )
                                        .map(group => {
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
                                                    <button 
                                                        onClick={() => prepareJoinGroup(group)}
                                                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 shadow-md"
                                                    >
                                                        Unirse
                                                    </button>
                                                </div>
                                            );
                                        })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Pestaña: Crear Grupo */}
                    {activeTab === 'create' && (
                        <div className="bg-white/10 p-6 rounded-xl shadow-lg">
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
                    )}
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

                {/* Modal para ELIMINAR grupo (solo creador) */}
                {groupToDelete && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                        <div className="bg-white/20 backdrop-blur-lg p-6 rounded-xl shadow-lg max-w-md w-full">
                            <h3 className="text-2xl font-bold mb-4 text-red-400">
                                Eliminar Grupo
                            </h3>
                            <p className="text-white/80 mb-4">
                                ¿Estás seguro de que deseas <strong>ELIMINAR PERMANENTEMENTE</strong> el grupo <strong>"{groupToDelete.name}"</strong>? 
                                Esta acción <strong>NO SE PUEDE DESHACER</strong> y se perderán todos los datos del grupo.
                            </p>
                            <p className="text-white/70 mb-2">
                                Para confirmar, escribe exactamente: 
                            </p>
                            <p className="text-red-300 font-mono mb-4 bg-black/30 p-2 rounded">
                                eliminar {groupToDelete.name}
                            </p>
                            <input
                                type="text"
                                value={deleteConfirmation}
                                onChange={(e) => setDeleteConfirmation(e.target.value)}
                                placeholder={`Escribe "eliminar ${groupToDelete.name}"`}
                                className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-400 mb-4"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        deleteGroup();
                                    }
                                }}
                            />
                            <div className="flex space-x-3">
                                <button
                                    onClick={deleteGroup}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition duration-300 disabled:opacity-50"
                                    disabled={isDeleting || deleteConfirmation !== `eliminar ${groupToDelete.name}`}
                                >
                                    {isDeleting ? 'Eliminando...' : 'Eliminar Grupo'}
                                </button>
                                <button
                                    onClick={cancelDelete}
                                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition duration-300"
                                    disabled={isDeleting}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal para SALIR del grupo (miembros) */}
                {groupToLeave && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                        <div className="bg-white/20 backdrop-blur-lg p-6 rounded-xl shadow-lg max-w-md w-full">
                            <h3 className="text-2xl font-bold mb-4 text-orange-400">
                                Salir del Grupo
                            </h3>
                            <p className="text-white/80 mb-4">
                                ¿Estás seguro de que deseas salir del grupo <strong>"{groupToLeave.name}"</strong>? 
                                Perderás tu progreso en este grupo y tendrás que volver a unirte para participar.
                            </p>
                            <p className="text-white/70 mb-2">
                                Para confirmar, escribe exactamente: 
                            </p>
                            <p className="text-orange-300 font-mono mb-4 bg-black/30 p-2 rounded">
                                salir de {groupToLeave.name}
                            </p>
                            <input
                                type="text"
                                value={leaveConfirmation}
                                onChange={(e) => setLeaveConfirmation(e.target.value)}
                                placeholder={`Escribe "salir de ${groupToLeave.name}"`}
                                className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400 mb-4"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        leaveGroup();
                                    }
                                }}
                            />
                            <div className="flex space-x-3">
                                <button
                                    onClick={leaveGroup}
                                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg transition duration-300 disabled:opacity-50"
                                    disabled={isLeaving || leaveConfirmation !== `salir de ${groupToLeave.name}`}
                                >
                                    {isLeaving ? 'Saliendo...' : 'Salir del Grupo'}
                                </button>
                                <button
                                    onClick={cancelLeave}
                                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition duration-300"
                                    disabled={isLeaving}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}