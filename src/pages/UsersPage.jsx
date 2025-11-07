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
    <div className="space-y-6 p-6">
      <h2 className="text-3xl font-bold mb-6 text-blue-400 border-b border-blue-400/50 pb-4">
        👥 Gestión de Jugadores - {group.name}
      </h2>

      {/* Estadísticas Generales del Grupo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Jugadores" 
          value={groupStats.totalMembers} 
          icon="👥"
          color="blue"
        />
        <StatCard 
          title="Muertes Totales" 
          value={groupStats.totalDeaths} 
          icon="💀"
          color="red"
        />
        <StatCard 
          title="Vidas Totales" 
          value={groupStats.totalLives} 
          icon="❤️"
          color="green"
        />
        <StatCard 
          title="Supervivencia" 
          value={`${groupStats.avgSurvivalRate}%`} 
          icon="📊"
          color="purple"
        />
      </div>

      {/* Controles de Ordenación */}
      <div className="bg-white/10 p-6 rounded-xl shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-xl font-bold text-blue-300">Lista de Jugadores</h3>
          <div className="flex flex-wrap gap-2">
            <span className="text-white/70 text-sm">Ordenar por:</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-white/60">Cargando estadísticas de jugadores...</p>
        </div>
      ) : sortedMembers.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedMembers.map((member) => {
            const stats = userStats[member.user_id] || {};
            
            return (
              <UserCard 
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
        <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
          <div className="text-4xl mb-3">👥</div>
          <h3 className="text-2xl font-bold text-white/70 mb-2">No hay jugadores en el grupo</h3>
          <p className="text-white/50">Invita a más jugadores a unirse al grupo.</p>
        </div>
      )}

      {/* Resumen Detallado */}
      {!isLoading && sortedMembers.length > 0 && (
        <div className="bg-white/10 p-6 rounded-xl shadow-lg mt-8">
          <h3 className="text-xl font-bold mb-4 text-blue-300">Resumen del Grupo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-white mb-3">Distribución de Vidas</h4>
              {sortedMembers.map((member) => {
                const stats = userStats[member.user_id] || {};
                return (
                  <div key={member.user_id} className="flex items-center justify-between mb-2">
                    <span className="text-white/80 text-sm">
                      {stats.isCurrentUser ? '⭐ ' : ''}{member.username}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400 font-bold">{stats.lives || 0}</span>
                      <span className="text-white/50 text-xs">/ {INITIAL_LIVES}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Rendimiento por Jugador</h4>
              {sortedMembers.map((member) => {
                const stats = userStats[member.user_id] || {};
                return (
                  <div key={member.user_id} className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-white/80 text-sm">
                        {stats.isCurrentUser ? '⭐ ' : ''}{member.username}
                      </span>
                      <span className={`text-xs font-bold ${
                        stats.survivalRate >= 70 ? 'text-green-400' :
                        stats.survivalRate >= 40 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {stats.survivalRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          stats.survivalRate >= 70 ? 'bg-green-500' :
                          stats.survivalRate >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(stats.survivalRate, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente Tarjeta de Usuario
function UserCard({ member, stats, isCurrentUser, INITIAL_LIVES }) {
  return (
    <div className={`bg-gradient-to-br from-blue-900/40 to-blue-700/30 border rounded-xl p-6 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-blue-500/20 ${
      isCurrentUser ? 'border-yellow-400' : 'border-blue-500/30'
    }`}>
      {/* Header con nombre y indicador */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            {isCurrentUser && '⭐ '}
            {member.username}
            {isCurrentUser && <span className="text-yellow-400 text-sm">(Tú)</span>}
          </h3>
          <p className="text-white/60 text-sm">
            {stats.survivalRate >= 70 ? '🎯 Experto' : 
             stats.survivalRate >= 40 ? '⚡ Intermedio' : '🌱 Novato'}
          </p>
        </div>
        <div className="text-right">
          <div className={`px-2 py-1 rounded-full text-xs font-bold ${
            stats.survivalRate >= 70 ? 'bg-green-500 text-white' :
            stats.survivalRate >= 40 ? 'bg-yellow-500 text-black' : 'bg-red-500 text-white'
          }`}>
            {stats.survivalRate.toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <StatItem 
          label="Vidas" 
          value={stats.lives || 0} 
          max={INITIAL_LIVES}
          color="green"
          icon="❤️"
        />
        <StatItem 
          label="Muertes" 
          value={stats.deaths || 0} 
          color="red"
          icon="💀"
        />
      </div>

      {/* Barra de progreso de supervivencia */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-white/70 mb-1">
          <span>Tasa de Supervivencia</span>
          <span>{stats.survivalRate.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${
              stats.survivalRate >= 70 ? 'bg-green-500' :
              stats.survivalRate >= 40 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(stats.survivalRate, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="border-t border-white/10 pt-3">
        <div className="flex justify-between text-sm">
          <span className="text-white/70">Balance:</span>
          <span className="text-yellow-400 font-bold">₿{stats.balance || 0}</span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-white/70">Estado:</span>
          <span className={`font-bold ${
            stats.lives >= 15 ? 'text-green-400' :
            stats.lives >= 8 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {stats.lives >= 15 ? 'Excelente' : stats.lives >= 8 ? 'Estable' : 'Crítico'}
          </span>
        </div>
      </div>
    </div>
  );
}

// Componente Item de Estadística
function StatItem({ label, value, max, color, icon }) {
  const colorClasses = {
    green: 'text-green-400',
    red: 'text-red-400',
    blue: 'text-blue-400',
    yellow: 'text-yellow-400',
    purple: 'text-purple-400'
  };

  return (
    <div className="text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className={`text-2xl font-bold ${colorClasses[color]}`}>
        {value}
        {max && <span className="text-white/50 text-sm">/{max}</span>}
      </div>
      <div className="text-white/70 text-sm">{label}</div>
    </div>
  );
}

// Componente Tarjeta de Estadística
function StatCard({ title, value, icon, color }) {
  const colorClasses = {
    blue: 'from-blue-900/40 to-blue-700/30 border-blue-500/30',
    red: 'from-red-900/40 to-red-700/30 border-red-500/30',
    green: 'from-green-900/40 to-green-700/30 border-green-500/30',
    purple: 'from-purple-900/40 to-purple-700/30 border-purple-500/30'
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-4 shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-white/70 text-sm">{title}</div>
          <div className="text-2xl font-bold text-white">{value}</div>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
}