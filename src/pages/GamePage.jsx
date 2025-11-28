import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import { UserGroupContext } from '../contexts/UserGroupContext';
import { supabase } from '../supabaseClient';
import tablaDeTipos from "./tablaDeTipos.jpg";

export default function GamePage({ activeSection, showCardPrices }) {
  const { group, groupMembers, user, INITIAL_LIVES } = useContext(UserGroupContext);
  const [deathHistory, setDeathHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [currentGym, setCurrentGym] = useState(1);
  const [todaysDeaths, setTodaysDeaths] = useState(0);
  const [showTypeChartModal, setShowTypeChartModal] = useState(false);
  const [enrichedMembers, setEnrichedMembers] = useState([]);
  const navigate = useNavigate();

  // Cargar perfiles de los miembros
  const loadMemberProfiles = async () => {
    if (!groupMembers || groupMembers.length === 0) return [];

    try {
      // Obtener los IDs de usuario únicos
      const userIds = [...new Set(groupMembers.map(member => member.user_id))];
      
      // Cargar los perfiles desde la tabla 'profiles'
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, avatar_url, display_name, username')
        .in('id', userIds);

      if (error) {
        console.error('Error al cargar perfiles:', error);
        return groupMembers;
      }

      // Crear un mapa de perfiles por ID de usuario
      const profileMap = {};
      profiles?.forEach(profile => {
        profileMap[profile.id] = profile;
      });

      // Combinar miembros con sus perfiles
      const membersWithProfiles = groupMembers.map(member => ({
        ...member,
        avatar_url: profileMap[member.user_id]?.avatar_url,
        display_name: profileMap[member.user_id]?.display_name || member.username,
        profile_username: profileMap[member.user_id]?.username || member.username
      }));

      return membersWithProfiles;
    } catch (error) {
      console.error('Error al cargar perfiles de miembros:', error);
      return groupMembers;
    }
  };

  // Cargar historial de muertes
  const fetchDeathHistory = async () => {
    if (!group?.id) return;

    try {
      const { data, error } = await supabase
        .from('deadbox_pokemons')
        .select('*')
        .eq('group_id', group.id)
        .order('date_added', { ascending: false })
        .limit(4);

      if (error) throw error;

      const enrichedData = data.map(record => {
        const member = enrichedMembers.find(m => m.user_id === record.user_id) || 
                      groupMembers.find(m => m.user_id === record.user_id);
        const displayName = member?.display_name || member?.username || 'Usuario';
        return {
          id: record.id,
          pokemonName: record.name,
          pokemonId: record.pokemon_id,
          spriteUrl: record.sprite_url,
          userName: displayName,
          userId: record.user_id,
          date: record.date_added,
          types: record.types || []
        };
      });

      setDeathHistory(enrichedData);
    } catch (error) {
      console.error('❌ Error al cargar historial de muertes:', error);
      setDeathHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Calcular muertes de hoy
  const calculateTodaysDeaths = async () => {
    if (!group?.id) return;

    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      const { data, error } = await supabase
        .from('deadbox_pokemons')
        .select('*')
        .eq('group_id', group.id)
        .gte('date_added', startOfDay.toISOString())
        .lt('date_added', new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString());

      if (error) throw error;
      
      setTodaysDeaths(data?.length || 0);
    } catch (error) {
      console.error('❌ Error al calcular muertes de hoy:', error);
      const totalDeaths = groupMembers.reduce((sum, member) => sum + (INITIAL_LIVES - (member.lives || INITIAL_LIVES)), 0);
      const avgDailyDeaths = Math.floor(totalDeaths / (group?.created_at ? Math.max(1, Math.ceil((new Date() - new Date(group.created_at)) / (1000 * 60 * 60 * 24))) : 1));
      setTodaysDeaths(avgDailyDeaths);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (group?.id && groupMembers?.length > 0) {
        const membersWithProfiles = await loadMemberProfiles();
        setEnrichedMembers(membersWithProfiles);
        await fetchDeathHistory();
        await calculateTodaysDeaths();
      } else {
        setIsLoadingHistory(false);
      }
    };

    loadData();
  }, [group?.id, groupMembers]);

  // Si no hay grupo, mostrar mensaje
  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-950 to-fuchsia-950">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-pink-300 mb-4">No hay grupo seleccionado</h2>
          <p className="text-white/70">Por favor, selecciona un grupo primero.</p>
        </div>
      </div>
    );
  }

  // Usar los miembros enriquecidos con perfiles, o los originales como fallback
  const membersToDisplay = enrichedMembers.length > 0 ? enrichedMembers : groupMembers;

  // Calcular estadísticas CORREGIDAS
  const activePlayers = membersToDisplay.filter(member => member.lives > 0).length;
  const totalPlayers = membersToDisplay.length;
  const totalDeaths = membersToDisplay.reduce((sum, member) => sum + (INITIAL_LIVES - (member.lives || INITIAL_LIVES)), 0);
  const totalBalance = membersToDisplay.reduce((sum, member) => sum + (member.balance || 0), 0);
  const avgBalance = totalPlayers > 0 ? Math.round(totalBalance / totalPlayers) : 0;

  // Calcular TASA DE SUPERVIVENCIA CORRECTAMENTE
  const calculateSurvivalRate = () => {
    if (totalPlayers === 0) return 0;
    
    const totalPossibleLives = totalPlayers * INITIAL_LIVES;
    const currentTotalLives = membersToDisplay.reduce((sum, member) => sum + (member.lives || 0), 0);
    
    // Tasa basada en vidas restantes vs vidas iniciales
    const survivalRate = (currentTotalLives / totalPossibleLives) * 100;
    return Math.round(survivalRate);
  };

  const survivalRate = calculateSurvivalRate();

  // Encontrar jugador con más muertes y más vidas
  const playerWithMostDeaths = membersToDisplay.reduce((max, member) => {
    const deaths = INITIAL_LIVES - (member.lives || INITIAL_LIVES);
    const displayName = member.display_name || member.username;
    return deaths > max.deaths ? { username: displayName, deaths } : max;
  }, { username: 'Nadie', deaths: 0 });

  const playerWithMostLives = membersToDisplay.reduce((max, member) => {
    const lives = member.lives || INITIAL_LIVES;
    const displayName = member.display_name || member.username;
    return lives > max.lives ? { username: displayName, lives } : max;
  }, { username: 'Nadie', lives: 0 });

  // Función para formatear la fecha relativa
  const formatRelativeTime = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);

      if (diffMins < 1) return 'ahora';
      if (diffMins < 60) return `${diffMins}m`;
      if (diffHours < 24) return `${diffHours}h`;
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    } catch (error) {
      return '--';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 to-fuchsia-950 p-6">
      {/* HEADER MEJORADO */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">
          🏆 Dashboard de <span className="text-pink-400">{group.name}</span>
        </h2>
        <p className="text-white/60">Estado actual del nuzlocke</p>
      </div>
      
      {/* GRID PRINCIPAL MEJORADO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMNA 1: Resumen y Tabla de Tipos */}
        <div className="space-y-6">
          
          {/* RESUMEN ESTADÍSTICAS MEJORADO */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
            <h3 className="text-xl font-bold mb-4 text-green-400 flex items-center gap-2">
              <div className="w-2 h-6 bg-green-400 rounded-full"></div>
              📊 Resumen General
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <StatCard 
                title="Jugadores Activos" 
                value={`${activePlayers}/${totalPlayers}`}
                icon="👥"
                color="blue"
              />
              <StatCard 
                title="Muertes Totales" 
                value={totalDeaths}
                icon="💀"
                color="red"
              />
              <StatCard 
                title="Balance Promedio" 
                value={`₿${avgBalance}`}
                icon="💰"
                color="yellow"
              />
              <StatCard 
                title="Tasa Supervivencia" 
                value={`${survivalRate}%`}
                icon="📈"
                color="green"
                subtitle={`${membersToDisplay.reduce((sum, member) => sum + (member.lives || 0), 0)}/${totalPlayers * INITIAL_LIVES} vidas`}
              />
            </div>

            {/* Gimnasio Actual Mejorado */}
            <div className="mt-6 p-4 bg-gradient-to-r from-yellow-900/30 to-amber-900/30 rounded-xl border border-yellow-500/30">
              <label className="block text-sm font-semibold text-yellow-300 mb-2 flex items-center gap-2">
                🏅 Gimnasio Actual
              </label>
              <div className="flex items-center gap-4">
                <select 
                  value={currentGym}
                  onChange={(e) => setCurrentGym(parseInt(e.target.value))}
                  className="flex-1 p-2 rounded-lg bg-white/10 border border-yellow-400/50 text-yellow-300 font-bold text-center focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((gymNumber) => (
                    <option key={gymNumber} value={gymNumber}>
                      Gimnasio {gymNumber}
                    </option>
                  ))}
                </select>
                <div className="text-right">
                  <div className="text-yellow-300 font-bold text-lg">{currentGym}/8</div>
                  <div className="text-yellow-400/70 text-xs">Progreso</div>
                </div>
              </div>
            </div>
          </div>

          {/* TABLA DE TIPOS MEJORADA - VERSIÓN PREMIUM */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-6 transition-all duration-300 hover:shadow-3xl hover:bg-white/15">
            <h3 className="text-xl font-bold mb-4 text-purple-400 flex items-center gap-2">
              <div className="w-2 h-6 bg-purple-400 rounded-full"></div>
              🎯 Tabla de Tipos Pokémon
            </h3>
            
            <div className="space-y-4">
              {/* Información de la tabla */}
              <div className="flex items-center justify-between text-sm">
                <div className="text-purple-300 font-medium">
                  Referencia de efectividad en combate
                </div>
                <div className="flex items-center gap-2 text-yellow-400">
                  <span className="text-xs">⭐</span>
                  <span className="text-xs font-semibold">Interactivo</span>
                </div>
              </div>

              {/* Contenedor de la imagen mejorado */}
              <div 
                className="relative cursor-pointer group transform transition-all duration-500 hover:scale-[1.02]"
                onClick={() => setShowTypeChartModal(true)}
              >
                {/* Marco decorativo */}
                <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-sm group-hover:blur-md transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
                
                {/* Contenedor principal de la imagen */}
                <div className="relative bg-gradient-to-br from-purple-900/50 to-pink-900/30 rounded-xl border-2 border-purple-400/30 group-hover:border-purple-400/60 transition-all duration-300 overflow-hidden">
                  {/* Efecto de brillo al hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Imagen de la tabla */}
                  <img 
                    src={tablaDeTipos}
                    alt="Tabla de tipos Pokémon - Haz clic para ver en tamaño completo" 
                    className="w-full h-56 object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/600x400/6b21a8/ffffff?text=Tabla+de+Tipos+Pokémon';
                    }}
                  />
                  
                  {/* Overlay informativo */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-4">
                    <div className="text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <div className="text-white font-bold text-lg mb-1 flex items-center justify-center gap-2">
                        <span>🔍</span>
                        Ver en grande
                      </div>
                      <div className="text-purple-200 text-sm">
                        Haz clic para explorar la tabla completa
                      </div>
                    </div>
                  </div>
                  
                  {/* Indicador de interacción */}
                  <div className="absolute top-3 right-3 w-8 h-8 bg-purple-500/90 rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300">
                    <span className="text-white text-lg">🔍</span>
                  </div>
                </div>
              </div>

              {/* Información adicional */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-purple-500/20 rounded-lg p-2 text-center border border-purple-400/30">
                  <div className="text-purple-300 font-semibold">Super Efectivo</div>
                  <div className="text-green-400">2x Daño</div>
                </div>
                <div className="bg-pink-500/20 rounded-lg p-2 text-center border border-pink-400/30">
                  <div className="text-pink-300 font-semibold">Poco Efectivo</div>
                  <div className="text-red-400">0.5x Daño</div>
                </div>
              </div>

              {/* Leyenda de colores */}
              <div className="flex justify-between items-center text-xs text-white/70">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500/80 rounded"></div>
                  <span>Ventaja</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500/80 rounded"></div>
                  <span>Desventaja</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-gray-500/80 rounded"></div>
                  <span>Neutral</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA 2: Jugadores y Destacados */}
        <div className="space-y-6">
          
          {/* JUGADORES MEJORADO */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
            <h3 className="text-xl font-bold mb-4 text-pink-400 flex items-center gap-2">
              <div className="w-2 h-6 bg-pink-400 rounded-full"></div>
              👥 Lista de Jugadores
            </h3>
            <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-2">
              {membersToDisplay.length > 0 ? (
                membersToDisplay.map(member => (
                  <PlayerCard 
                    key={member.user_id}
                    member={member}
                    INITIAL_LIVES={INITIAL_LIVES}
                  />
                ))
              ) : (
                <div className="text-center text-white/50 py-8">
                  <div className="text-4xl mb-2">👤</div>
                  <p>No hay miembros en el grupo</p>
                </div>
              )}
            </div>
          </div>
          
          {/* DESTACADOS MEJORADO */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
            <h3 className="text-xl font-bold mb-4 text-blue-400 flex items-center gap-2">
              <div className="w-2 h-6 bg-blue-400 rounded-full"></div>
              ⭐ Jugadores Destacados
            </h3>
            <div className="space-y-4">
              <HighlightCard 
                title="💪 Más Resistente"
                player={playerWithMostLives.username}
                value={`${playerWithMostLives.lives} vidas`}
                color="green"
              />
              <HighlightCard 
                title="☠️ Más Castigado"
                player={playerWithMostDeaths.username}
                value={`${playerWithMostDeaths.deaths} muertes`}
                color="red"
              />
              <div className="grid grid-cols-2 gap-4">
                <MiniStatCard 
                  title="Muertes Hoy"
                  value={todaysDeaths}
                  color="red"
                />
                <MiniStatCard 
                  title="Activos"
                  value={activePlayers}
                  color="green"
                />
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA 3: Historial de Muertes Mejorado */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-red-400 flex items-center gap-2">
              <div className="w-2 h-6 bg-red-400 rounded-full"></div>
              📋 Muertes Recientes
            </h3>
            {deathHistory.length > 0 && (
              <button 
                onClick={() => navigate('/dashboard/deadbox')}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Ver completo →
              </button>
            )}
          </div>
          
          <div className="space-y-3">
            {isLoadingHistory ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-3 border-red-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-white/60">Cargando historial...</p>
              </div>
            ) : deathHistory.length > 0 ? (
              deathHistory.map((death) => (
                <DeathHistoryItem 
                  key={death.id}
                  pokemonName={death.pokemonName}
                  pokemonId={death.pokemonId}
                  spriteUrl={death.spriteUrl}
                  userName={death.userName}
                  date={death.date}
                  types={death.types}
                  formatRelativeTime={formatRelativeTime}
                />
              ))
            ) : (
              <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
                <div className="text-6xl mb-4">💀</div>
                <h5 className="text-lg font-bold text-white/70 mb-2">No hay muertes registradas</h5>
                <p className="text-white/50">
                  Los Pokémon caídos aparecerán aquí
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL MEJORADO PARA LA TABLA DE TIPOS */}
      {showTypeChartModal && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowTypeChartModal(false)}
        >
          <div 
            className="relative bg-gradient-to-br from-purple-900 to-fuchsia-900 rounded-3xl shadow-2xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER DEL MODAL */}
            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-gradient-to-r from-purple-600/20 to-pink-600/20">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-3 h-8 bg-purple-400 rounded-full"></div>
                🎯 Tabla de Tipos Pokémon
              </h3>
              <button
                onClick={() => setShowTypeChartModal(false)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-xl font-bold flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                ×
              </button>
            </div>
            
            {/* CONTENIDO DEL MODAL */}
            <div className="p-6 max-h-[calc(90vh-80px)] overflow-auto">
              <img 
                src={tablaDeTipos}
                alt="Tabla de tipos Pokémon en tamaño completo" 
                className="w-full h-auto rounded-xl shadow-lg border border-white/20"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/800x600/6b21a8/ffffff?text=Tabla+de+Tipos+Pokémon';
                }}
              />
            </div>
            
            {/* FOOTER DEL MODAL */}
            <div className="p-4 border-t border-white/10 bg-gradient-to-r from-purple-600/10 to-pink-600/10">
              <div className="text-center text-white/60 text-sm">
                Haz clic fuera de la imagen para cerrar
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// COMPONENTE MEJORADO PARA TARJETAS DE JUGADOR CON IMAGEN DE PERFIL REAL
function PlayerCard({ member, INITIAL_LIVES }) {
  const lives = member.lives || INITIAL_LIVES;
  const deaths = INITIAL_LIVES - lives;
  
  const getLifeColor = (lives) => {
    if (lives > 15) return 'from-green-500 to-emerald-500';
    if (lives > 10) return 'from-yellow-500 to-amber-500';
    if (lives > 5) return 'from-orange-500 to-red-500';
    return 'from-red-600 to-pink-600';
  };

  // Función para obtener la imagen de perfil real del usuario
  const getProfileImage = () => {
    // Usar el avatar_url que viene del perfil
    if (member.avatar_url) {
      return member.avatar_url;
    }
    
    // Fallback: avatar por defecto con iniciales
    return `https://ui-avatars.com/api/?name=${member.username || 'User'}&background=random&color=fff&size=128&bold=true`;
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 group">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center overflow-hidden">
          <img
            src={getProfileImage()}
            alt={`Avatar de ${member.username}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Si falla la imagen, mostrar avatar por defecto con iniciales
              e.target.src = `https://ui-avatars.com/api/?name=${member.username || 'User'}&background=random&color=fff&size=128&bold=true`;
              e.target.className = "w-full h-full object-cover";
            }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-white truncate">
            {member.display_name || member.username}
          </div>
          <div className="text-xs text-white/60">₿{member.balance || 0}</div>
        </div>
      </div>
      
      <div className="text-right">
        <div className={`font-bold text-lg bg-gradient-to-r ${getLifeColor(lives)} bg-clip-text text-transparent`}>
          {lives}
        </div>
        <div className="text-xs text-white/40">
          {deaths} muertes
        </div>
      </div>
    </div>
  );
}

// COMPONENTE MEJORADO PARA ITEMS DEL HISTORIAL DE MUERTES
function DeathHistoryItem({ pokemonName, pokemonId, spriteUrl, userName, date, types, formatRelativeTime }) {
  return (
    <div className="flex items-center p-4 bg-gradient-to-r from-red-900/30 to-pink-900/20 rounded-xl border border-red-500/30 hover:border-red-400/50 transition-all duration-300 group">
      {/* Imagen del Pokémon */}
      <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-xl p-2 mr-4 group-hover:scale-110 transition-transform duration-300">
        <img
          src={spriteUrl}
          alt={pokemonName}
          className="w-8 h-8 object-contain"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/32x32/7f1d1d/ffffff?text=?';
          }}
        />
      </div>
      
      {/* Información de la muerte */}
      <div className="flex-grow min-w-0">
        <div className="flex justify-between items-start">
          <div className="min-w-0">
            <div className="font-bold text-white text-sm flex items-center gap-2">
              {pokemonName}
              <span className="text-white/40 text-xs">#{String(pokemonId).padStart(3, '0')}</span>
            </div>
            <div className="text-sm text-white/60">
              de <span className="text-red-300 font-semibold">{userName}</span>
            </div>
          </div>
          <div className="text-xs text-white/40 bg-black/30 px-2 py-1 rounded-full flex-shrink-0 ml-2">
            {formatRelativeTime(date)}
          </div>
        </div>
      </div>
    </div>
  );
}

