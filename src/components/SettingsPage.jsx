import React from "react";

// Colores base para los temas (Tailwind classes)
const THEMES = {
  // Tema 1: Púrpura/Fucsia (Añil)
  "añil": { 
    name: "🔮 Añil (Por defecto)", 
    primary: "from-purple-950 to-fuchsia-950", 
    cardBg: "bg-white/5" 
  },
  // Tema 2: Verde/Teal (Esmeralda)
  "esmeralda": { 
    name: "🌿 Esmeralda", 
    primary: "from-green-950 to-teal-950", 
    cardBg: "bg-white/5" 
  },
  // Tema 3: Rojo/Naranja (Fuego)
  "fuego": { 
    name: "🔥 Fuego", 
    primary: "from-red-950 to-orange-950", 
    cardBg: "bg-white/5" 
  },
  // ⚡ NUEVO TEMA 4: Marino (Azul/Cian)
  "marino": { 
    name: "🌊 Marino", 
    primary: "from-blue-950 to-cyan-950", 
    cardBg: "bg-white/5" 
  },
  // ⚡ NUEVO TEMA 5: Solar (Amarillo/Ámbar)
  "solar": { 
    name: "☀️ Solar", 
    primary: "from-yellow-950 to-amber-950", 
    cardBg: "bg-white/5" 
  },
  // ⚡ NUEVO TEMA 6: Tierra (Gris oscuro/Lima)
  "tierra": { 
    name: "⛰️ Tierra", 
    primary: "from-stone-950 to-lime-950", 
    cardBg: "bg-white/5" 
  },
};

export default function SettingsPage({ 
    currentTheme, 
    onThemeChange, 
    onLockeUrlChange, 
    lockeUrl,
    showCardPrices, 
    onToggleCardPrices 
}) {
    
    // --- Contenido de la Página de Configuración ---
    return (
        <div className="space-y-8 p-4">
            <h2 className="text-3xl font-bold text-pink-300">⚙️ Configuración del Reto</h2>

            {/* Apartado 1: Tema Visual */}
            <div className="p-6 rounded-xl shadow-2xl bg-white/10 card-glass-dark">
                <h3 className="text-2xl font-semibold mb-4 border-b border-pink-400/50 pb-2">🎨 Tema Visual</h3>
                <p className="text-white/70 mb-4">Cambia la combinación de colores principal de la interfaz.</p>
                <div className="flex flex-wrap gap-4">
                    {Object.entries(THEMES).map(([id, theme]) => (
                        <button 
                            key={id}
                            onClick={() => onThemeChange(id)}
                            // Aplica la clase de color para que el botón muestre el color del tema
                            className={`px-4 py-2 rounded-full font-bold transition duration-300 transform hover:scale-[1.05] shadow-lg
                                ${currentTheme === id 
                                    ? 'border-2 border-pink-400 ring-4 ring-pink-400/50' 
                                    : 'border border-white/20 hover:bg-white/10'
                                }
                                ${theme.primary.replace('from-','bg-gradient-to-r from-').replace('to-',' to-')}`}
                        >
                            {theme.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Apartado 2: Integración de Datos (Pokémon Añil) */}
            <div className="p-6 rounded-xl shadow-2xl bg-white/10 card-glass-dark">
                <h3 className="text-2xl font-semibold mb-4 border-b border-pink-400/50 pb-2">🔗 Datos de 'Pokémon Añil'</h3>
                <p className="text-white/70 mb-4">
                    Usa este campo para enlazar tu documento o hoja de cálculo de seguimiento del Locke (Pokémon Añil).
                </p>
                <div className="space-y-3">
                    <label htmlFor="locke-url" className="block text-sm font-medium text-pink-300">URL de Hoja de Seguimiento (Drive, etc.)</label>
                    <input
                        id="locke-url"
                        type="url"
                        placeholder="Ej: https://docs.google.com/spreadsheets/d/..."
                        value={lockeUrl}
                        onChange={(e) => onLockeUrlChange(e.target.value)}
                        className="w-full p-3 rounded-md bg-white/10 text-white placeholder-white/50 focus:ring-2 focus:ring-pink-400 transition duration-300 border border-transparent focus:border-pink-400"
                    />
                    {lockeUrl && (
                        <a href={lockeUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block px-4 py-2 text-sm rounded-full bg-pink-600 hover:bg-pink-700 transition duration-300 font-semibold">
                            Abrir Hoja de Seguimiento
                        </a>
                    )}
                </div>
            </div>

            {/* Apartado 3: Extras de Configuración */}
            <div className="p-6 rounded-xl shadow-2xl bg-white/10 card-glass-dark">
                <h3 className="text-2xl font-semibold mb-4 border-b border-pink-400/50 pb-2">✨ Extras del Reto</h3>
                
                {/* Extra 1: Visibilidad de Precios de Cartas */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 mb-3">
                    <p>Mostrar Precios de Cartas:</p>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={showCardPrices} 
                            onChange={onToggleCardPrices}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 dark:peer-focus:ring-pink-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-pink-600"></div>
                        <span className="ms-3 text-sm font-medium text-white/90">{showCardPrices ? 'Visible' : 'Oculto'}</span>
                    </label>
                </div>

                {/* Extra 2: Modo Estricto de Locke */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <p>Modo Estricto de Locke (Permadeath):</p>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" value="" className="sr-only peer" defaultChecked/>
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 dark:peer-focus:ring-pink-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-pink-600"></div>
                        <span className="ms-3 text-sm font-medium text-white/90">Activado</span>
                    </label>
                </div>

            </div>
        </div>
    );
}

export { THEMES }