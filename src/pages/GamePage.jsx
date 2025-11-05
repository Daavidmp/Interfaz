import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import io from "socket.io-client";
import SideBar from "../components/SideBar";
import CardDisplay from "../components/CardDisplay"; 
import Roulette from "../components/Roulette";

// --- Constantes y Mocks ---

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

// Mock cartas (Mantenido)
const CARTAS_RETO = {
  "Pacto de Sangre": "Elige 1 Pokémon. Si muere, el siguiente que atrapes debe ser liberado.",
  "Mano del Destino": "Debes liberar al Pokémon de tu equipo con el ataque de menor Precisión.",
  "Brote de Rivalidad": "Si pierdes el próximo Gimnasio, tu equipo debe incluir un Pokémon de tipo Bicho.",
  "Bendición del Huevo": "Puedes recibir un Huevo Misterioso de otro jugador."
};

const DEFAULT_USERS = []; 
const INITIAL_LIVES = 20;

// Mock para la carta de reto (Mantenido)
const MOCK_CARD_DATA = {
    'Ninguno': { name: 'Sin Reto', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png', power: '0' },
    'Pacto de Sangre': { name: 'Pacto de Sangre', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/odd-keystone.png', power: 'ALTO' },
    'Mano del Destino': { name: 'Mano del Destino', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/fossilized-drake.png', power: 'MEDIO' },
    'Brote de Rivalidad': { name: 'Brote de Rivalidad', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/red-card.png', power: 'BAJO' },
    'Bendición del Huevo': { name: 'Bendición del Huevo', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/egg.png', power: 'SUERTE' },
    'Nada': { name: 'Nada', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/great-ball.png', power: '0' },
};

// Mock para el historial de retos (Mantenido)
const RETO_HISTORY_MOCK = [
    { type: 'Sin objetos', target: 'David', time: 'hace 5 min' },
    { type: '+5000₽', target: 'Marta', time: 'hace 12 min' },
    { type: 'Nerfeada', target: 'Juan', time: 'hace 30 min' },
    { type: 'Pacto de Sangre', target: 'David', time: 'hace 1 hr' },
];

// --- Resto de la lógica (Estados, Efectos, Handlers) sin cambios ---

export default function GamePage() {
  const navigate = useNavigate();
  const { activeSection, showCardPrices } = useOutletContext(); 

  const storedUser = JSON.parse(localStorage.getItem('ra_user') || 'null');
  const storedGroup = JSON.parse(localStorage.getItem('ra_group') || 'null');

  // --- Estados ---
  const [users, setUsers] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ra_users')) || DEFAULT_USERS; } catch { return DEFAULT_USERS; }
  });
  const [estadoJuego, setEstadoJuego] = useState(() => {
    try { 
      const stored = JSON.parse(localStorage.getItem('ra_estado'));
      return stored || { 
        cartaActiva: { tipo: 'Ninguno', origen: 'Nadie', destino: 'Nadie', descripcion: 'No hay retos asignados.' }, 
        muertes: {},
        currentGym: 1 
      }; 
    } catch { 
      return { 
        cartaActiva: { tipo: 'Ninguno', origen: 'Nadie', destino: 'Nadie', descripcion: 'No hay retos asignados.' }, 
        muertes: {},
        currentGym: 1
      }; 
    }
  });
  
  const [socket, setSocket] = useState(null);
  
  // --- Efectos y Persistencia (Mantenido) ---
  useEffect(() => {
    setEstadoJuego(prev => {
        let newMuertes = { ...prev.muertes };
        let changed = false;
        users.forEach(user => {
            if (newMuertes[user.id] === undefined) {
                newMuertes[user.id] = 0;
                changed = true;
            }
        });
        return changed ? { ...prev, muertes: newMuertes } : prev;
    });

    const s = io(SOCKET_URL, { autoConnect: true });
    setSocket(s);
    s.on('connect', ()=> console.log('socket connected', s.id));
    s.on('state:update', (st) => { setEstadoJuego(prev => ({ ...prev, ...st })); localStorage.setItem('ra_estado', JSON.stringify({ ...estadoJuego, ...st })); });
    return ()=> s.disconnect();
    // eslint-disable-next-line
  }, [users]);

  useEffect(()=> localStorage.setItem('ra_users', JSON.stringify(users)), [users]);
  useEffect(()=> localStorage.setItem('ra_estado', JSON.stringify(estadoJuego)), [estadoJuego]);

  // --- Handlers (Mantenido) ---
  function addDeath(jugadorId) {
    setEstadoJuego(prev => {
      const muertes = { ...prev.muertes, [jugadorId]: (prev.muertes[jugadorId] || 0) + 1 };
      const newSt = { ...prev, muertes };

      if (socket) socket.emit('state:set', { muertes });
      
      return newSt;
    });
  }

  function handleRouletteResult(resultCard) {
    const origen = storedUser?.id || storedUser?.username || 'Sistema';
    
    const activeUsers = users.filter(u => INITIAL_LIVES - (estadoJuego.muertes[u.id] ?? 0) > 0);
    if (activeUsers.length === 0) return alert('No hay jugadores activos para asignar retos.');
    
    const destinoUser = activeUsers[Math.floor(Math.random() * activeUsers.length)]; 
    const destino = destinoUser?.name || 'Nadie'; 

    const newCard = { tipo: resultCard.name, origen, destino: destino, descripcion: resultCard.desc };
    setEstadoJuego(prev => ({ ...prev, cartaActiva: newCard }));
    if (socket) socket.emit('state:set', { cartaActiva: newCard });
    alert(`Ruleta: ${resultCard.name} asignada a ${destino}`);
  }
  
  function handleGymChange(e) {
      const gym = parseInt(e.target.value);
      if (isNaN(gym) || gym < 1 || gym > 8) return; 
      setEstadoJuego(prev => {
          const newSt = { ...prev, currentGym: gym };
          if (socket) socket.emit('state:set', { currentGym: gym });
          return newSt;
      });
  }

  // --- Cálculos (Mantenido) ---
  const totalDeaths = Object.values(estadoJuego.muertes).reduce((sum, count) => sum + count, 0);
  const totalBalance = users.reduce((sum, u) => sum + (u.balance || 0), 0);
  const avgBalance = (users.length > 0 ? (totalBalance / users.length) : 0).toFixed(0);

  const activeCardData = MOCK_CARD_DATA[estadoJuego.cartaActiva.tipo] || MOCK_CARD_DATA['Ninguno'];

  // --- Renderizado ---
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold border-b border-white/10 pb-4 mb-4">Dashboard del Grupo: {storedGroup?.name}</h2>
      
      <div className="grid grid-cols-3 gap-6">
        
        {/* COLUMNA 1: Reto Activo, Jugadores, Muertes y NUEVA ZONA */}
        <div className="col-span-1 space-y-6">
          
          {/* Reto Activo (Texto) */}
          <div className="bg-white/10 p-5 rounded-xl shadow-lg transition duration-500 hover:bg-white/15">
            <h3 className="text-xl font-bold mb-3 text-pink-300">RETO ACTIVO (Texto)</h3>
            <div className="bg-white/6 p-4 rounded-lg shadow-inner">
              <div className="font-semibold text-pink-300">{estadoJuego.cartaActiva.tipo}</div>
              <div className="text-white/80 mt-2 text-sm">{estadoJuego.cartaActiva.descripcion}</div>
              <div className="mt-3 text-xs text-white/70">Asignado por <strong>{estadoJuego.cartaActiva.origen}</strong> a <strong>{estadoJuego.cartaActiva.destino}</strong></div>
            </div>
          </div>
          
          {/* Jugadores (SideBar) */}
          <div className="bg-white/10 p-5 rounded-xl shadow-lg">
            <SideBar 
                users={users} 
                muertes={estadoJuego.muertes} 
                initialLives={INITIAL_LIVES}
            />
          </div>
          
          {/* Muertes por Jugador */}
          <div className="bg-white/10 p-5 rounded-xl shadow-lg">
                <h4 className="font-bold mb-3 text-fuchsia-300 border-b border-fuchsia-300/50 pb-2">MUERTES POR JUGADOR</h4>
                <div className="space-y-2">
                    {users.map(u => (
                        <div key={u.id} className="flex justify-between items-center text-sm p-2 rounded bg-white/5">
                            <span className="font-semibold">{u.name}</span>
                            <span className="font-extrabold text-pink-300">{estadoJuego.muertes[u.id] ?? 0} muertes</span>
                        </div>
                    ))}
                </div>
          </div>

          {/* 🔑 NUEVOS BLOQUES EN LA IZQUIERDA */}
          <div className="space-y-6">
                
              {/* Carta Activa (Visual) - Ocupa todo el ancho de la columna izquierda */}
              <div className="bg-white/10 p-5 rounded-xl shadow-lg flex flex-col items-center w-full">
                  <h4 className="font-bold mb-4 text-yellow-300 border-b border-yellow-300/50 pb-2 w-full text-center text-xl">VISUALIZACIÓN DE LA CARTA ACTIVA</h4>
                  <div className="flex flex-col md:flex-row items-center gap-4 w-full justify-center">
                    {/* Hacemos la carta más pequeña para que quepa bien en la columna 1 */}
                    <div className="w-full sm:w-1/2 flex justify-center"> 
                        <CardDisplay card={activeCardData} isActive={estadoJuego.cartaActiva.tipo !== 'Ninguno'} />
                    </div>
                    <div className="w-full sm:w-1/2 p-2">
                        <p className="mt-3 text-white/90 text-lg font-bold border-b border-pink-400/50 pb-1">
                            {estadoJuego.cartaActiva.tipo}
                        </p>
                        <p className="mt-2 text-white/70 text-sm italic">
                            {estadoJuego.cartaActiva.descripcion.substring(0, 70)}...
                        </p>
                         <p className="mt-2 text-pink-300 text-xs">
                            Asignada a: **{estadoJuego.cartaActiva.destino}**
                        </p>
                    </div>
                  </div>
              </div>

              {/* Historial de Retos Recientes - Ocupa todo el ancho de la columna izquierda */}
              <div className="bg-white/10 p-5 rounded-xl shadow-lg w-full">
                  <h4 className="font-bold mb-3 text-cyan-300 border-b border-cyan-300/50 pb-2 text-xl">HISTORIAL DE RETOS RECIENTES</h4>
                  <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar">
                      {RETO_HISTORY_MOCK.map((reto, index) => (
                          <div key={index} className="flex justify-between items-center text-sm p-3 rounded-lg bg-white/5 border-l-4 border-cyan-500 hover:bg-white/10 transition duration-300">
                              <span className="font-semibold text-white">{reto.type}</span>
                              <span className="text-white/70">a **{reto.target}**</span>
                              <span className="text-xs text-white/50">{reto.time}</span>
                          </div>
                      ))}
                      {RETO_HISTORY_MOCK.length === 0 && <p className="text-white/70 text-center py-4">Aún no se han asignado retos.</p>}
                  </div>
              </div>

          </div>
          {/* 🔑 FIN BLOQUES IZQUIERDA */}

        </div>

        {/* COLUMNA 2/3: Ruleta, Resumen del Locke y Marcador (RESTO DEL ESPACIO) */}
        <div className="col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-6">
              {/* Ruleta (Col 1) */}
              <div className="col-span-1 bg-white/10 p-5 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold mb-4 text-purple-300">🎡 RUEDA DE LA FORTUNA</h3>
                <Roulette onResult={handleRouletteResult} />
              </div>
              
              {/* Resumen del Locke (Col 2) */}
              <div className="col-span-1 bg-white/10 p-5 rounded-xl shadow-lg">
                <h4 className="font-bold mb-4 text-green-300 border-b border-green-300/50 pb-2">RESUMEN DEL LOCKE</h4>
                <div className="space-y-3">
                    <StatCard title="Jugadores Activos" value={users.length} icon="👥" color="text-teal-400" />
                    <StatCard title="Muertes Totales" value={totalDeaths} icon="⚰️" color="text-red-400" />
                    
                    {/* Input para el gimnasio */}
                    <div className="p-3 bg-white/5 rounded-lg border-l-4 border-yellow-500">
                        <label htmlFor="gym-input" className="block text-sm font-medium text-white/70 mb-1">
                            Pokémon Gimnasio Actual
                        </label>
                        <input 
                            id="gym-input"
                            type="number" 
                            min="1" 
                            max="8" 
                            value={estadoJuego.currentGym || 1}
                            onChange={handleGymChange}
                            className="w-full p-2 rounded-md bg-white/10 text-xl font-bold text-yellow-400 text-center focus:ring-2 focus:ring-yellow-400 transition duration-300"
                        />
                    </div>

                    <StatCard title="Balance Promedio" value={`₿${avgBalance}`} icon="💰" color="text-yellow-400" />
                    <StatCard title="Precios de Cartas" value={showCardPrices ? 'Visible' : 'Oculto'} icon="🏷️" color="text-fuchsia-400" />
                </div>
              </div>
          </div>

          {/* Marcador de Muertes y Vidas - Ocupa todo el ancho de la columna derecha */}
          <div className="bg-white/10 p-5 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold mb-4">Marcador de Muertes y Vidas</h3>
            <div className="grid grid-cols-4 gap-4">
              {users.map(u => {
                  const remainingLives = INITIAL_LIVES - (estadoJuego.muertes[u.id] ?? 0);
                  const isGameOver = remainingLives <= 0;

                  return (
                    <div key={u.id} className={`bg-white/6 p-4 rounded-xl shadow-md text-center transform transition duration-300 hover:scale-[1.03] ${isGameOver ? 'opacity-50 ring-2 ring-red-500' : 'hover:bg-white/10'}`}>
                      <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${(users.indexOf(u)%151)+1}.png`} alt="" className="mx-auto w-16 h-16 transition duration-500 hover:rotate-6"/>
                      <div className="font-semibold mt-2">{u.name}</div>
                      
                      <div className="text-pink-300 font-extrabold text-2xl mt-1">
                          {isGameOver ? '☠️' : `❤️ ${remainingLives}`}
                      </div>
                      <div className="text-sm text-white/70">
                          ({estadoJuego.muertes[u.id] ?? 0} caídos)
                      </div>
                      
                      <button 
                          onClick={()=>addDeath(u.id)} 
                          disabled={isGameOver} 
                          className="mt-3 px-4 py-2 rounded-full bg-pink-600/80 hover:bg-pink-600 font-semibold text-sm transform transition duration-300 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          +1 Caído
                      </button>
                    </div>
                  );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente Auxiliar: StatCard (Mantenido)
function StatCard({ title, value, icon, color = 'text-white' }) {
    return (
        <div className="p-3 bg-white/5 rounded-lg flex items-center justify-between border-l-4 border-pink-500">
            <div className="text-sm font-medium text-white/70">{title}</div>
            <div className={`font-extrabold text-xl ${color}`}>
                {icon} {value}
            </div>
        </div>
    );
}
