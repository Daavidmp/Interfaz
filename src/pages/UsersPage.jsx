import React, { useState, useEffect, useContext } from 'react';
import { UserGroupContext } from '../contexts/UserGroupContext';
import { supabase } from '../supabaseClient';

export default function UsersPage() {
  const { group, groupMembers, user, INITIAL_LIVES, fetchGroupMembers } = useContext(UserGroupContext);
  const [deadPokemons, setDeadPokemons] = useState([]);
  const [userStats, setUserStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('lives');

  // Cargar Pokémon caídos para estadísticas
  const fetchDeadPokemons = async () => {
    if (!group?.id) return;

    try {
      const { data, error } = await supabase
        .from('deadbox_pokemons')
        .select('*')
        .eq('group_id', group.id);

      if (error) throw error;
      setDeadPokemons(data || []);
    } catch (error) {
      console.error('Error al cargar Pokémon caídos:', error);
    }
  };

  // Calcular estadísticas por usuario
  const calculateUserStats = () => {
    const stats = {};
    
    groupMembers.forEach(member => {
      const deaths = deadPokemons.filter(pokemon => pokemon.user_id === member.user_id).length;
      const lives = member.lives || INITIAL_LIVES;
      const deathPercentage = INITIAL_LIVES > 0 ? (deaths / INITIAL_LIVES) * 100 : 0;
      const survivalRate = Math.max(0, 100 - deathPercentage);

      stats[member.user_id] = {
        username: member.username,
        lives: lives,
        deaths: deaths,
        initialLives: INITIAL_LIVES,
        deathPercentage: deathPercentage,
        survivalRate: survivalRate,
        balance: member.balance || 0,
        isCurrentUser: member.user_id === user?.id
      };
    });

    setUserStats(stats);
    setIsLoading(false);
  };

  useEffect(() => {
    if (group?.id) {
      fetchDeadPokemons();
    }
  }, [group?.id]);

  useEffect(() => {
    if (groupMembers.length > 0) {
      calculateUserStats();
    }
  }, [groupMembers, deadPokemons]);

  // Ordenar miembros
  const getSortedMembers = () => {
    return [...groupMembers].sort((a, b) => {
      const statsA = userStats[a.user_id] || {};
      const statsB = userStats[b.user_id] || {};

      switch (sortBy) {
        case 'lives':
          return (statsB.lives || 0) - (statsA.lives || 0);
        case 'deaths':
          return (statsB.deaths || 0) - (statsA.deaths || 0);
        case 'survival':
          return (statsB.survivalRate || 0) - (statsA.survivalRate || 0);
        case 'balance':
          return (statsB.balance || 0) - (statsA.balance || 0);
        case 'username':
          return (a.username || '').localeCompare(b.username || '');
        default:
          return 0;
      }
    });
  };

  // Calcular estadísticas generales del grupo
  const getGroupStats = () => {
    const totalMembers = groupMembers.length;
    const totalDeaths = Object.values(userStats).reduce((sum, stats) => sum + (stats.deaths || 0), 0);
    const totalLives = Object.values(userStats).reduce((sum, stats) => sum + (stats.lives || 0), 0);
    const totalBalance = Object.values(userStats).reduce((sum, stats) => sum + (stats.balance || 0), 0);
    const avgSurvivalRate = totalMembers > 0 
      ? Object.values(userStats).reduce((sum, stats) => sum + (stats.survivalRate || 0), 0) / totalMembers 
      : 0;

    return {
      totalMembers,
      totalDeaths,
      totalLives,
      totalBalance,
      avgSurvivalRate: Math.round(avgSurvivalRate * 10) / 10
    };
  };

  const groupStats = getGroupStats();
  const sortedMembers = getSortedMembers();

  if (!group) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-pink-300 mb-4">No hay grupo seleccionado</h2>
        <p className="text-white/70">Por favor, selecciona un grupo primero.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Header alineado con navegación */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-blue-400">
          👥 Gestión de Jugadores - {group.name}
        </h2>
        <div className="text-sm text-white/60">
          {/* Aquí iría tu componente de navegación */}
          <span>NAVEGACIÓN</span>
        </div>
      </div>

      {/* Estadísticas Generales del Grupo - Más compactas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <CompactStatCard 
          title="Jugadores" 
          value={groupStats.totalMembers} 
          icon="👥"
          color="blue"
        />
        <CompactStatCard 
          title="Muertes" 
          value={groupStats.totalDeaths} 
          icon="💀"
          color="red"
        />
        <CompactStatCard 
          title="Vidas" 
          value={groupStats.totalLives} 
          icon="❤️"
          color="green"
        />
        <CompactStatCard 
          title="Supervivencia" 
          value={`${groupStats.avgSurvivalRate}%`} 
          icon="📊"
          color="purple"
        />
      </div>

      {/* Controles de Ordenación - Más compacto */}
      <div className="bg-white/10 p-4 rounded-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3 className="text-lg font-bold text-blue-300">Lista de Jugadores</h3>
          <div className="flex items-center gap-2">
            <span className="text-white/70 text-sm">Ordenar:</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white/10 border border-white/20 text-white rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              <option value="lives">Vidas (↑)</option>
              <option value="deaths">Muertes (↓)</option>
              <option value="survival">Supervivencia (↑)</option>
              <option value="balance">Balance (↓)</option>
              <option value="username">Nombre (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Jugadores */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-white/60 text-sm">Cargando estadísticas...</p>
        </div>
      ) : sortedMembers.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {sortedMembers.map((member) => {
            const stats = userStats[member.user_id] || {};
            
            return (
              <CompactUserCard 
                key={member.user_id}
                member={member}
                stats={stats}
                isCurrentUser={member.user_id === user?.id}
                INITIAL_LIVES={INITIAL_LIVES}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 bg-white/5 rounded-lg border border-white/10">
          <div className="text-3xl mb-2">👥</div>
          <h3 className="text-lg font-bold text-white/70 mb-1">No hay jugadores</h3>
          <p className="text-white/50 text-sm">Invita a más jugadores al grupo.</p>
        </div>
      )}

      {/* Resumen Detallado - Optimizado para espacio */}
      {!isLoading && sortedMembers.length > 0 && (
        <div className="bg-white/10 p-4 rounded-lg mt-4">
          <h3 className="text-lg font-bold mb-4 text-blue-300 text-center">Resumen del Grupo</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Distribución de Vidas - Más compacto */}
            <div className="space-y-2">
              <h4 className="font-semibold text-white mb-2 text-center text-sm border-b border-white/20 pb-1">
                📊 Distribución de Vidas
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {sortedMembers.map((member) => {
                  const stats = userStats[member.user_id] || {};
                  return (
                    <div key={member.user_id} className="flex items-center justify-between p-2 bg-white/5 rounded hover:bg-white/10 transition-colors">
                      <span className="text-white/80 text-sm flex items-center gap-1 truncate">
                        {stats.isCurrentUser ? '⭐' : ''}
                        <span className="truncate">{member.username}</span>
                      </span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-green-400 font-bold text-sm">{stats.lives || 0}</span>
                        <span className="text-white/50 text-xs">/ {INITIAL_LIVES}</span>
                        <div className={`w-2 h-2 rounded-full ${
                          stats.lives >= 15 ? 'bg-green-500' :
                          stats.lives >= 8 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rendimiento por Jugador - Más compacto */}
            <div className="space-y-2">
              <h4 className="font-semibold text-white mb-2 text-center text-sm border-b border-white/20 pb-1">
                🎯 Rendimiento
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {sortedMembers.map((member) => {
                  const stats = userStats[member.user_id] || {};
                  return (
                    <div key={member.user_id} className="p-2 bg-white/5 rounded hover:bg-white/10 transition-colors">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-white/80 text-sm flex items-center gap-1 truncate">
                          {stats.isCurrentUser ? '⭐' : ''}
                          <span className="truncate">{member.username}</span>
                        </span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                          stats.survivalRate >= 70 ? 'bg-green-500 text-white' :
                          stats.survivalRate >= 40 ? 'bg-yellow-500 text-black' : 'bg-red-500 text-white'
                        }`}>
                          {stats.survivalRate.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2 mb-1">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            stats.survivalRate >= 70 ? 'bg-green-500' :
                            stats.survivalRate >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(stats.survivalRate, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-white/40">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente Tarjeta de Usuario Compacta
function CompactUserCard({ member, stats, isCurrentUser, INITIAL_LIVES }) {
  return (
    <div className={`bg-gradient-to-br from-blue-900/40 to-blue-700/30 border rounded-lg p-4 shadow-lg transition-all duration-200 hover:scale-[1.01] hover:shadow-blue-500/10 ${
      isCurrentUser ? 'border-yellow-400' : 'border-blue-500/30'
    }`}>
      {/* Header compacto */}
      <div className="flex justify-between items-start mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold text-white flex items-center gap-1 truncate">
            {isCurrentUser && '⭐'}
            <span className="truncate">{member.username}</span>
            {isCurrentUser && <span className="text-yellow-400 text-xs flex-shrink-0">(Tú)</span>}
          </h3>
          <p className="text-white/60 text-xs truncate">
            {stats.survivalRate >= 70 ? '🎯 Experto' : 
             stats.survivalRate >= 40 ? '⚡ Intermedio' : '🌱 Novato'}
          </p>
        </div>
        <div className="text-right flex-shrink-0 ml-2">
          <div className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            stats.survivalRate >= 70 ? 'bg-green-500 text-white' :
            stats.survivalRate >= 40 ? 'bg-yellow-500 text-black' : 'bg-red-500 text-white'
          }`}>
            {stats.survivalRate.toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Estadísticas principales compactas */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <CompactStatItem 
          label="Vidas" 
          value={stats.lives || 0} 
          max={INITIAL_LIVES}
          color="green"
          icon="❤️"
        />
        <CompactStatItem 
          label="Muertes" 
          value={stats.deaths || 0} 
          color="red"
          icon="💀"
        />
      </div>

      {/* Barra de progreso compacta */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-white/70 mb-1">
          <span>Supervivencia</span>
          <span>{stats.survivalRate.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full ${
              stats.survivalRate >= 70 ? 'bg-green-500' :
              stats.survivalRate >= 40 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(stats.survivalRate, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Información adicional compacta */}
      <div className="border-t border-white/10 pt-2">
        <div className="flex justify-between text-xs">
          <span className="text-white/70">Balance:</span>
          <span className="text-yellow-400 font-bold">₿{stats.balance || 0}</span>
        </div>
      </div>
    </div>
  );
}

// Componente Item de Estadística Compacto
function CompactStatItem({ label, value, max, color, icon }) {
  const colorClasses = {
    green: 'text-green-400',
    red: 'text-red-400',
    blue: 'text-blue-400',
    yellow: 'text-yellow-400',
    purple: 'text-purple-400'
  };

  return (
    <div className="text-center">
      <div className="text-lg mb-0.5">{icon}</div>
      <div className={`text-base font-bold ${colorClasses[color]}`}>
        {value}
        {max && <span className="text-white/50 text-xs">/{max}</span>}
      </div>
      <div className="text-white/70 text-xs">{label}</div>
    </div>
  );
}

// Componente Tarjeta de Estadística Compacta
function CompactStatCard({ title, value, icon, color }) {
  const colorClasses = {
    blue: 'from-blue-900/40 to-blue-700/30 border-blue-500/30',
    red: 'from-red-900/40 to-red-700/30 border-red-500/30',
    green: 'from-green-900/40 to-green-700/30 border-green-500/30',
    purple: 'from-purple-900/40 to-purple-700/30 border-purple-500/30'
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-lg p-3 shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-white/70 text-xs">{title}</div>
          <div className="text-lg font-bold text-white">{value}</div>
        </div>
        <div className="text-xl">{icon}</div>
      </div>
    </div>
  );
}