// COMPONENTE MEJORADO PARA ESTADÍSTICAS CON SUBTÍTULO
function StatCard({ title, value, icon, color, subtitle }) {
  const colorClasses = {
    blue: 'from-blue-500 to-cyan-500',
    red: 'from-red-500 to-pink-500',
    yellow: 'from-yellow-500 to-amber-500',
    green: 'from-green-500 to-emerald-500'
  };

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-white/70 text-sm font-medium mb-1">{title}</div>
          <div className="text-2xl font-bold text-white">{value}</div>
          {subtitle && (
            <div className="text-xs text-white/50 mt-1">{subtitle}</div>
          )}
        </div>
        <div className={`text-2xl bg-gradient-to-r ${colorClasses[color]} bg-clip-text text-transparent`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// COMPONENTE PARA DESTACADOS
function HighlightCard({ title, player, value, color }) {
  const colorClasses = {
    green: 'from-green-500/20 to-emerald-500/20 border-green-400/30',
    red: 'from-red-500/20 to-pink-500/20 border-red-400/30',
    blue: 'from-blue-500/20 to-cyan-500/20 border-blue-400/30'
  };

  return (
    <div className={`bg-gradient-to-r ${colorClasses[color]} rounded-xl p-4 border`}>
      <div className="text-sm font-semibold text-white/70 mb-2">{title}</div>
      <div className="font-bold text-white text-lg truncate">{player}</div>
      <div className="text-white/60 text-sm">{value}</div>
    </div>
  );
}

// COMPONENTE PARA MINI ESTADÍSTICAS
function MiniStatCard({ title, value, color }) {
  const colorClasses = {
    red: 'text-red-400',
    green: 'text-green-400',
    blue: 'text-blue-400',
    yellow: 'text-yellow-400'
  };

  return (
    <div className="bg-white/5 rounded-lg p-3 text-center">
      <div className="text-white/70 text-xs mb-1">{title}</div>
      <div className={`font-bold text-lg ${colorClasses[color]}`}>{value}</div>
    </div>
  );
}