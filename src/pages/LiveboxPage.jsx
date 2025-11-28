import React, { useState, useEffect, useContext, useRef } from 'react';
import { UserGroupContext } from '../contexts/UserGroupContext';
import { supabase } from '../supabaseClient';

export default function LiveboxPage() {
  const { user, group, groupMembers } = useContext(UserGroupContext);
  const [livePokemons, setLivePokemons] = useState([]);
  const [currentBox, setCurrentBox] = useState(1);
  const [newPokemonName, setNewPokemonName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [selectedUser, setSelectedUser] = useState(user?.id || 'all');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allPokemonNames, setAllPokemonNames] = useState([]);
  const [addingPokemon, setAddingPokemon] = useState(null);
  const [recentlyAdded, setRecentlyAdded] = useState([]);
  
  const searchInputRef = useRef(null);
  const [suggestionsPosition, setSuggestionsPosition] = useState({ top: 0, left: 0, width: 0 });

  // Cargar lista completa de Pokémon
  useEffect(() => {
    const fetchAllPokemonNames = async () => {
      try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1300');
        const data = await response.json();
        
        const pokemonList = data.results.map((pokemon, index) => ({
          name: pokemon.name,
          id: index + 1,
          displayName: pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1).replace(/-/g, ' ')
        }));

        setAllPokemonNames(pokemonList);
      } catch (error) {
        console.error('Error loading Pokémon names:', error);
      }
    };

    fetchAllPokemonNames();
  }, []);

  // Por defecto mostrar la caja del usuario actual
  useEffect(() => {
    if (user?.id) {
      setSelectedUser(user.id);
    }
  }, [user?.id]);

  const formatDisplayName = (name) => {
    return name.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const updateSuggestions = (input) => {
    if (input.length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const filtered = allPokemonNames.filter(pokemon =>
      pokemon.displayName.toLowerCase().includes(input.toLowerCase()) ||
      pokemon.name.toLowerCase().includes(input.toLowerCase())
    ).slice(0, 6);

    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
    
    // Actualizar posición cuando hay sugerencias
    if (filtered.length > 0 && searchInputRef.current) {
      const rect = searchInputRef.current.getBoundingClientRect();
      setSuggestionsPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  };

  const fetchLivePokemons = async () => {
    if (!group?.id) return;

    try {
      const { data, error } = await supabase
        .from('livebox_pokemons')
        .select('*')
        .eq('group_id', group.id)
        .order('date_added', { ascending: false });

      if (error) throw error;
      setLivePokemons(data || []);
      
      // Pokémon recién añadidos (últimos 5)
      if (data && data.length > 0) {
        setRecentlyAdded(data.slice(0, 5));
      }
    } catch (error) {
      console.error('❌ Error al cargar Pokémon vivos:', error);
    }
  };

  useEffect(() => {
    if (group?.id) {
      fetchLivePokemons();
    }
  }, [group?.id]);

  // Sincronización automática cuando se añade un Pokémon a la caja de caídos
  useEffect(() => {
    if (!group?.id || !user?.id) return;

    const subscription = supabase
      .channel('deadbox_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'deadbox_pokemons',
          filter: `group_id=eq.${group.id}`
        },
        async (payload) => {
          console.log('🔄 Pokémon añadido a caja de caídos, verificando caja de vivos...');
          
          const { data: livePokemon } = await supabase
            .from('livebox_pokemons')
            .select('*')
            .eq('user_id', payload.new.user_id)
            .eq('pokemon_id', payload.new.pokemon_id)
            .eq('group_id', group.id)
            .single();

          if (livePokemon) {
            console.log('🗑️ Eliminando Pokémon de caja de vivos:', livePokemon.id);
            await removeLivePokemon(livePokemon.id, true);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [group?.id, user?.id]);

  const searchPokemon = async (pokemonName) => {
    setIsLoading(true);
    setSearchError('');
    
    try {
      const cleanName = pokemonName.toLowerCase().replace(/\s+/g, '-');
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${cleanName}`);
      
      if (!response.ok) {
        throw new Error('Pokémon no encontrado');
      }
      
      const data = await response.json();
      
      const spriteUrl = 
        data.sprites.other['official-artwork']?.front_default ||
        data.sprites.other?.home?.front_default ||
        data.sprites.front_default;

      return {
        id: data.id,
        name: data.name.charAt(0).toUpperCase() + data.name.slice(1),
        sprite_url: spriteUrl,
        types: data.types.map(typeInfo => typeInfo.type.name),
        displayName: formatDisplayName(data.name)
      };
    } catch (error) {
      setSearchError('Pokémon no encontrado. Verifica el nombre.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const addLivePokemon = async (pokemonName = null) => {
    const nameToSearch = pokemonName || newPokemonName.trim();
    if (!nameToSearch || !user?.id || !group?.id) return;
    
    try {
      const pokemonData = await searchPokemon(nameToSearch);
      if (!pokemonData) return;

      const existingPokemon = livePokemons.find(p => 
        p.user_id === user.id && 
        p.pokemon_id === pokemonData.id &&
        p.box_number === currentBox
      );

      if (existingPokemon) {
        throw new Error('Este Pokémon ya está en tu caja actual');
      }

      const newPokemon = {
        pokemon_id: pokemonData.id,
        name: pokemonData.displayName,
        sprite_url: pokemonData.sprite_url,
        types: pokemonData.types,
        user_id: user.id,
        group_id: group.id,
        box_number: currentBox
      };

      const { data, error } = await supabase
        .from('livebox_pokemons')
        .insert([newPokemon])
        .select()
        .single();

      if (error) throw error;

      setAddingPokemon(data.id);
      setTimeout(() => setAddingPokemon(null), 2000);

      setLivePokemons(prev => [data, ...prev]);
      setNewPokemonName('');
      setSearchError('');
      setShowSuggestions(false);
      
    } catch (error) {
      setSearchError(error.message);
    }
  };

  const removeLivePokemon = async (pokemonId, isDeath = false) => {
    try {
      const pokemonToDelete = livePokemons.find(p => p.id === pokemonId);
      if (!pokemonToDelete) throw new Error('Pokémon no encontrado');

      if (pokemonToDelete.user_id !== user.id && !isDeath) {
        throw new Error('Solo puedes eliminar tus propios Pokémon');
      }

      const { error } = await supabase
        .from('livebox_pokemons')
        .delete()
        .eq('id', pokemonId);

      if (error) throw error;

      setLivePokemons(prev => prev.filter(pokemon => pokemon.id !== pokemonId));
      
    } catch (error) {
      console.error('❌ Error al eliminar Pokémon:', error);
    }
  };

  const clearCurrentBox = async () => {
    if (!user?.id || !group?.id) return;

    const userPokemonsInBox = livePokemons.filter(p => 
      p.user_id === user.id && 
      p.box_number === currentBox
    );

    if (userPokemonsInBox.length === 0) {
      alert('No tienes Pokémon en esta caja');
      return;
    }

    const confirmMessage = `¿Estás seguro de que quieres eliminar TODOS tus ${userPokemonsInBox.length} Pokémon de la Caja ${currentBox}?\n\nEsta acción no se puede deshacer.`;
    
    if (confirm(confirmMessage)) {
      try {
        const { error } = await supabase
          .from('livebox_pokemons')
          .delete()
          .eq('user_id', user.id)
          .eq('group_id', group.id)
          .eq('box_number', currentBox);

        if (error) throw error;

        setLivePokemons(prev => 
          prev.filter(pokemon => !(pokemon.user_id === user.id && pokemon.box_number === currentBox))
        );
        
        alert(`✅ Se han eliminado ${userPokemonsInBox.length} Pokémon de la Caja ${currentBox}`);
        
      } catch (error) {
        console.error('❌ Error al limpiar la caja:', error);
        alert('Error al limpiar la caja: ' + error.message);
      }
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewPokemonName(value);
    updateSuggestions(value);
  };

  const handleSuggestionClick = (suggestion) => {
    setNewPokemonName(suggestion.displayName);
    setShowSuggestions(false);
    addLivePokemon(suggestion.name);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && newPokemonName.trim() && !isLoading) {
      addLivePokemon();
    }
  };

  const getMemberUsername = (userId) => {
    const member = groupMembers.find(m => m.user_id === userId);
    return member?.username || 'Usuario';
  };

  const getPokemonCountByUser = (userId) => {
    return livePokemons.filter(pokemon => pokemon.user_id === userId && pokemon.box_number === currentBox).length;
  };

  const getPokemonSprite = (pokemon) => {
    if (pokemon.sprite_url) {
      return pokemon.sprite_url;
    }
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.pokemon_id}.png`;
  };

  const getFilteredPokemons = () => {
    let filtered = livePokemons.filter(pokemon => pokemon.box_number === currentBox);
    
    if (selectedUser !== 'all') {
      filtered = filtered.filter(pokemon => pokemon.user_id === selectedUser);
    }
    
    return filtered;
  };

  const filteredPokemons = getFilteredPokemons();

  if (!group) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-bold text-green-300 mb-2">No hay grupo seleccionado</h2>
        <p className="text-white/70 text-sm">Selecciona un grupo primero.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">📦 Caja Pokémon - {group.name}</h1>
          <p className="text-white/70">Gestiona tu equipo Pokémon</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Panel Lateral - Buscador */}
          <div className="lg:col-span-1 space-y-6">
            {/* Buscador de Pokémon */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-yellow-400">🔍</span>
                Buscar Pokémon
              </h3>
              
              <div className="space-y-3">
                <div className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={newPokemonName}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    onFocus={() => {
                      if (newPokemonName.length >= 1) setShowSuggestions(true);
                      if (searchInputRef.current) {
                        const rect = searchInputRef.current.getBoundingClientRect();
                        setSuggestionsPosition({
                          top: rect.bottom + window.scrollY,
                          left: rect.left + window.scrollX,
                          width: rect.width
                        });
                      }
                    }}
                    placeholder="Escribe el nombre..."
                    className="w-full p-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200"
                    disabled={isLoading}
                  />
                </div>
                
                <button
                  onClick={() => addLivePokemon()}
                  disabled={!newPokemonName.trim() || isLoading}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Buscando...
                    </>
                  ) : (
                    <>
                      <span>➕</span>
                      Añadir a la Caja
                    </>
                  )}
                </button>
                
                {searchError && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <p className="text-red-400 text-sm">{searchError}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Información del Usuario */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4">👤 Tu Información</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-white/80">En esta caja:</span>
                  <span className="text-white font-bold text-lg">{getPokemonCountByUser(user?.id)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-white/80">Total Pokémon:</span>
                  <span className="text-white font-bold text-lg">
                    {livePokemons.filter(p => p.user_id === user?.id).length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-white/80">Caja actual:</span>
                  <span className="text-yellow-400 font-bold">#{currentBox}</span>
                </div>
              </div>
            </div>

            {/* Pokémon Recién Añadidos */}
            {recentlyAdded.length > 0 && (
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-4">🆕 Recién Añadidos</h3>
                <div className="space-y-2">
                  {recentlyAdded.slice(0, 4).map((pokemon) => (
                    <div key={pokemon.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                      <img
                        src={getPokemonSprite(pokemon)}
                        alt={pokemon.name}
                        className="w-8 h-8 bg-white/10 rounded"
                      />
                      <div className="flex-grow">
                        <div className="text-white text-sm font-medium">{pokemon.name}</div>
                        <div className="text-white/60 text-xs">C{pokemon.box_number}</div>
                      </div>
                      <div className="text-white/60 text-xs">
                        {getMemberUsername(pokemon.user_id)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Área Principal - Caja Pokémon */}
          <div className="lg:col-span-3">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl min-h-[600px]">
              {/* Header de la Caja */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Caja {currentBox} - {selectedUser === user?.id ? 'Tu Caja' : getMemberUsername(selectedUser)}
                  </h2>
                  <p className="text-white/60">
                    {filteredPokemons.length} Pokémon encontrados
                    {selectedUser !== 'all' && selectedUser !== user?.id && ` en la caja de ${getMemberUsername(selectedUser)}`}
                  </p>
                </div>
                
                <div className="flex gap-3">
                  {(selectedUser === user?.id || selectedUser === 'all') && (
                    <button
                      onClick={clearCurrentBox}
                      disabled={livePokemons.filter(p => p.user_id === user?.id && p.box_number === currentBox).length === 0}
                      className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 flex items-center gap-2"
                    >
                      🗑️ Limpiar Caja
                    </button>
                  )}
                </div>
              </div>

              {/* Grid de Pokémon */}
              {filteredPokemons.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {filteredPokemons.map((pokemon) => (
                    <PokemonCard
                      key={pokemon.id}
                      pokemon={pokemon}
                      user={user}
                      selectedUser={selectedUser}
                      getMemberUsername={getMemberUsername}
                      getPokemonSprite={getPokemonSprite}
                      removeLivePokemon={removeLivePokemon}
                      isAdding={addingPokemon === pokemon.id}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4 opacity-50">📦</div>
                  <h3 className="text-xl font-bold text-white/80 mb-2">
                    {selectedUser === 'all' 
                      ? `Caja ${currentBox} está vacía` 
                      : `${getMemberUsername(selectedUser)} no tiene Pokémon aquí`}
                  </h3>
                  <p className="text-white/50">
                    {selectedUser === user?.id
                      ? 'Usa el buscador para agregar Pokémon a tu caja'
                      : 'Este entrenador aún no ha agregado Pokémon a esta caja'}
                  </p>
                </div>
              )}
            </div>

            {/* Controles Inferiores */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Selector de Caja */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-4">🔄 Cambiar Caja</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map(boxNum => (
                    <button
                      key={boxNum}
                      onClick={() => setCurrentBox(boxNum)}
                      className={`p-4 rounded-lg font-bold transition-all duration-200 ${
                        currentBox === boxNum
                          ? 'bg-yellow-500 text-white shadow-lg transform scale-105'
                          : 'bg-white/10 text-white/80 hover:bg-white/20 hover:scale-105'
                      }`}
                    >
                      Caja {boxNum}
                      <div className="text-sm opacity-80 mt-1">
                        {livePokemons.filter(p => p.box_number === boxNum).length}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selector de Jugador */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-xl">
  <h3 className="text-lg font-bold text-white mb-4">👥 Ver Jugador</h3>
  <select
    value={selectedUser}
    onChange={(e) => setSelectedUser(e.target.value)}
    className="w-full bg-black/10 border border-white/20 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200 mb-3 hover:bg-black"
  >
    <option value={user?.id}>⭐ Mi Caja</option>
    <option value="all">👥 Todos los jugadores</option>
    {groupMembers
      .filter(member => member.user_id !== user?.id)
      .map(member => (
        <option key={member.user_id} value={member.user_id}>
          {member.username}
        </option>
      ))
    }
                </select>
                <div className="text-center text-white/60 text-sm">
                  Mostrando: {selectedUser === user?.id ? 'tu caja' : selectedUser === 'all' ? 'todos los jugadores' : `caja de ${getMemberUsername(selectedUser)}`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SUGERENCIAS CON POSICIONAMIENTO FIJO - FUERA DEL FLUJO NORMAL */}
        {showSuggestions && (
          <div 
            className="fixed bg-gray-900 border border-yellow-400/50 rounded-lg shadow-2xl z-[99999] max-h-80 overflow-y-auto"
            style={{
              top: `${suggestionsPosition.top}px`,
              left: `${suggestionsPosition.left}px`,
              width: `${suggestionsPosition.width}px`
            }}
          >
            {suggestions.length > 0 ? (
              suggestions.map((suggestion) => (
                <button
                  key={`${suggestion.id}-${suggestion.name}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left p-3 hover:bg-yellow-500/20 transition-all duration-200 flex items-center gap-3 text-white border-b border-gray-700 last:border-b-0 group bg-gray-800"
                >
                  <img
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${suggestion.id}.png`}
                    alt={suggestion.displayName}
                    className="w-8 h-8 bg-gray-700 rounded group-hover:scale-110 transition-transform duration-200"
                  />
                  <div className="flex-grow">
                    <div className="font-medium text-white group-hover:text-yellow-300 transition-colors">
                      {suggestion.displayName}
                    </div>
                    <div className="text-gray-400 text-xs">#{suggestion.id.toString().padStart(3, '0')}</div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-3 text-gray-400 text-sm text-center bg-gray-800">
                {newPokemonName.length > 0 ? 'No se encontraron Pokémon' : 'Escribe para buscar...'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ... (el resto del código del componente PokemonCard se mantiene igual)

// Componente de Tarjeta de Pokémon (mejorado)
function PokemonCard({ pokemon, user, selectedUser, getMemberUsername, getPokemonSprite, removeLivePokemon, isAdding }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async () => {
    setIsRemoving(true);
    setTimeout(async () => {
      await removeLivePokemon(pokemon.id);
      setIsRemoving(false);
    }, 300);
  };

  const typeColors = {
    normal: 'from-gray-400 to-gray-500',
    fire: 'from-red-500 to-orange-500',
    water: 'from-blue-500 to-cyan-500',
    electric: 'from-yellow-400 to-yellow-500',
    grass: 'from-green-500 to-lime-500',
    ice: 'from-cyan-300 to-blue-300',
    fighting: 'from-red-600 to-red-700',
    poison: 'from-purple-500 to-pink-500',
    ground: 'from-yellow-600 to-yellow-700',
    flying: 'from-indigo-300 to-purple-300',
    psychic: 'from-pink-500 to-rose-500',
    bug: 'from-lime-500 to-green-500',
    rock: 'from-yellow-600 to-yellow-700',
    ghost: 'from-purple-600 to-indigo-600',
    dragon: 'from-indigo-500 to-purple-500',
    dark: 'from-gray-700 to-gray-800',
    steel: 'from-gray-500 to-gray-600',
    fairy: 'from-pink-300 to-rose-300'
  };

  const primaryType = pokemon.types?.[0] || 'normal';
  const gradient = typeColors[primaryType] || typeColors.normal;

  return (
    <div 
      className={`
        relative rounded-xl p-3 shadow-lg border border-white/20 backdrop-blur-sm
        transition-all duration-300 transform
        ${isAdding ? 'animate-pulse ring-2 ring-yellow-400' : ''}
        ${isRemoving ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}
        ${isHovered ? 'scale-105 shadow-xl -translate-y-1' : 'scale-100'}
        bg-gradient-to-br ${gradient}
        hover:border-white/40
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Botón eliminar */}
      {pokemon.user_id === user?.id && (selectedUser === user?.id || selectedUser === 'all') && (
        <button
          onClick={handleRemove}
          className={`
            absolute -top-2 -right-2 bg-red-500 hover:bg-red-600
            text-white rounded-full w-6 h-6 flex items-center justify-center 
            shadow-lg z-10 text-xs font-bold
            transition-all duration-300
            ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}
          `}
          title="Eliminar Pokémon"
        >
          ×
        </button>
      )}

      {/* Indicador de propietario */}
      {selectedUser === 'all' && (
        <div className="absolute -top-2 -left-2 bg-blue-500 text-white text-[10px] px-2 py-1 rounded-full shadow-lg font-bold">
          {getMemberUsername(pokemon.user_id).substring(0, 3)}
        </div>
      )}

      {/* Imagen del Pokémon */}
      <div className="flex justify-center mb-3">
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
          <img
            src={getPokemonSprite(pokemon)}
            alt={pokemon.name}
            className="w-14 h-14 object-contain"
            onError={(e) => {
              e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.pokemon_id}.png`;
            }}
          />
        </div>
      </div>

      {/* Información del Pokémon */}
      <div className="text-center space-y-2">
        <h4 className="text-sm font-bold text-white truncate">
          {pokemon.name}
        </h4>
        
        <p className="text-white/80 text-xs font-mono bg-black/20 rounded px-2 py-1">
          #{String(pokemon.pokemon_id).padStart(3, '0')}
        </p>
        
        <div className="flex flex-col gap-1">
          {pokemon.types?.slice(0, 2).map((type) => (
            <span
              key={type}
              className="px-2 py-1 rounded-full text-xs font-bold capitalize bg-white/20 text-white"
            >
              {type}
            </span>
          ))}
        </div>

        <div className="text-xs text-white/60 border-t border-white/20 pt-2 mt-2">
          <div className="flex justify-between items-center">
            <span>C{pokemon.box_number}</span>
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          </div>
        </div>
      </div>
    </div>
  );
}