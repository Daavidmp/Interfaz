import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import { UserGroupContext } from '../contexts/UserGroupContext';
import Roulette from "../components/Roulette";
import { supabase } from '../supabaseClient';

export default function GamePage({ activeSection, showCardPrices }) {
  const { group, groupMembers, user, INITIAL_LIVES } = useContext(UserGroupContext);
  const [deathHistory, setDeathHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const navigate = useNavigate();

  console.log('🔍 GamePage - Estado:', { group, groupMembers, user });

  // Cargar historial de muertes
  const fetchDeathHistory = async () => {
    if (!group?.id) return;

    try {
      console.log('🔄 Cargando historial de muertes para grupo:', group.id);
      
      const { data, error } = await supabase
        .from('deadbox_pokemons')
        .select('*')
        .eq('group_id', group.id)
        .order('date_added', { ascending: false })
        .limit(10);

      if (error) {
        console.error('❌ Error en consulta:', error);
        throw error;
      }

      console.log('✅ Datos obtenidos:', data);

      // Enriquecer con información de usuarios
      const enrichedData = data.map(record => {
        const member = groupMembers.find(m => m.user_id === record.user_id);
        return {
          id: record.id,
          pokemonName: record.name,
          pokemonId: record.pokemon_id,
          spriteUrl: record.sprite_url,
          userName: member?.username || 'Usuario',
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

  useEffect(() => {
    if (group?.id) {
      fetchDeathHistory();
    } else {
      setIsLoadingHistory(false);
    }
  }, [group?.id, groupMembers]);

  // Si no hay grupo, mostrar mensaje
  if (!group) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-pink-300 mb-4">No hay grupo seleccionado</h2>
        <p className="text-white/70">Por favor, selecciona un grupo primero.</p>
      </div>
    );
  }

  // Calcular estadísticas
  const activePlayers = groupMembers.length;
  const totalDeaths = groupMembers.reduce((sum, member) => sum + (INITIAL_LIVES - (member.lives || INITIAL_LIVES)), 0);
  const totalBalance = groupMembers.reduce((sum, member) => sum + (member.balance || 0), 0);
  const avgBalance = activePlayers > 0 ? Math.round(totalBalance / activePlayers) : 0;

  // Función para formatear la fecha relativa
  const formatRelativeTime = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'ahora mismo';
      if (diffMins < 60) return `hace ${diffMins} min`;
      if (diffHours < 24) return `hace ${diffHours} h`;
      if (diffDays === 1) return 'ayer';
      if (diffDays < 7) return `hace ${diffDays} días`;
      
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit'
      });
    } catch (error) {
      return 'fecha desconocida';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold border-b border-white/10 pb-4 mb-6">Dashboard del Grupo: {group.name}</h2>
      
      <div className="grid grid-cols-3 gap-6">
        
        {/* COLUMNA 1: Reto Activo, Jugadores y Muertes */}
        <div className="col-span-1 space-y-6">
          
          {/* RETO ACTIVO */}
          <div className="bg-white/10 p-5 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold mb-3 text-pink-300">RETO ACTIVO</h3>
            <div className="bg-white/6 p-4 rounded-lg">
              <div className="font-semibold text-pink-300">Potenciador</div>
              <div className="text-white/80 mt-2 text-sm">Tu Pokémon obtiene un beneficio temporal.</div>
              <div className="mt-3 text-xs text-white/70">
                Asignado por <strong>dansón</strong> a <strong>{user?.username}</strong>
              </div>
            </div>
          </div>
          
          {/* JUGADORES Y VIDAS */}
          <div className="bg-white/10 p-5 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold mb-3 text-pink-300">JUGADORES Y VIDAS</h3>
            <div className="space-y-3">
              {groupMembers.length > 0 ? (
                groupMembers.map(member => (
                  <div key={member.user_id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="font-semibold">{member.username}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400 font-bold text-xl">{member.lives || INITIAL_LIVES}</span>
                      <span className="text-xs text-white/50">/ {INITIAL_LIVES}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-white/70 py-4">No hay miembros en el grupo</div>
              )}
            </div>
          </div>
          
          {/* MUERTES POR JUGADOR */}
          <div className="bg-white/10 p-5 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold mb-3 text-pink-300">MUERTES POR JUGADOR</h3>
            <div className="space-y-3">
              {groupMembers.length > 0 ? (
                groupMembers.map(member => (
                  <div key={member.user_id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="font-semibold">{member.username}</span>
                    <span className="text-pink-300 font-bold text-xl">{INITIAL_LIVES - (member.lives || INITIAL_LIVES)} muerte(s)</span>
                  </div>
                ))
              ) : (
                <div className="text-center text-white/70 py-4">No hay miembros en el grupo</div>
              )}
            </div>
          </div>

        </div>

        {/* COLUMNA 2: Ruleta */}
        <div className="col-span-1 bg-white/10 p-5 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-purple-300">🎡 RUEDA DE LA FORTUNA</h3>
          <div className="flex justify-center mb-4">
            <Roulette onResult={(result) => console.log('Resultado:', result)} />
          </div>
          <div className="text-center mt-4">
            <div className="text-white/70 text-sm mb-2">Próximo giro en: 23:26:42</div>
            <button className="px-8 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 font-bold text-white transition duration-300 hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 shadow-lg">
              ESPERA
            </button>
          </div>
        </div>

        {/* COLUMNA 3: Resumen del Locke */}
        <div className="col-span-1 bg-white/10 p-5 rounded-xl shadow-lg">
          <h4 className="font-bold mb-4 text-green-300 border-b border-green-300/50 pb-2 text-xl">RESUMEN DEL LOCKE</h4>
          <div className="space-y-4">
            <StatCard title="Jugadores Activos" value={activePlayers} />
            <StatCard title="Muertes Totales" value={totalDeaths} />
            
            <div className="p-3 bg-white/5 rounded-lg">
              <label className="block text-sm font-medium text-white/70 mb-1">
                Pokémon Gimnasio Actual
              </label>
              <input 
                type="number" 
                min="1" 
                max="8" 
                value="3"
                className="w-full p-2 rounded-md bg-white/10 text-xl font-bold text-yellow-400 text-center focus:ring-2 focus:ring-yellow-400 transition duration-300"
              />
            </div>

            <StatCard title="Balance Promedio" value={`₿${avgBalance}`} />
            <StatCard title="Precios de Cartas" value="Oculto" />
          </div>
        </div>
      </div>

      {/* SEGUNDA FILA: Visualización de Carta Activa e Historial de Muertes */}
      <div className="grid grid-cols-2 gap-6">
        
        {/* Visualización de la Carta Activa */}
        <div className="col-span-1 bg-white/10 p-5 rounded-xl shadow-lg">
          <h4 className="font-bold mb-4 text-yellow-300 border-b border-yellow-300/50 pb-2 text-xl">
            VISUALIZACIÓN DE LA CARTA ACTIVA
          </h4>
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-6 rounded-2xl shadow-2xl text-center min-w-[200px]">
              <div className="text-white">
                <div className="text-2xl font-bold mb-2">🎴</div>
                <div className="text-lg font-bold mb-1">Potenciador</div>
                <div className="text-sm">Poder: ALTO</div>
              </div>
            </div>
            <div className="text-center">
              <div className="font-bold text-pink-300 text-lg">{user?.username}</div>
              <div className="text-white/70 text-sm">Asignado a: {user?.username}</div>
            </div>
          </div>
        </div>
        
        {/* HISTORIAL DE MUERTES RECIENTES */}
        <div className="col-span-1 bg-white/10 p-5 rounded-xl shadow-lg">
          <h4 className="font-bold mb-4 text-red-300 border-b border-red-300/50 pb-2 text-xl">
            💀 REGISTRO DE MUERTES RECIENTES
          </h4>
          
          {isLoadingHistory ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-red-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-white/60">Cargando historial...</p>
            </div>
          ) : deathHistory.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
              {deathHistory.map((death) => (
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
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">💀</div>
              <h5 className="text-lg font-bold text-white/70 mb-2">No hay muertes registradas</h5>
              <p className="text-white/50 text-sm">
                Los Pokémon caídos aparecerán aquí
              </p>
            </div>
          )}

          {/* Botón para ver más */}
          {deathHistory.length > 0 && (
            <div className="mt-4 text-center">
              <button 
                onClick={() => navigate('/dashboard/deadbox')}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition duration-300 text-sm font-semibold"
              >
                Ver caja de caídos completa →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* TERCERA FILA: Marcador de Muertes y Vidas */}
      <div className="bg-white/10 p-5 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold mb-4 text-center">Marcador de Muertes y Vidas</h3>
        <div className="flex justify-center space-x-6">
          {groupMembers.length > 0 ? (
            groupMembers.map(member => (
              <div key={member.user_id} className="bg-white/5 p-6 rounded-2xl text-center min-w-[200px]">
                <div className="text-2xl font-bold text-pink-300 mb-2">{member.username}</div>
                <div className="text-4xl font-bold text-green-400 mb-2">{member.lives || INITIAL_LIVES}</div>
                <div className="text-white/70">({INITIAL_LIVES - (member.lives || INITIAL_LIVES)} caído(s))</div>
              </div>
            ))
          ) : (
            <div className="text-center text-white/70 py-4">No hay miembros en el grupo</div>
          )}
        </div>
      </div>
    </div>
  );
}

// Componente para items del historial de muertes
function DeathHistoryItem({ pokemonName, pokemonId, spriteUrl, userName, date, types, formatRelativeTime }) {
  return (
    <div className="flex items-center p-3 bg-red-900/20 border border-red-500/30 rounded-lg hover:bg-red-900/30 transition duration-300 group">
      {/* Imagen del Pokémon */}
      <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-lg p-1 mr-3">
        <img
          src={spriteUrl}
          alt={pokemonName}
          className="w-10 h-10 object-contain"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/40x40/7f1d1d/ffffff?text=?';
          }}
        />
      </div>
      
      {/* Información de la muerte */}
      <div className="flex-grow">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-semibold text-white flex items-center gap-2">
              {pokemonName}
              <span className="text-xs text-white/50">#{String(pokemonId).padStart(3, '0')}</span>
            </div>
            <div className="text-sm text-white/70">
              Caído de <span className="text-red-300 font-semibold">{userName}</span>
            </div>
          </div>
          <div className="text-xs text-white/50 text-right">
            {formatRelativeTime(date)}
          </div>
        </div>
        
        {/* Tipos del Pokémon */}
        {types && types.length > 0 && (
          <div className="flex gap-1 mt-2">
            {types.slice(0, 2).map((type) => (
              <span
                key={type}
                className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${getTypeColor(type)}`}
              >
                {type}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Componente Auxiliar
function StatCard({ title, value }) {
  return (
    <div className="p-3 bg-white/5 rounded-lg flex items-center justify-between hover:bg-white/10 transition duration-300">
      <div className="text-sm font-medium text-white/70">{title}</div>
      <div className="font-extrabold text-xl text-white">
        {value}
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