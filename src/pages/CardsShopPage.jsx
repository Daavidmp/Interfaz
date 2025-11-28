import React, { useState, useContext } from 'react';
import { UserGroupContext } from '../contexts/UserGroupContext';

export default function CardsShopPage() {
  const { user, group, groupMembers } = useContext(UserGroupContext);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Cartas TeamLocke de ejemplo (usando imágenes de repositorio público)
  const teamLockeCards = [
    {
      id: 1,
      name: "Cartas Básicas",
      image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png",
      price: 1000,
      power: "Bajo",
      category: "basic",
      description: "Cartas básicas para empezar tu aventura",
      effect: "Efecto básico de apoyo"
    },
    {
      id: 2,
      name: "Potenciador de Ataque",
      image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/dire-hit.png",
      price: 2500,
      power: "Medio",
      category: "boost",
      description: "Aumenta el poder de ataque de tu Pokémon",
      effect: "+20% de daño en el próximo combate"
    },
    {
      id: 3,
      name: "Curación Rápida",
      image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/potion.png",
      price: 1500,
      power: "Medio",
      category: "heal",
      description: "Cura parcialmente a tu Pokémon",
      effect: "Recupera 30% de PS"
    },
    {
      id: 4,
      name: "Cambio Forzado",
      image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/escape-rope.png",
      price: 3000,
      power: "Alto",
      category: "strategy",
      description: "Fuerza al rival a cambiar de Pokémon",
      effect: "Cambio inmediato del Pokémon rival"
    },
    {
      id: 5,
      name: "Doble Experiencia",
      image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/lucky-egg.png",
      price: 4000,
      power: "Alto",
      category: "exp",
      description: "Duplica la experiencia ganada",
      effect: "2x EXP por 30 minutos"
    },
    {
      id: 6,
      name: "Red de Captura",
      image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/repeat-ball.png",
      price: 3500,
      power: "Medio",
      category: "capture",
      description: "Aumenta probabilidad de captura",
      effect: "+25% tasa de captura"
    },
    {
      id: 7,
      name: "Protección Total",
      image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/focus-band.png",
      price: 5000,
      power: "Muy Alto",
      category: "defense",
      description: "Protege de un golpe fatal",
      effect: "Supervivencia con 1 PS una vez"
    },
    {
      id: 8,
      name: "Ataque Crítico",
      image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/scope-lens.png",
      price: 4500,
      power: "Alto",
      category: "attack",
      description: "Aumenta probabilidad de golpe crítico",
      effect: "+50% crítico por 3 turnos"
    },
    {
      id: 9,
      name: "Velocidad Extra",
      image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/quick-powder.png",
      price: 2800,
      power: "Medio",
      category: "speed",
      description: "Aumenta la velocidad de tu Pokémon",
      effect: "Primer ataque garantizado"
    },
    {
      id: 10,
      name: "Carta Legendaria",
      image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png",
      price: 10000,
      power: "Legendario",
      category: "legendary",
      description: "Carta de poder extraordinario",
      effect: "Efecto único por partida"
    }
  ];

  const categories = [
    { id: 'all', name: '🃏 Todas las Cartas', count: teamLockeCards.length },
    { id: 'basic', name: '⚪ Básicas', count: teamLockeCards.filter(card => card.category === 'basic').length },
    { id: 'boost', name: '📈 Potenciadores', count: teamLockeCards.filter(card => card.category === 'boost').length },
    { id: 'heal', name: '💊 Curas', count: teamLockeCards.filter(card => card.category === 'heal').length },
    { id: 'strategy', name: '🎯 Estrategia', count: teamLockeCards.filter(card => card.category === 'strategy').length },
    { id: 'attack', name: '⚔️ Ataque', count: teamLockeCards.filter(card => card.category === 'attack').length },
    { id: 'defense', name: '🛡️ Defensa', count: teamLockeCards.filter(card => card.category === 'defense').length },
    { id: 'legendary', name: '✨ Legendarias', count: teamLockeCards.filter(card => card.category === 'legendary').length }
  ];

  // Filtrar cartas
  const filteredCards = teamLockeCards.filter(card => {
    const matchesCategory = selectedCategory === 'all' || card.category === selectedCategory;
    const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         card.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleBuyCard = (card) => {
    // Aquí iría la lógica de compra
    alert(`🛒 Has comprado: ${card.name}\n💵 Precio: ₿${card.price}\n\nLa funcionalidad de compra se implementará próximamente.`);
  };

  const getPowerColor = (power) => {
    switch (power) {
      case 'Bajo': return 'text-green-400';
      case 'Medio': return 'text-yellow-400';
      case 'Alto': return 'text-orange-400';
      case 'Muy Alto': return 'text-red-400';
      case 'Legendario': return 'text-purple-400';
      default: return 'text-white';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'basic': return 'bg-gray-500';
      case 'boost': return 'bg-blue-500';
      case 'heal': return 'bg-green-500';
      case 'strategy': return 'bg-purple-500';
      case 'attack': return 'bg-red-500';
      case 'defense': return 'bg-yellow-500';
      case 'exp': return 'bg-cyan-500';
      case 'capture': return 'bg-indigo-500';
      case 'speed': return 'bg-pink-500';
      case 'legendary': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      default: return 'bg-gray-400';
    }
  };

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
      <h2 className="text-3xl font-bold mb-6 text-yellow-400 border-b border-yellow-400/50 pb-4">
        🛒 Tienda de Cartas TeamLocke
      </h2>

      {/* Información del usuario */}
      <div className="bg-gradient-to-r from-yellow-900/30 to-amber-900/30 p-6 rounded-xl border border-yellow-500/50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-xl font-bold text-yellow-300">Tu Balance</h3>
            <p className="text-white/70">Gasta sabiamente en cartas que te ayuden en tu aventura Locke</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-yellow-400">₿{user?.balance || 0}</div>
            <div className="text-white/60 text-sm">Disponible para comprar</div>
          </div>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white/10 p-6 rounded-xl shadow-lg">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Barra de búsqueda */}
          <div className="flex-grow">
            <input
              type="text"
              placeholder="🔍 Buscar cartas por nombre o efecto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          
          {/* Filtro de categorías */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white/10 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name} ({category.count})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 p-4 rounded-lg text-center">
          <div className="text-2xl">🃏</div>
          <div className="text-white font-bold">{teamLockeCards.length}</div>
          <div className="text-white/60 text-sm">Cartas Totales</div>
        </div>
        <div className="bg-white/5 p-4 rounded-lg text-center">
          <div className="text-2xl">💰</div>
          <div className="text-white font-bold">₿{teamLockeCards.reduce((sum, card) => sum + card.price, 0)}</div>
          <div className="text-white/60 text-sm">Valor Total</div>
        </div>
        <div className="bg-white/5 p-4 rounded-lg text-center">
          <div className="text-2xl">⚡</div>
          <div className="text-white font-bold">{filteredCards.length}</div>
          <div className="text-white/60 text-sm">Filtradas</div>
        </div>
        <div className="bg-white/5 p-4 rounded-lg text-center">
          <div className="text-2xl">🎯</div>
          <div className="text-white font-bold">{categories.length}</div>
          <div className="text-white/60 text-sm">Categorías</div>
        </div>
      </div>

      {/* Grid de Cartas */}
      {filteredCards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCards.map((card) => (
            <div
              key={card.id}
              className="bg-gradient-to-br from-gray-900/40 to-gray-700/30 border border-gray-500/30 rounded-xl p-4 shadow-lg hover:shadow-yellow-500/20 transition-all duration-300 hover:scale-[1.02] group"
            >
              {/* Encabezado de la carta */}
              <div className="flex justify-between items-start mb-3">
                <span className={`px-2 py-1 rounded-full text-xs font-bold text-white ${getCategoryColor(card.category)}`}>
                  {card.category.toUpperCase()}
                </span>
                <span className={`text-xs font-bold ${getPowerColor(card.power)}`}>
                  {card.power}
                </span>
              </div>

              {/* Imagen de la carta */}
              <div className="flex justify-center mb-4">
                <img
                  src={card.image}
                  alt={card.name}
                  className="w-20 h-20 object-contain bg-white/10 rounded-lg p-2 group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/80x80/374151/9CA3AF?text=🎴';
                  }}
                />
              </div>

              {/* Información de la carta */}
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-white mb-2">{card.name}</h3>
                <p className="text-white/70 text-sm mb-3">{card.description}</p>
                <div className="bg-white/5 rounded-lg p-2">
                  <p className="text-yellow-300 text-xs font-semibold">🎯 {card.effect}</p>
                </div>
              </div>

              {/* Precio y botón de compra */}
              <div className="border-t border-white/10 pt-3">
                <div className="flex justify-between items-center">
                  <div className="text-2xl font-bold text-yellow-400">₿{card.price}</div>
                  <button
                    onClick={() => handleBuyCard(card)}
                    disabled={(user?.balance || 0) < card.price}
                    className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center gap-2"
                  >
                    🛒 Comprar
                  </button>
                </div>
                {(user?.balance || 0) < card.price && (
                  <p className="text-red-400 text-xs mt-2 text-center">
                    Fondos insuficientes
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="text-2xl font-bold text-white/70 mb-2">No se encontraron cartas</h3>
          <p className="text-white/50">Intenta con otros términos de búsqueda o cambia la categoría.</p>
        </div>
      )}

      {/* Información adicional */}
      <div className="bg-blue-900/30 p-6 rounded-xl border border-blue-500/50">
        <h3 className="text-xl font-bold text-blue-300 mb-3">💡 Sobre las Cartas TeamLocke</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white/70">
          <div>
            <p className="mb-2">Las cartas TeamLocke son objetos especiales que puedes usar durante tu aventura para obtener ventajas estratégicas.</p>
            <p>Cada carta tiene un efecto único que puede cambiar el curso de un combate o facilitar tu progreso.</p>
          </div>
          <div>
            <p className="mb-2"><strong>Colores de poder:</strong></p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="text-green-400">🟢 Bajo</span>
              <span className="text-yellow-400">🟡 Medio</span>
              <span className="text-orange-400">🟠 Alto</span>
              <span className="text-red-400">🔴 Muy Alto</span>
              <span className="text-purple-400">🟣 Legendario</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}