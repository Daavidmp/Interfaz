import React, { useState, useEffect, useContext } from 'react';
import { UserGroupContext } from '../contexts/UserGroupContext';
import { supabase } from '../supabaseClient';

export default function DeadboxPage() {
  const { user, group, groupMembers, fetchGroupMembers, INITIAL_LIVES } = useContext(UserGroupContext);
  const [deadPokemons, setDeadPokemons] = useState([]);
  const [filteredPokemons, setFilteredPokemons] = useState([]);
  const [newPokemonName, setNewPokemonName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [selectedUser, setSelectedUser] = useState('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Cargar Pokémon caídos desde la base de datos
  const fetchDeadPokemons = async () => {
    if (!group?.id) return;

    try {
      console.log('🔄 Cargando Pokémon caídos para grupo:', group.id);
      
      const { data, error } = await supabase
        .from('deadbox_pokemons')
        .select('*')
        .eq('group_id', group.id)
        .order('date_added', { ascending: false });

      if (error) {
        console.error('❌ Error al cargar Pokémon caídos:', error);
        throw error;
      }

      console.log('✅ Pokémon caídos cargados:', data);
      setDeadPokemons(data || []);
      setFilteredPokemons(data || []);
    } catch (error) {
      console.error('❌ Error fatal al cargar Pokémon caídos:', error);
      alert('Error al cargar la caja de caídos: ' + error.message);
    }
  };

  useEffect(() => {
    if (group?.id) {
      fetchDeadPokemons();
    }
  }, [group?.id]);

  // Filtrar Pokémon según el usuario seleccionado
  useEffect(() => {
    if (selectedUser === 'all') {
      setFilteredPokemons(deadPokemons);
    } else {
      setFilteredPokemons(deadPokemons.filter(pokemon => pokemon.user_id === selectedUser));
    }
  }, [selectedUser, deadPokemons]);

  // Función para buscar Pokémon en PokeAPI
  const searchPokemon = async (pokemonName) => {
    setIsLoading(true);
    setSearchError('');
    
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`);
      
      if (!response.ok) {
        throw new Error('Pokémon no encontrado');
      }
      
      const data = await response.json();
      
      return {
        id: data.id,
        name: data.name.charAt(0).toUpperCase() + data.name.slice(1),
        sprite_url: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
        types: data.types.map(typeInfo => typeInfo.type.name)
      };
    } catch (error) {
      setSearchError(error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Función para actualizar las vidas del usuario
  const updateUserLives = async (userId, change) => {
    try {
      console.log('🔄 Actualizando vidas para usuario:', userId, 'Cambio:', change);
      
      // Obtener las vidas actuales del usuario
      const { data: currentMember, error: fetchError } = await supabase
        .from('group_members')
        .select('lives')
        .eq('user_id', userId)
        .eq('group_id', group.id)
        .single();

      if (fetchError) throw fetchError;

      const currentLives = currentMember.lives || 0;
      let newLives = currentLives + change;

      // Limitar las vidas al máximo (INITIAL_LIVES)
      newLives = Math.min(newLives, INITIAL_LIVES);
      // No permitir vidas negativas
      newLives = Math.max(newLives, 0);

      console.log(`🔄 Actualizando vidas: ${currentLives} → ${newLives}`);

      // Actualizar las vidas en la base de datos
      const { error: updateError } = await supabase
        .from('group_members')
        .update({ lives: newLives })
        .eq('user_id', userId)
        .eq('group_id', group.id);

      if (updateError) throw updateError;

      console.log(`✅ Vidas actualizadas correctamente`);
      
      // Actualizar el contexto
      if (fetchGroupMembers) {
        await fetchGroupMembers(group.id);
      }

      return newLives;
    } catch (error) {
      console.error('❌ Error al actualizar vidas:', error);
      throw error;
    }
  };

  // Agregar Pokémon a la caja de caídos (REDUCE 1 vida)
  const addDeadPokemon = async () => {
    if (!newPokemonName.trim() || !user?.id || !group?.id) return;
    
    console.log('🔄 Intentando agregar Pokémon:', newPokemonName);
    
    try {
      // 1. Buscar Pokémon
      const pokemonData = await searchPokemon(newPokemonName.trim());
      if (!pokemonData) {
        throw new Error('Pokémon no encontrado');
      }

      // 2. Verificar que el usuario tiene vidas disponibles
      const currentMember = groupMembers.find(m => m.user_id === user.id);
      if (!currentMember || currentMember.lives <= 0) {
        throw new Error('No tienes vidas disponibles para perder');
      }

      // 3. Reducir 1 vida
      await updateUserLives(user.id, -1);

      // 4. Insertar Pokémon en la base de datos
      console.log('🔄 Insertando Pokémon en la base de datos...');
      
      const newPokemon = {
        pokemon_id: pokemonData.id,
        name: pokemonData.name,
        sprite_url: pokemonData.sprite_url,
        types: pokemonData.types,
        user_id: user.id,
        group_id: group.id
      };

      const { data, error } = await supabase
        .from('deadbox_pokemons')
        .insert([newPokemon])
        .select()
        .single();

      if (error) {
        // Si falla la inserción, restaurar la vida
        await updateUserLives(user.id, +1);
        throw new Error(`Error de base de datos: ${error.message}`);
      }

      console.log('✅ Pokémon insertado correctamente:', data);

      // Actualizar estado
      setDeadPokemons(prev => [data, ...prev]);
      setNewPokemonName('');
      setSearchError('');
      
      alert(`✅ ${pokemonData.name} añadido a la caja de caídos. Se ha reducido 1 vida.`);
      
    } catch (error) {
      console.error('❌ Error completo al agregar Pokémon:', error);
      setSearchError(error.message);
    }
  };

  // Eliminar Pokémon de la caja (AUMENTA 1 vida)
  const removeDeadPokemon = async (pokemonId) => {
    try {
      console.log('🔄 Eliminando Pokémon:', pokemonId);
      
      // Encontrar el Pokémon que se va a eliminar
      const pokemonToDelete = deadPokemons.find(p => p.id === pokemonId);
      if (!pokemonToDelete) {
        throw new Error('Pokémon no encontrado');
      }

      // Verificar que el usuario es el propietario
      if (pokemonToDelete.user_id !== user.id) {
        throw new Error('Solo puedes eliminar tus propios Pokémon');
      }

      // Eliminar el Pokémon de la base de datos
      const { error } = await supabase
        .from('deadbox_pokemons')
        .delete()
        .eq('id', pokemonId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Aumentar 1 vida al usuario
      const newLives = await updateUserLives(user.id, +1);

      // Actualizar el estado local
      setDeadPokemons(prev => prev.filter(pokemon => pokemon.id !== pokemonId));
      
      console.log('✅ Pokémon eliminado correctamente, vida restaurada');
      alert(`✅ Pokémon eliminado de la caja de caídos. Se ha restaurado 1 vida. Vidas actuales: ${newLives}`);
      
    } catch (error) {
      console.error('❌ Error al eliminar Pokémon caído:', error);
      alert('Error al eliminar el Pokémon: ' + error.message);
    }
  };

  // Limpiar toda la caja (RESTAURA TODAS las vidas perdidas)
  const clearMyDeadbox = async () => {
    if (!user?.id || !group?.id) return;
    
    const userDeadPokemons = deadPokemons.filter(p => p.user_id === user.id);
    const deathsCount = userDeadPokemons.length;
    
    if (deathsCount === 0) {
      alert('No tienes Pokémon en la caja de caídos');
      return;
    }

    const confirmMessage = `¿Estás seguro de que quieres eliminar TODOS tus ${deathsCount} Pokémon caídos?\n\n✅ Se restaurarán ${deathsCount} vidas (máximo ${INITIAL_LIVES} vidas).`;
    
    if (confirm(confirmMessage)) {
      try {
        console.log('🔄 Eliminando todos los Pokémon del usuario...');
        
        // Eliminar todos los Pokémon del usuario
        const { error } = await supabase
          .from('deadbox_pokemons')
          .delete()
          .eq('user_id', user.id)
          .eq('group_id', group.id);

        if (error) throw error;

        // Restaurar todas las vidas perdidas (hasta el máximo)
        const currentMember = groupMembers.find(m => m.user_id === user.id);
        const currentLives = currentMember?.lives || 0;
        const livesToRestore = Math.min(deathsCount, INITIAL_LIVES - currentLives);
        
        if (livesToRestore > 0) {
          await updateUserLives(user.id, +livesToRestore);
        }

        // Actualizar estado local
        setDeadPokemons(prev => prev.filter(pokemon => pokemon.user_id !== user.id));
        
        console.log('✅ Todos los Pokémon eliminados, vidas restauradas');
        alert(`✅ Se han eliminado ${deathsCount} Pokémon de la caja de caídos y se han restaurado ${livesToRestore} vidas.`);
        
      } catch (error) {
        console.error('❌ Error al limpiar caja de caídos:', error);
        alert('Error al limpiar la caja: ' + error.message);
      }
    }
  };

  // Manejar Enter en el input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && canAddPokemon()) {
      addDeadPokemon();
    }
  };

  // Verificar si se pueden añadir Pokémon
  const canAddPokemon = () => {
    const currentMember = groupMembers.find(m => m.user_id === user?.id);
    const hasLives = currentMember?.lives > 0;
    
    return selectedUser === user?.id && !isLoading && newPokemonName.trim() && hasLives;
  };

  // Obtener username del miembro
  const getMemberUsername = (userId) => {
    const member = groupMembers.find(m => m.user_id === userId);
    return member?.username || 'Usuario';
  };

  // Obtener vidas del miembro
  const getMemberLives = (userId) => {
    const member = groupMembers.find(m => m.user_id === userId);
    return member?.lives || 0;
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtener contador por usuario
  const getPokemonCountByUser = (userId) => {
    return deadPokemons.filter(pokemon => pokemon.user_id === userId).length;
  };

  // Obtener usuario seleccionado actual
  const getSelectedUserName = () => {
    if (selectedUser === 'all') return 'Todos los jugadores';
    const member = groupMembers.find(m => m.user_id === selectedUser);
    return member?.username || 'Usuario';
  };

  if (!group) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-300 mb-4">No hay grupo seleccionado</h2>
        <p className="text-white/70">Por favor, selecciona un grupo primero.</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-300 mb-4">No hay usuario autenticado</h2>
        <p className="text-white/70">Por favor, inicia sesión primero.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-3xl font-bold mb-6 text-red-400 border-b border-red-400/50 pb-4">
        ⚰️ Caja de Caídos - {group.name}
      </h2>

      {/* Información del usuario actual */}
      <div className="bg-green-900/30 p-4 rounded-xl border border-green-500/50">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-green-300">Tus Estadísticas</h3>
            <p className="text-white/70">
              Vidas actuales: <span className="text-green-400 font-bold">{getMemberLives(user.id)}</span> / {INITIAL_LIVES}
            </p>
          </div>
          <div className="text-right">
            <p className="text-white/70">
              Pokémon caídos: <span className="text-red-400 font-bold">{getPokemonCountByUser(user.id)}</span>
            </p>
            <p className="text-sm text-white/50">
              Eliminar Pokémon restaura 1 vida
            </p>
          </div>
        </div>
      </div>

      {/* Selector de jugador */}
      <div className="bg-white/10 p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold mb-4 text-red-300">Ver caja de:</h3>
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full bg-white/10 border border-white/20 text-white p-3 rounded-lg text-left flex justify-between items-center hover:bg-white/15 transition duration-300"
          >
            <span>{getSelectedUserName()}</span>
            <span className={`transform transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 bg-gray-800 border border-white/20 rounded-lg mt-1 z-10 max-h-60 overflow-y-auto">
              {/* Opción "Todos" */}
              <button
                onClick={() => {
                  setSelectedUser('all');
                  setIsDropdownOpen(false);
                }}
                className={`w-full text-left p-3 hover:bg-white/10 transition duration-200 flex justify-between items-center ${
                  selectedUser === 'all' ? 'bg-red-600 text-white' : 'text-white/80'
                }`}
              >
                <span>👥 Todos los jugadores</span>
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {deadPokemons.length}
                </span>
              </button>
              
              {/* Separador */}
              <div className="border-t border-white/20 my-1"></div>
              
              {/* Lista de jugadores */}
              {groupMembers.map((member) => (
                <button
                  key={member.user_id}
                  onClick={() => {
                    setSelectedUser(member.user_id);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left p-3 hover:bg-white/10 transition duration-200 flex justify-between items-center ${
                    selectedUser === member.user_id ? 'bg-red-600 text-white' : 'text-white/80'
                  }`}
                >
                  <div className="flex flex-col items-start">
                    <span>
                      {member.user_id === user?.id ? '⭐ ' : ''}
                      {member.username}
                      {member.user_id === user?.id ? ' (Tú)' : ''}
                    </span>
                    <span className="text-xs text-green-400">
                      ❤️ {getMemberLives(member.user_id)}/{INITIAL_LIVES} vidas
                    </span>
                  </div>
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {getPokemonCountByUser(member.user_id)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Contador de caídos */}
      <div className="bg-red-900/30 p-4 rounded-xl border border-red-500/50">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-red-300">
              {selectedUser === 'all' ? 'Total de Pokémon Caídos' : `Pokémon Caídos de ${getSelectedUserName()}`}
            </h3>
            <p className="text-white/70">
              {selectedUser === 'all' 
                ? 'Un tributo a los valientes que perdieron la vida en este Locke' 
                : 'Un vistazo a las pérdidas de este entrenador'}
            </p>
          </div>
          <div className="text-4xl font-bold text-red-400 bg-red-950/50 px-6 py-3 rounded-lg">
            {filteredPokemons.length}
          </div>
        </div>
      </div>

      {/* Formulario para agregar Pokémon (solo visible para el usuario actual cuando ve su propia caja) */}
      {selectedUser === user?.id ? (
        <div className="bg-white/10 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-red-300">Agregar Pokémon Caído</h3>
          <div className="flex gap-4">
            <div className="flex-grow">
              <input
                type="text"
                value={newPokemonName}
                onChange={(e) => setNewPokemonName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nombre o ID del Pokémon (ej: Pikachu, 25, charizard)"
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400"
                disabled={isLoading || getMemberLives(user.id) <= 0}
              />
              {searchError && (
                <p className="text-red-400 text-sm mt-2">❌ {searchError}</p>
              )}
              {getMemberLives(user.id) <= 0 && (
                <p className="text-yellow-400 text-sm mt-2">⚠️ No tienes vidas disponibles</p>
              )}
            </div>
            <button
              onClick={addDeadPokemon}
              disabled={!canAddPokemon()}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition duration-300 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Buscando...
                </>
              ) : (
                '💀 Agregar Muerte'
              )}
            </button>
          </div>
          <p className="text-white/60 text-sm mt-2">
            ⚠️ Al agregar un Pokémon, se reducirá 1 vida automáticamente.
          </p>
        </div>
      ) : selectedUser === 'all' ? (
        <div className="bg-purple-900/30 p-4 rounded-xl border border-purple-500/50">
          <p className="text-purple-300 text-center">
            🔍 Estás viendo <strong>todas las cajas de caídos</strong>. 
            Para agregar Pokémon, selecciona tu nombre en el selector arriba.
          </p>
        </div>
      ) : (
        <div className="bg-blue-900/30 p-4 rounded-xl border border-blue-500/50">
          <p className="text-blue-300 text-center">
            👀 Estás viendo la caja de caídos de <strong>{getSelectedUserName()}</strong>. 
            Solo puedes agregar Pokémon a tu propia caja.
          </p>
        </div>
      )}

      {/* Botón para limpiar mis Pokémon (solo visible cuando se ve la caja propia) */}
      {selectedUser === user?.id && filteredPokemons.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={clearMyDeadbox}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center gap-2"
          >
            🔄 Restaurar Todas las Vidas
          </button>
        </div>
      )}

      {/* Grid de Pokémon caídos */}
      {filteredPokemons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPokemons.map((pokemon) => (
            <div
              key={pokemon.id}
              className="bg-gradient-to-br from-red-900/40 to-red-700/30 border border-red-500/30 rounded-xl p-4 shadow-lg hover:shadow-red-500/20 transition-all duration-300 hover:scale-[1.02] relative group"
            >
              {/* Botón eliminar (solo si es del usuario actual y estamos viendo su caja) */}
              {pokemon.user_id === user?.id && selectedUser === user?.id && (
                <button
                  onClick={() => removeDeadPokemon(pokemon.id)}
                  className="absolute -top-2 -right-2 bg-green-600 hover:bg-green-700 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg z-10"
                  title="Eliminar y restaurar 1 vida"
                >
                  ↶
                </button>
              )}

              {/* Indicador de propietario (cuando se ven todos) */}
              {selectedUser === 'all' && (
                <div className="absolute -top-2 -left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  {getMemberUsername(pokemon.user_id)}
                </div>
              )}

              {/* Imagen del Pokémon */}
              <div className="flex justify-center mb-3">
                <img
                  src={pokemon.sprite_url}
                  alt={pokemon.name}
                  className="w-32 h-32 object-contain bg-white/10 rounded-xl p-2"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/128x128/7f1d1d/ffffff?text=?';
                  }}
                />
              </div>

              {/* Información del Pokémon */}
              <div className="text-center">
                <h4 className="text-xl font-bold text-white mb-1">
                  {pokemon.name}
                </h4>
                <p className="text-white/70 text-sm mb-2">#{String(pokemon.pokemon_id).padStart(3, '0')}</p>
                
                {/* Tipos */}
                <div className="flex justify-center gap-2 mb-3">
                  {pokemon.types.map((type) => (
                    <span
                      key={type}
                      className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${getTypeColor(type)}`}
                    >
                      {type}
                    </span>
                  ))}
                </div>

                {/* Información de usuario y fecha */}
                <div className="text-xs text-white/50 border-t border-white/10 pt-2">
                  Caído el: {formatDate(pokemon.date_added)}
                </div>
                {selectedUser === 'all' && (
                  <div className="text-xs text-white/50">
                    Por: {getMemberUsername(pokemon.user_id)}
                  </div>
                )}
                {pokemon.user_id === user?.id && selectedUser === user?.id && (
                  <div className="text-xs text-green-400 mt-1">
                    💚 Click en ↶ para restaurar 1 vida
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Estado vacío */
        <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
          <div className="text-6xl mb-4">💀</div>
          <h3 className="text-2xl font-bold text-white/70 mb-2">
            {selectedUser === 'all' 
              ? 'La caja de caídos del grupo está vacía' 
              : `${getSelectedUserName()} no tiene Pokémon caídos`}
          </h3>
          <p className="text-white/50">
            {selectedUser === 'all' || selectedUser === user?.id
              ? 'Agrega Pokémon que hayan perdido la vida en tu aventura Locke'
              : 'Este entrenador aún no ha perdido ningún Pokémon'}
          </p>
        </div>
      )}
    </div>
  );
}

// Función para obtener colores según el tipo de Pokémon
function getTypeColor(type) {
  const typeColors = {
    normal: 'bg-gray-400 text-gray-900',
    fire: 'bg-red-500 text-white',
    water: 'bg-blue-500 text-white',
    electric: 'bg-yellow-400 text-yellow-900',
    grass: 'bg-green-500 text-white',
    ice: 'bg-cyan-300 text-cyan-900',
    fighting: 'bg-red-700 text-white',
    poison: 'bg-purple-500 text-white',
    ground: 'bg-yellow-600 text-white',
    flying: 'bg-indigo-300 text-indigo-900',
    psychic: 'bg-pink-500 text-white',
    bug: 'bg-lime-500 text-white',
    rock: 'bg-yellow-700 text-white',
    ghost: 'bg-purple-700 text-white',
    dragon: 'bg-indigo-600 text-white',
    dark: 'bg-gray-800 text-white',
    steel: 'bg-gray-500 text-white',
    fairy: 'bg-pink-300 text-pink-900'
  };
  
  return typeColors[type] || 'bg-gray-400 text-gray-900';

  
}