import React, { useState, useEffect, useContext } from 'react';
import { UserGroupContext } from '../contexts/UserGroupContext';
import { supabase } from '../supabaseClient';

export default function LiveboxPage() {
  const { user, group, groupMembers } = useContext(UserGroupContext);
  const [livePokemons, setLivePokemons] = useState([]);
  const [currentBox, setCurrentBox] = useState(1);
  const [newPokemonName, setNewPokemonName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [selectedUser, setSelectedUser] = useState('all');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allPokemonNames, setAllPokemonNames] = useState([]);

  // Cargar lista completa de Pokémon (incluyendo generaciones modernas)
  useEffect(() => {
    const fetchAllPokemonNames = async () => {
      try {
        // Obtener todos los Pokémon hasta la generación 9
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1300');
        const data = await response.json();
        
        const pokemonList = data.results.map((pokemon, index) => ({
          name: pokemon.name,
          id: index + 1,
          displayName: pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1).replace(/-/g, ' ')
        }));

        // Añadir variantes regionales manualmente
        const regionalVariants = [
          // Alola
          'rattata-alola', 'raticate-alola', 'raichu-alola', 'sandshrew-alola', 'sandslash-alola',
          'vulpix-alola', 'ninetales-alola', 'diglett-alola', 'dugtrio-alola', 'meowth-alola',
          'persian-alola', 'geodude-alola', 'graveler-alola', 'golem-alola', 'grimer-alola',
          'muk-alola', 'exeggutor-alola', 'marowak-alola',
          
          // Galar
          'meowth-galar', 'ponyta-galar', 'rapidash-galar', 'slowpoke-galar', 'slowbro-galar',
          'farfetchd-galar', 'weezing-galar', 'mr-mime-galar', 'articuno-galar', 'zapdos-galar',
          'moltres-galar', 'slowking-galar', 'corsola-galar', 'zigzagoon-galar', 'linoone-galar',
          'darumaka-galar', 'darmanitan-galar', 'yamask-galar', 'stunfisk-galar',
          
          // Hisui
          'growlithe-hisui', 'arcanine-hisui', 'voltorb-hisui', 'electrode-hisui', 'typhlosion-hisui',
          'qwilfish-hisui', 'sneasel-hisui', 'samurott-hisui', 'lilligant-hisui', 'basculin-hisui',
          'zorua-hisui', 'zoroark-hisui', 'braviary-hisui', 'sliggoo-hisui', 'goodra-hisui',
          'avalugg-hisui', 'decidueye-hisui',
          
          // Paldea
          'tauros-paldea-aqua', 'tauros-paldea-blaze', 'tauros-paldea-combat',
          'wooper-paldea',
          
          // Formas especiales
          'pikachu-original', 'pikachu-hoenn', 'pikachu-sinnoh', 'pikachu-unova', 'pikachu-kalos',
          'pikachu-alola', 'pikachu-partner', 'pikachu-world',
          'eevee-starter',
          'pichu-spiky',
          'unown-a', 'unown-b', 'unown-c', 'unown-d', 'unown-e', 'unown-f', 'unown-g', 'unown-h',
          'unown-i', 'unown-j', 'unown-k', 'unown-l', 'unown-m', 'unown-n', 'unown-o', 'unown-p',
          'unown-q', 'unown-r', 'unown-s', 'unown-t', 'unown-u', 'unown-v', 'unown-w', 'unown-x',
          'unown-y', 'unown-z', 'unown-exclamation', 'unown-question',
          
          // Pokémon modernos (Generación 8 y 9)
          'grookey', 'thwackey', 'rillaboom', 'scorbunny', 'raboot', 'cinderace', 'sobble', 'drizzile',
          'inteleon', 'skwovet', 'greedent', 'rookidee', 'corvisquire', 'corviknight', 'blipbug',
          'dottler', 'orbeetle', 'nickit', 'thievul', 'gossifleur', 'eldegoss', 'wooloo', 'dubwool',
          'chewtle', 'drednaw', 'yamper', 'boltund', 'rolycoly', 'carkol', 'coalossal', 'applin',
          'flapple', 'appletun', 'silicobra', 'sandaconda', 'cramorant', 'arrokuda', 'barraskewda',
          'toxel', 'toxtricity', 'sizzlipede', 'centiskorch', 'clobbopus', 'grapploct', 'sinistea',
          'polteageist', 'hatenna', 'hattrem', 'hatterene', 'impidimp', 'morgrem', 'grimmsnarl',
          'obstagoon', 'perrserker', 'cursola', 'sirfetchd', 'mr-rime', 'runerigus', 'milcery',
          'alcremie', 'falinks', 'pincurchin', 'snom', 'frosmoth', 'stonjourner', 'eiscue',
          'indeedee', 'morpeko', 'cufant', 'copperajah', 'dracozolt', 'arctozolt', 'dracovish',
          'arctovish', 'duraludon', 'dreepy', 'drakloak', 'dragapult', 'zacian', 'zamazenta',
          'eternatus', 'kubfu', 'urshifu', 'zarude', 'regieleki', 'regidrago', 'glastrier',
          'spectrier', 'calyrex',
          
          // Generación 9
          'sprigatito', 'floragato', 'meowscarada', 'fuecoco', 'crocalor', 'skeledirge',
          'quaxly', 'quaxwell', 'quaquaval', 'lechonk', 'oinkologne', 'tarountula',
          'spidops', 'nymble', 'lokix', 'pawmi', 'pawmo', 'pawmot', 'tandemaus',
          'maushold', 'fidough', 'dachsbun', 'smoliv', 'dolliv', 'arboliva', 'squawkabilly',
          'nacli', 'naclstack', 'garganacl', 'charcadet', 'armarouge', 'ceruledge',
          'tadbulb', 'bellibolt', 'wattrel', 'kilowattrel', 'maschiff', 'mabosstiff',
          'shroodle', 'grafaiai', 'bramblin', 'brambleghast', 'toedscool', 'toedscruel',
          'klawf', 'capsakid', 'scovillain', 'rellor', 'rabsca', 'flittle', 'espathra',
          'tinkatink', 'tinkatuff', 'tinkaton', 'wiglett', 'wugtrio', 'bombirdier',
          'finizen', 'palafin', 'varoom', 'revavroom', 'cyclizar', 'orthworm',
          'glimmet', 'glimmora', 'greavard', 'houndstone', 'flamigo', 'cetoddle',
          'cetitan', 'veluza', 'dondozo', 'tatsugiri', 'annihilape', 'clodsire',
          'farigiraf', 'dudunsparce', 'kingambit', 'great-tusk', 'scream-tail',
          'brute-bonnet', 'flutter-mane', 'slither-wing', 'sandy-shocks',
          'iron-treads', 'iron-bundle', 'iron-hands', 'iron-jugulis', 'iron-moth',
          'iron-thorns', 'frigibax', 'arctibax', 'baxcalibur', 'gimmighoul',
          'gholdengo', 'wo-chien', 'chien-pao', 'ting-lu', 'chi-yu', 'roaring-moon',
          'iron-valiant', 'koraidon', 'miraidon'
        ];

        // Añadir variantes a la lista
        regionalVariants.forEach(variantName => {
          const baseId = getBasePokemonId(variantName);
          if (baseId) {
            pokemonList.push({
              name: variantName,
              id: baseId,
              displayName: formatDisplayName(variantName)
            });
          }
        });

        setAllPokemonNames(pokemonList);
      } catch (error) {
        console.error('Error loading Pokémon names:', error);
      }
    };

    fetchAllPokemonNames();
  }, []);

  // Función para obtener ID base de un Pokémon variante
  const getBasePokemonId = (variantName) => {
    const baseNames = {
      // Alola
      'rattata-alola': 19, 'raticate-alola': 20, 'raichu-alola': 26, 'sandshrew-alola': 27,
      'sandslash-alola': 28, 'vulpix-alola': 37, 'ninetales-alola': 38, 'diglett-alola': 50,
      'dugtrio-alola': 51, 'meowth-alola': 52, 'persian-alola': 53,
      // Galar
      'meowth-galar': 52, 'ponyta-galar': 77, 'rapidash-galar': 78, 'slowpoke-galar': 79,
      'slowbro-galar': 80, 'farfetchd-galar': 83, 'weezing-galar': 110, 'mr-mime-galar': 122,
      // Hisui
      'growlithe-hisui': 58, 'arcanine-hisui': 59, 'voltorb-hisui': 100, 'electrode-hisui': 101,
      // Paldea
      'tauros-paldea-aqua': 128, 'tauros-paldea-blaze': 128, 'tauros-paldea-combat': 128,
      'wooper-paldea': 194
    };
    
    return baseNames[variantName] || parseInt(variantName.split('-')[0]) || 1;
  };

  // Formatear nombre para display
  const formatDisplayName = (name) => {
    return name.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Generar sugerencias
  const updateSuggestions = (input) => {
    if (input.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const filtered = allPokemonNames.filter(pokemon =>
      pokemon.displayName.toLowerCase().includes(input.toLowerCase()) ||
      pokemon.name.toLowerCase().includes(input.toLowerCase())
    ).slice(0, 8);

    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  };

  // Cargar Pokémon vivos desde la base de datos
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
    } catch (error) {
      console.error('❌ Error al cargar Pokémon vivos:', error);
    }
  };

  useEffect(() => {
    if (group?.id) {
      fetchLivePokemons();
    }
  }, [group?.id]);

  // Función para buscar Pokémon
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
      
      // Obtener mejor sprite disponible
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

  // Agregar Pokémon a la caja de vivos
  const addLivePokemon = async (pokemonName = null) => {
    const nameToSearch = pokemonName || newPokemonName.trim();
    if (!nameToSearch || !user?.id || !group?.id) return;
    
    try {
      const pokemonData = await searchPokemon(nameToSearch);
      if (!pokemonData) return;

      // Verificar si el Pokémon ya existe
      const existingPokemon = livePokemons.find(p => 
        p.user_id === user.id && 
        p.pokemon_id === pokemonData.id &&
        p.box_number === currentBox
      );

      if (existingPokemon) {
        throw new Error('Este Pokémon ya está en tu caja actual');
      }

      // Insertar Pokémon en la base de datos
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

      // Actualizar estado
      setLivePokemons(prev => [data, ...prev]);
      setNewPokemonName('');
      setSearchError('');
      setShowSuggestions(false);
      
      alert(`✅ ${pokemonData.displayName} añadido a la Caja ${currentBox}.`);
      
    } catch (error) {
      setSearchError(error.message);
    }
  };

  // Eliminar Pokémon de la caja de vivos (cuando muere)
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
      
      if (!isDeath) {
        alert(`✅ Pokémon eliminado de la caja.`);
      }
      
    } catch (error) {
      console.error('❌ Error al eliminar Pokémon:', error);
      if (!isDeath) {
        alert('Error al eliminar el Pokémon: ' + error.message);
      }
    }
  };

  // Escuchar cambios en la deadbox para eliminar automáticamente de la livebox
  useEffect(() => {
    if (!group?.id || !user?.id) return;

    // Suscribirse a cambios en la tabla deadbox_pokemons
    const subscription = supabase
      .channel('deadbox_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'deadbox_pokemons',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          console.log('🔄 Pokémon añadido a deadbox, buscando en livebox...', payload.new);
          
          // Buscar si este Pokémon existe en la livebox
          const { data: livePokemon } = await supabase
            .from('livebox_pokemons')
            .select('*')
            .eq('user_id', user.id)
            .eq('pokemon_id', payload.new.pokemon_id)
            .single();

          if (livePokemon) {
            console.log('🗑️ Eliminando Pokémon de livebox:', livePokemon);
            // Eliminar de la livebox
            await removeLivePokemon(livePokemon.id, true);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [group?.id, user?.id]);

  // Manejar cambio en el input de búsqueda
  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewPokemonName(value);
    updateSuggestions(value);
  };

  // Manejar selección de sugerencia
  const handleSuggestionClick = (suggestion) => {
    setNewPokemonName(suggestion.displayName);
    setShowSuggestions(false);
    addLivePokemon(suggestion.name);
  };

  // Manejar Enter en el input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && newPokemonName.trim() && !isLoading) {
      addLivePokemon();
    }
  };

  // Obtener username del miembro
  const getMemberUsername = (userId) => {
    const member = groupMembers.find(m => m.user_id === userId);
    return member?.username || 'Usuario';
  };

  // Obtener contador por usuario
  const getPokemonCountByUser = (userId) => {
    return livePokemons.filter(pokemon => pokemon.user_id === userId && pokemon.box_number === currentBox).length;
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const getPokemonSprite = (pokemon) => {
    if (pokemon.sprite_url) {
      return pokemon.sprite_url;
    }
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.pokemon_id}.png`;
  };

  // Filtrar Pokémon por caja y usuario
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
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-green-300 mb-4">No hay grupo seleccionado</h2>
        <p className="text-white/70">Por favor, selecciona un grupo primero.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-3xl font-bold mb-6 text-green-400 border-b border-green-400/50 pb-4">
        📦 Caja de Pokémon Vivos - {group.name}
      </h2>

      {/* Selector de Caja */}
      <div className="bg-white/10 p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold mb-4 text-green-300">Seleccionar Caja</h3>
        <div className="flex gap-2 flex-wrap">
          {[1, 2, 3].map(boxNum => (
            <button
              key={boxNum}
              onClick={() => setCurrentBox(boxNum)}
              className={`px-6 py-3 rounded-lg font-bold transition duration-300 ${
                currentBox === boxNum
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              Caja {boxNum}
              <span className="ml-2 text-xs bg-green-500/20 px-2 py-1 rounded-full">
                {livePokemons.filter(p => p.box_number === boxNum).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Información del usuario actual */}
      <div className="bg-green-900/30 p-4 rounded-xl border border-green-500/50">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-green-300">Tu Equipo en Caja {currentBox}</h3>
            <p className="text-white/70">
              Pokémon en esta caja: <span className="text-green-400 font-bold">{getPokemonCountByUser(user?.id)}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-white/70">
              Total Pokémon vivos: <span className="text-green-400 font-bold">
                {livePokemons.filter(p => p.user_id === user?.id).length}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Selector de jugador */}
      <div className="bg-white/10 p-4 rounded-xl">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-grow">
            <label className="block text-sm font-medium text-green-300 mb-2">Ver Pokémon de:</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full bg-white/10 border border-white/20 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <option value="all">👥 Todos los jugadores</option>
              {groupMembers.map(member => (
                <option key={member.user_id} value={member.user_id}>
                  {member.user_id === user?.id ? '⭐ ' : ''}
                  {member.username}
                  {member.user_id === user?.id ? ' (Tú)' : ''}
                </option>
              ))}
            </select>
          </div>
          
          {/* Contador */}
          <div className="bg-green-900/50 p-3 rounded-lg text-center min-w-[120px]">
            <div className="text-2xl font-bold text-green-400">{filteredPokemons.length}</div>
            <div className="text-white/70 text-sm">Pokémon</div>
          </div>
        </div>
      </div>

      {/* Formulario para agregar Pokémon */}
      {selectedUser === user?.id || selectedUser === 'all' ? (
        <div className="bg-white/10 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-green-300">Agregar Pokémon a Caja {currentBox}</h3>
          <div className="relative">
            <div className="flex gap-4">
              <div className="flex-grow relative">
                <input
                  type="text"
                  value={newPokemonName}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  onFocus={() => newPokemonName.length >= 2 && setShowSuggestions(true)}
                  placeholder="Escribe el nombre del Pokémon (ej: Pikachu, Raichu Alola, Meowth Galar)"
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                  disabled={isLoading}
                />
                
                {/* Sugerencias */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-gray-800 border border-white/20 rounded-lg mt-1 z-20 max-h-60 overflow-y-auto shadow-2xl">
                    {suggestions.map((suggestion) => (
                      <button
                        key={`${suggestion.id}-${suggestion.name}`}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left p-3 hover:bg-white/10 transition duration-200 flex items-center gap-3 text-white/80 hover:text-white border-b border-white/5 last:border-b-0"
                      >
                        <img
                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${suggestion.id}.png`}
                          alt={suggestion.displayName}
                          className="w-8 h-8 pixelated bg-white/10 rounded"
                          onError={(e) => {
                            e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${suggestion.id}.png`;
                          }}
                        />
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{suggestion.displayName}</span>
                          <span className="text-white/50 text-xs">#{suggestion.id}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                
                {searchError && (
                  <p className="text-red-400 text-sm mt-2">❌ {searchError}</p>
                )}
              </div>
              <button
                onClick={() => addLivePokemon()}
                disabled={!newPokemonName.trim() || isLoading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition duration-300 flex items-center gap-2 whitespace-nowrap"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Buscando...
                  </>
                ) : (
                  '➕ Agregar Pokémon'
                )}
              </button>
            </div>
            <p className="text-white/60 text-sm mt-2">
              💡 <strong>Formas regionales disponibles:</strong> Raichu Alola, Vulpix Alola, Meowth Galar, Slowpoke Galar, etc.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-blue-900/30 p-4 rounded-xl border border-blue-500/50">
          <p className="text-blue-300 text-center">
            👀 Estás viendo la caja de vivos de <strong>{getMemberUsername(selectedUser)}</strong>. 
            Solo puedes agregar Pokémon a tu propia caja.
          </p>
        </div>
      )}

      {/* Grid de Pokémon vivos */}
      {filteredPokemons.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filteredPokemons.map((pokemon) => (
            <div
              key={pokemon.id}
              className="bg-gradient-to-br from-green-900/40 to-green-700/30 border border-green-500/30 rounded-xl p-3 shadow-lg hover:shadow-green-500/20 transition-all duration-300 hover:scale-[1.02] relative group pokemon-box"
            >
              {/* Botón eliminar */}
              {pokemon.user_id === user?.id && (selectedUser === user?.id || selectedUser === 'all') && (
                <button
                  onClick={() => removeLivePokemon(pokemon.id)}
                  className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg z-10 text-xs"
                  title="Eliminar Pokémon"
                >
                  ×
                </button>
              )}

              {/* Indicador de propietario */}
              {selectedUser === 'all' && (
                <div className="absolute -top-2 -left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  {getMemberUsername(pokemon.user_id)}
                </div>
              )}

              {/* Imagen del Pokémon */}
              <div className="flex justify-center mb-2">
                <img
                  src={getPokemonSprite(pokemon)}
                  alt={pokemon.name}
                  className="w-16 h-16 object-contain bg-white/10 rounded-lg p-1"
                  onError={(e) => {
                    e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.pokemon_id}.png`;
                  }}
                />
              </div>

              {/* Información del Pokémon */}
              <div className="text-center">
                <h4 className="text-sm font-bold text-white mb-1">
                  {pokemon.name}
                </h4>
                <p className="text-white/70 text-xs mb-2">#{String(pokemon.pokemon_id).padStart(3, '0')}</p>
                
                {/* Tipos */}
                <div className="flex justify-center gap-1 mb-2">
                  {pokemon.types?.map((type) => (
                    <span
                      key={type}
                      className={`px-1 py-0.5 rounded-full text-xs font-bold capitalize ${getTypeColor(type)}`}
                    >
                      {type}
                    </span>
                  ))}
                </div>

                {/* Información adicional */}
                <div className="text-xs text-white/50 border-t border-white/10 pt-1">
                  <div>Caja {pokemon.box_number}</div>
                  <div>Agregado: {formatDate(pokemon.date_added)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-2xl font-bold text-white/70 mb-2">
            {selectedUser === 'all' 
              ? `La Caja ${currentBox} del grupo está vacía` 
              : `${getMemberUsername(selectedUser)} no tiene Pokémon en la Caja ${currentBox}`}
          </h3>
          <p className="text-white/50">
            {selectedUser === 'all' || selectedUser === user?.id
              ? 'Agrega Pokémon que estén vivos en tu aventura Locke'
              : 'Este entrenador aún no ha agregado Pokémon a esta caja'}
          </p>
        </div>
      )}

      {/* Estadísticas del grupo */}
      <div className="bg-white/10 p-6 rounded-xl shadow-lg mt-8">
        <h3 className="text-xl font-bold mb-4 text-green-300">Estadísticas del Grupo</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-900/30 rounded-lg">
            <div className="text-2xl text-green-400 font-bold">{livePokemons.length}</div>
            <div className="text-white/70 text-sm">Total Pokémon</div>
          </div>
          <div className="text-center p-4 bg-blue-900/30 rounded-lg">
            <div className="text-2xl text-blue-400 font-bold">
              {new Set(livePokemons.map(p => p.user_id)).size}
            </div>
            <div className="text-white/70 text-sm">Jugadores Activos</div>
          </div>
          <div className="text-center p-4 bg-purple-900/30 rounded-lg">
            <div className="text-2xl text-purple-400 font-bold">
              {new Set(livePokemons.map(p => p.pokemon_id)).size}
            </div>
            <div className="text-white/70 text-sm">Especies Únicas</div>
          </div>
          <div className="text-center p-4 bg-yellow-900/30 rounded-lg">
            <div className="text-2xl text-yellow-400 font-bold">
              {Math.round(livePokemons.length / Math.max(groupMembers.length, 1))}
            </div>
            <div className="text-white/70 text-sm">Promedio por Jugador</div>
          </div>
        </div>
      </div>
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