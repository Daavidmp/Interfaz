import React, { useState, useEffect } from 'react';

export default function PokedexPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('pokemon');
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [selectedMove, setSelectedMove] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [allData, setAllData] = useState({ pokemon: [], moves: [], items: [] });

  const typeColors = {
    normal: { bg: 'bg-gray-400', name: 'Normal' }, fire: { bg: 'bg-red-500', name: 'Fuego' },
    water: { bg: 'bg-blue-500', name: 'Agua' }, electric: { bg: 'bg-yellow-400', name: 'Eléctrico' },
    grass: { bg: 'bg-green-500', name: 'Planta' }, ice: { bg: 'bg-cyan-300', name: 'Hielo' },
    fighting: { bg: 'bg-red-700', name: 'Lucha' }, poison: { bg: 'bg-purple-500', name: 'Veneno' },
    ground: { bg: 'bg-yellow-600', name: 'Tierra' }, flying: { bg: 'bg-indigo-300', name: 'Volador' },
    psychic: { bg: 'bg-pink-500', name: 'Psíquico' }, bug: { bg: 'bg-lime-500', name: 'Bicho' },
    rock: { bg: 'bg-yellow-700', name: 'Roca' }, ghost: { bg: 'bg-purple-700', name: 'Fantasma' },
    dragon: { bg: 'bg-indigo-600', name: 'Dragón' }, dark: { bg: 'bg-gray-800', name: 'Siniestro' },
    steel: { bg: 'bg-gray-500', name: 'Acero' }, fairy: { bg: 'bg-pink-300', name: 'Hada' }
  };

  const moveTranslations = {
    'pound': 'Destructor', 'karate-chop': 'Golpe Kárate', 'double-slap': 'Doble Bofetón', 'comet-punch': 'Puño Cometa',
    'mega-punch': 'Megapuño', 'pay-day': 'Día de Pago', 'fire-punch': 'Puño Fuego', 'ice-punch': 'Puño Hielo',
    'thunder-punch': 'Puño Trueno', 'scratch': 'Arañazo', 'vice-grip': 'Agarre', 'guillotine': 'Guillotina',
    'razor-wind': 'Viento Cortante', 'swords-dance': 'Danza Espada', 'cut': 'Corte', 'gust': 'Tornado',
    'wing-attack': 'Ataque Ala', 'whirlwind': 'Remolino', 'fly': 'Vuelo', 'bind': 'Atadura', 'slam': 'Atizar',
    'vine-whip': 'Látigo Cepa', 'stomp': 'Pisotón', 'double-kick': 'Doble Patada', 'mega-kick': 'Megapatada',
    'jump-kick': 'Patada Salto', 'rolling-kick': 'Patada Giro', 'sand-attack': 'Ataque Arena', 'headbutt': 'Golpe Cabeza',
    'horn-attack': 'Ataque Cornada', 'fury-attack': 'Ataque Furia', 'horn-drill': 'Perforador', 'tackle': 'Placaje',
    'body-slam': 'Golpe Cuerpo', 'wrap': 'Constricción', 'take-down': 'Derribo', 'thrash': 'Saña', 'double-edge': 'Doble Filo',
    'tail-whip': 'Látigo', 'poison-sting': 'Picotazo Veneno', 'twineedle': 'Doble Ataque', 'pin-missile': 'Pin Misil',
    'leer': 'Malicioso', 'bite': 'Mordisco', 'growl': 'Gruñido', 'roar': 'Rugido', 'sing': 'Canto', 'supersonic': 'Supersónico',
    'sonic-boom': 'Bomba Sónica', 'disable': 'Anulación', 'acid': 'Ácido', 'ember': 'Ascuas', 'flamethrower': 'Lanzallamas',
    'mist': 'Neblina', 'water-gun': 'Pistola Agua', 'hydro-pump': 'Hidrobomba', 'surf': 'Surf', 'ice-beam': 'Rayo Hielo',
    'blizzard': 'Ventisca', 'psybeam': 'Psicorrayo', 'bubble-beam': 'Rayo Burbuja', 'aurora-beam': 'Rayo Aurora',
    'hyper-beam': 'Hiperrayo', 'peck': 'Picotazo', 'drill-peck': 'Pico Taladro', 'submission': 'Sumisión', 'low-kick': 'Patada Baja',
    'counter': 'Contraataque', 'seismic-toss': 'Sísmico', 'strength': 'Fuerza', 'absorb': 'Absorber', 'mega-drain': 'Megaagotar',
    'leech-seed': 'Drenadoras', 'growth': 'Desarrollo', 'razor-leaf': 'Hoja Afilada', 'solar-beam': 'Rayo Solar',
    'poison-powder': 'Polvo Veneno', 'stun-spore': 'Paralizador', 'sleep-powder': 'Somnífero', 'petal-dance': 'Danza Pétalo',
    'string-shot': 'Disparo Demora', 'dragon-rage': 'Furia Dragón', 'fire-spin': 'Giro Fuego', 'thunder-shock': 'Impactrueno',
    'thunderbolt': 'Rayo', 'thunder-wave': 'Onda Trueno', 'thunder': 'Trueno', 'rock-throw': 'Lanzarrocas', 'earthquake': 'Terremoto',
    'fissure': 'Fisura', 'dig': 'Excavar', 'toxic': 'Tóxico', 'confusion': 'Confusión', 'psychic': 'Psíquico', 'hypnosis': 'Hipnosis',
    'meditate': 'Meditación', 'agility': 'Agilidad', 'quick-attack': 'Ataque Rápido', 'rage': 'Furia', 'teleport': 'Teletransporte',
    'night-shade': 'Tinieblas', 'mimic': 'Mimético', 'screech': 'Chirrido', 'double-team': 'Doble Equipo', 'recover': 'Recuperación',
    'harden': 'Fortaleza', 'minimize': 'Reducción', 'smokescreen': 'Pantalla de Humo', 'confuse-ray': 'Rayo Confuso',
    'withdraw': 'Refugio', 'defense-curl': 'Rizo Defensa', 'barrier': 'Barrera', 'light-screen': 'Pantalla de Luz', 'haze': 'Niebla',
    'reflect': 'Reflejo', 'focus-energy': 'Foco Energía', 'bide': 'Venganza', 'metronome': 'Metrónomo', 'mirror-move': 'Espejo',
    'self-destruct': 'Autodestrucción', 'egg-bomb': 'Bomba Huevo', 'lick': 'Lengüetazo', 'smog': 'Polución', 'sludge': 'Residuos',
    'bone-club': 'Hueso Palo', 'fire-blast': 'Llamarada', 'waterfall': 'Cascada', 'clamp': 'Tenaza', 'swift': 'Meteoros',
    'skull-bash': 'Cabezazo', 'spike-cannon': 'Clavo Cañón', 'constrict': 'Restricción', 'amnesia': 'Amnesia', 'kinesis': 'Kinético',
    'soft-boiled': 'Ovocura', 'high-jump-kick': 'Patada Salto Alta', 'glare': 'Deslumbrar', 'dream-eater': 'Comesueños',
    'poison-gas': 'Gas Venenoso', 'barrage': 'Bombardeo', 'leech-life': 'Chupavidas', 'lovely-kiss': 'Beso Amoroso',
    'sky-attack': 'Ataque Aéreo', 'transform': 'Transformación', 'bubble': 'Burbuja', 'dizzy-punch': 'Puño Mareo', 'spore': 'Espora',
    'flash': 'Destello', 'psywave': 'Psicoonda', 'splash': 'Salpicadura', 'acid-armor': 'Armadura Ácida', 'crabhammer': 'Martillazo',
    'explosion': 'Explosión', 'fury-swipes': 'Golpes Furia', 'bonemerang': 'Huesomerang', 'rest': 'Descanso', 'rock-slide': 'Avalancha',
    'hyper-fang': 'Hipercolmillo', 'sharpen': 'Afilar', 'conversion': 'Conversión', 'tri-attack': 'Triataque', 'super-fang': 'Superdiente',
    'slash': 'Cuchillada', 'substitute': 'Sustituto', 'struggle': 'Forcejeo', 'sketch': 'Esquema', 'triple-kick': 'Triple Patada',
    'thief': 'Ladrón', 'spider-web': 'Telaraña', 'mind-reader': 'Telépata', 'nightmare': 'Pesadilla', 'flame-wheel': 'Rueda Fuego',
    'snore': 'Ronquido', 'curse': 'Maldición', 'flail': 'Azote', 'conversion-2': 'Conversión2', 'aeroblast': 'Aerochorro',
    'cotton-spore': 'Esporagodón', 'reversal': 'Inversión', 'spite': 'Rencor', 'powder-snow': 'Nieve Polvo', 'protect': 'Protección',
    'mach-punch': 'Ultrapuño', 'scary-face': 'Cara Sustro', 'feint-attack': 'Finta', 'sweet-kiss': 'Beso Dulce', 'belly-drum': 'Barriga Tambor',
    'sludge-bomb': 'Bomba Lodo', 'mud-slap': 'Bofetón Lodo', 'octazooka': 'Pulpocañón', 'spikes': 'Púas', 'zap-cannon': 'Electrocañón',
    'foresight': 'Profecía', 'destiny-bond': 'Mismo Destino', 'perish-song': 'Canto Mortal', 'icy-wind': 'Viento Hielo', 'detect': 'Detección',
    'bone-rush': 'Ataque Óseo', 'lock-on': 'Fijar Blanco', 'outrage': 'Enfado', 'sandstorm': 'Tormenta Arena', 'giga-drain': 'Gigadrenado',
    'endure': 'Aguante', 'charm': 'Encanto', 'rollout': 'Desenrollar', 'false-swipe': 'Falso Tortazo', 'swagger': 'Contoneo',
    'milk-drink': 'Batido', 'spark': 'Chispa', 'fury-cutter': 'Corte Furia', 'steel-wing': 'Ala de Acero', 'mean-look': 'Mal de Ojo',
    'attract': 'Atracción', 'sleep-talk': 'Sonámbulo', 'heal-bell': 'Cascabel Cure', 'return': 'Retribución', 'present': 'Presente',
    'frustration': 'Frustración', 'safeguard': 'Velo Sagrado', 'pain-split': 'Divide Dolor', 'sacred-fire': 'Fuego Sagrado',
    'magnitude': 'Magnitud', 'dynamic-punch': 'Puño Dinámico', 'megahorn': 'Megacuerno', 'dragon-breath': 'Dragoaliento',
    'baton-pass': 'Relevo', 'encore': 'Otra Vez', 'pursuit': 'Persecución', 'rapid-spin': 'Giro Rápido', 'sweet-scent': 'Dulce Aroma',
    'iron-tail': 'Cola Férrea', 'metal-claw': 'Garra Metal', 'vital-throw': 'Llave Vital', 'morning-sun': 'Sol Matinal', 'synthesis': 'Síntesis',
    'moonlight': 'Luz Lunar', 'hidden-power': 'Poder Oculto', 'cross-chop': 'Tajo Cruzado', 'twister': 'Ciclón', 'rain-dance': 'Danza Lluvia',
    'sunny-day': 'Día Soleado', 'crunch': 'Triturar', 'mirror-coat': 'Manto Espejo', 'psych-up': 'Más Psique', 'extreme-speed': 'Veloc. Extrema',
    'ancient-power': 'Poder Pasado', 'shadow-ball': 'Bola Sombra', 'future-sight': 'Premonición', 'rock-smash': 'Golpe Roca',
    'whirlpool': 'Torbellino', 'beat-up': 'Paliza', 'fake-out': 'Sorpresa', 'uproar': 'Alboroto', 'stockpile': 'Reserva', 'spit-up': 'Escupir',
    'swallow': 'Tragar', 'heat-wave': 'Onda Ígnea', 'hail': 'Granizo', 'torment': 'Tormento', 'flatter': 'Camelo', 'will-o-wisp': 'Fuego Fatuo',
    'memento': 'Legado', 'facade': 'Imagen', 'focus-punch': 'Puño Certero', 'smelling-salts': 'Estímulo', 'follow-me': 'Señuelo',
    'nature-power': 'Poder Natural', 'charge': 'Carga', 'taunt': 'Mofa', 'helping-hand': 'Refuerzo', 'trick': 'Truco', 'role-play': 'Imitación',
    'wish': 'Deseo', 'assist': 'Ayuda', 'ingrain': 'Arraigo', 'superpower': 'Fuerza Bruta', 'magic-coat': 'Capa Mágica', 'recycle': 'Reciclaje',
    'revenge': 'Desquite', 'brick-break': 'Demolición', 'yawn': 'Bostezo', 'knock-off': 'Desarme', 'endeavor': 'Esfuerzo', 'eruption': 'Estallido',
    'skill-swap': 'Intercambio', 'imprison': 'Cerca', 'refresh': 'Alivio', 'grudge': 'Rabia', 'snatch': 'Robo', 'secret-power': 'Poder Secreto',
    'dive': 'Buceo', 'arm-thrust': 'Empujón', 'camouflage': 'Camuflaje', 'tail-glow': 'Luz Caudal', 'luster-purge': 'Fulgor', 'mist-ball': 'Bola Neblina',
    'feather-dance': 'Danza Pluma', 'teeter-dance': 'Danza Caos', 'blaze-kick': 'Patada Ígnea', 'mud-sport': 'Chapoteo Lodo', 'ice-ball': 'Bola Hielo',
    'needle-arm': 'Brazo Pincho', 'slack-off': 'Relajo', 'hyper-voice': 'Vozarrón', 'poison-fang': 'Colmillo Veneno', 'crush-claw': 'Garra Brutal',
    'blast-burn': 'Anillo Ígneo', 'hydro-cannon': 'Hidrocañón', 'meteor-mash': 'Puño Meteoro', 'astonish': 'Impresionar', 'weather-ball': 'Meteorobola',
    'aromatherapy': 'Aromaterapia', 'fake-tears': 'Llanto Falso', 'air-cutter': 'Corte Aéreo', 'overheat': 'Sofoco', 'odor-sleuth': 'Rastreo',
    'rock-tomb': 'Tumba Rocas', 'silver-wind': 'Viento Plata', 'metal-sound': 'Eco Metálico', 'grass-whistle': 'Silbato', 'tickle': 'Cosquillas',
    'cosmic-power': 'Masa Cósmica', 'water-spout': 'Salpicar', 'signal-beam': 'Rayo Señal', 'shadow-punch': 'Puño Sombra', 'extrasensory': 'Paranormal',
    'sky-uppercut': 'Gancho Alto', 'sand-tomb': 'Bucle Arena', 'sheer-cold': 'Frío Polar', 'muddy-water': 'Agua Lodosa', 'bullet-seed': 'Semilladora',
    'aerial-ace': 'Golpe Aéreo', 'icicle-spear': 'Carámbano', 'iron-defense': 'Defensa Férrea', 'block': 'Bloqueo', 'howl': 'Aullido',
    'dragon-claw': 'Garra Dragón', 'frenzy-plant': 'Planta Feroz', 'bulk-up': 'Corpulencia', 'bounce': 'Bote', 'mud-shot': 'Disparo Lodo',
    'poison-tail': 'Cola Veneno', 'covet': 'Antojo', 'volt-tackle': 'Placaje Eléc', 'magical-leaf': 'Hoja Mágica', 'water-sport': 'Hidrochorro',
    'calm-mind': 'Paz Mental', 'leaf-blade': 'Hoja Aguda', 'dragon-dance': 'Danza Dragón', 'rock-blast': 'Pedrada', 'shock-wave': 'Onda Voltio',
    'water-pulse': 'Hidropulso', 'doom-desire': 'Deseo Oculto', 'psycho-boost': 'Psicoataque', 'astro-drain': 'Asta Drenaje',
    'drain-punch': 'Puño Drenaje', 'drain-bite': 'Mordisco Drenaje'
  };

  const itemTranslations = {
    'master-ball': 'Master Ball', 'ultra-ball': 'Ultra Ball', 'great-ball': 'Super Ball', 'poke-ball': 'Poké Ball',
    'safari-ball': 'Safari Ball', 'net-ball': 'Malla Ball', 'dive-ball': 'Buceo Ball', 'nest-ball': 'Nido Ball',
    'repeat-ball': 'Turno Ball', 'timer-ball': 'Tiempo Ball', 'luxury-ball': 'Lujo Ball', 'premier-ball': 'Honor Ball',
    'dusk-ball': 'Ocaso Ball', 'heal-ball': 'Sana Ball', 'quick-ball': 'Veloz Ball', 'cherish-ball': 'Abrazo Ball',
    'potion': 'Poción', 'super-potion': 'Superpoción', 'hyper-potion': 'Hiperpoción', 'max-potion': 'Maxipoción',
    'full-restore': 'Restaura Todo', 'revive': 'Revivir', 'max-revive': 'Maxirevivir', 'fresh-water': 'Agua Fresca',
    'soda-pop': 'Refresco', 'lemonade': 'Limonada', 'moomoo-milk': 'Leche Mu-mu', 'energy-powder': 'Polvo Energía',
    'energy-root': 'Raíz Energía', 'heal-powder': 'Polvo Curación', 'revival-herb': 'Hierba Revivir', 'ether': 'Éter',
    'max-ether': 'Éter Máximo', 'elixir': 'Elixir', 'max-elixir': 'Elixir Máximo', 'lava-cookie': 'Galleta Lavacalda',
    'berry-juice': 'Jugo de Baya', 'sacred-ash': 'Ceniza Sagrada', 'hp-up': 'PS Más', 'protein': 'Proteína', 'iron': 'Hierro',
    'carbos': 'Carburo', 'calcium': 'Calcio', 'rare-candy': 'Caramelo Raro', 'pp-up': 'PP Más', 'zinc': 'Zinc', 'pp-max': 'PP Máximos',
    'old-gateau': 'Pastel Antiguo', 'guard-spec': 'Protec. Especial', 'dire-hit': 'Directo', 'x-attack': 'Ataque X', 'x-defense': 'Defensa X',
    'x-speed': 'Velocidad X', 'x-accuracy': 'Precisión X', 'x-sp-atk': 'Ataque Especial X', 'x-sp-def': 'Defensa Especial X',
    'poke-doll': 'Muñeco Pokémon', 'fluffy-tail': 'Cola Esponja', 'blue-flute': 'Flauta Azul', 'yellow-flute': 'Flauta Amarilla',
    'red-flute': 'Flauta Roja', 'black-flute': 'Flauta Negra', 'white-flute': 'Flauta Blanca', 'shoal-salt': 'Sal Cardumen',
    'shoal-shell': 'Concha Cardumen', 'red-shard': 'Parte Roja', 'blue-shard': 'Parte Azul', 'yellow-shard': 'Parte Amarilla',
    'green-shard': 'Parte Verde', 'super-repel': 'Superrepelente', 'max-repel': 'Maxirepelente', 'escape-rope': 'Cuerda Huida',
    'repel': 'Repelente', 'sun-stone': 'Piedra Solar', 'moon-stone': 'Piedra Lunar', 'fire-stone': 'Piedra Fuego',
    'thunder-stone': 'Piedra Trueno', 'water-stone': 'Piedra Agua', 'leaf-stone': 'Piedra Hoja', 'tiny-mushroom': 'Miniseta',
    'big-mushroom': 'Seta', 'pearl': 'Perla', 'big-pearl': 'Perla Grande', 'stardust': 'Polvo Estelar', 'star-piece': 'Trozo Estrella',
    'nugget': 'Pepita', 'heart-scale': 'Escama Corazón', 'honey': 'Miel', 'growth-mulch': 'Abono Crecimiento', 'damp-mulch': 'Abono Húmedo',
    'stable-mulch': 'Abono Estable', 'gooey-mulch': 'Abono Pegajoso', 'root-fossil': 'Fósil Raíz', 'claw-fossil': 'Fósil Garra',
    'helix-fossil': 'Fósil Hélice', 'dome-fossil': 'Fósil Domo', 'old-amber': 'Ámbar Viejo', 'armor-fossil': 'Fósil Coraza',
    'skull-fossil': 'Fósil Cráneo', 'rare-bone': 'Hueso Raro', 'shiny-stone': 'Piedra Brillante', 'dusk-stone': 'Piedra Noche',
    'dawn-stone': 'Piedra Alba', 'oval-stone': 'Piedra Oval', 'odd-keystone': 'Piedra Idol', 'griseous-orb': 'Grisous Orb',
    'douse-drive': 'Programa Agua', 'shock-drive': 'Programa Voltio', 'burn-drive': 'Programa Fuego', 'chill-drive': 'Programa Hielo',
    'sweet-heart': 'Corazón Dulce', 'adamant-orb': 'Adamant Orb', 'lustrous-orb': 'Lustrous Orb', 'mail': 'Carta', 'cheri-berry': 'Baya Zreza',
    'chesto-berry': 'Baya Zidra', 'pecha-berry': 'Baya Zreza', 'rawst-berry': 'Baya Zidra', 'aspear-berry': 'Baya Zreza',
    'leppa-berry': 'Baya Zreza', 'oran-berry': 'Baya Zreza', 'persim-berry': 'Baya Zreza', 'lum-berry': 'Baya Zreza',
    'sitrus-berry': 'Baya Zreza', 'figy-berry': 'Baya Zreza', 'wiki-berry': 'Baya Zreza', 'mago-berry': 'Baya Zreza',
    'aguav-berry': 'Baya Zreza', 'iapapa-berry': 'Baya Zreza', 'razz-berry': 'Baya Zreza', 'bluk-berry': 'Baya Zreza',
    'nanab-berry': 'Baya Zreza', 'wepear-berry': 'Baya Zreza', 'pinap-berry': 'Baya Zreza', 'pomeg-berry': 'Baya Zreza',
    'kelpsy-berry': 'Baya Zreza', 'qualot-berry': 'Baya Zreza', 'hondew-berry': 'Baya Zreza', 'grepa-berry': 'Baya Zreza',
    'tamato-berry': 'Baya Zreza', 'cornn-berry': 'Baya Zreza', 'magost-berry': 'Baya Zreza', 'rabuta-berry': 'Baya Zreza',
    'nomel-berry': 'Baya Zreza', 'spelon-berry': 'Baya Zreza', 'pamtre-berry': 'Baya Zreza', 'watmel-berry': 'Baya Zreza',
    'durin-berry': 'Baya Zreza', 'belue-berry': 'Baya Zreza', 'occa-berry': 'Baya Zreza', 'passho-berry': 'Baya Zreza',
    'wacan-berry': 'Baya Zreza', 'rindo-berry': 'Baya Zreza', 'yache-berry': 'Baya Zreza', 'chople-berry': 'Baya Zreza',
    'kebia-berry': 'Baya Zreza', 'shuca-berry': 'Baya Zreza', 'coba-berry': 'Baya Zreza', 'payapa-berry': 'Baya Zreza',
    'tanga-berry': 'Baya Zreza', 'charti-berry': 'Baya Zreza', 'kasib-berry': 'Baya Zreza', 'haban-berry': 'Baya Zreza',
    'colbur-berry': 'Baya Zreza', 'babiri-berry': 'Baya Zreza', 'chilan-berry': 'Baya Zreza', 'liechi-berry': 'Baya Zreza',
    'ganlon-berry': 'Baya Zreza', 'salac-berry': 'Baya Zreza', 'petaya-berry': 'Baya Zreza', 'apicot-berry': 'Baya Zreza',
    'lansat-berry': 'Baya Zreza', 'starf-berry': 'Baya Zreza', 'enigma-berry': 'Baya Zreza', 'micle-berry': 'Baya Zreza',
    'custap-berry': 'Baya Zreza', 'jaboca-berry': 'Baya Zreza', 'rowap-berry': 'Baya Zreza', 'bright-powder': 'Polvo Brillo',
    'white-herb': 'Hierba Blanca', 'macho-brace': 'Brazal Firme', 'exp-share': 'Repartir Exp', 'quick-claw': 'Garra Rápida',
    'soothe-bell': 'Cascabel Calm', 'mental-herb': 'Hierba Mental', 'choice-band': 'Cinta Elegida', 'kings-rock': 'Roca del Rey',
    'silver-powder': 'Polvo Plata', 'amulet-coin': 'Moneda Amuleto', 'cleanse-tag': 'Tabla Pureza', 'soul-dew': 'Rocío Alma',
    'deep-sea-tooth': 'Colmillo Fondo', 'deep-sea-scale': 'Escama Fondo', 'smoke-ball': 'Bola Humo', 'everstone': 'Piedra Eterna',
    'focus-band': 'Banda Focus', 'lucky-egg': 'Huevo Suerte', 'scope-lens': 'Lente Aumento', 'metal-coat': 'Revestimiento',
    'leftovers': 'Restos', 'dragon-scale': 'Escama Dragón', 'light-ball': 'Bola Luz', 'soft-sand': 'Arena Suave', 'hard-stone': 'Piedra Dura',
    'miracle-seed': 'Semilla Milagro', 'black-glasses': 'Gafas de Sol', 'black-belt': 'Cinturón Negro', 'magnet': 'Imán',
    'mystic-water': 'Agua Mística', 'sharp-beak': 'Pico Afilado', 'poison-barb': 'Púa Venenosa', 'never-melt-ice': 'Helo Eterno',
    'spell-tag': 'Hechizo', 'twisted-spoon': 'Cuchara Torcida', 'charcoal': 'Carbón', 'dragon-fang': 'Colmillo Dragón',
    'silk-scarf': 'Pañuelo Seda', 'up-grade': 'Mejora', 'shell-bell': 'Campana Concha', 'sea-incense': 'Incienso Marino',
    'lax-incense': 'Incienso Suave', 'lucky-punch': 'Puño Suerte', 'metal-powder': 'Polvo Metal', 'thick-club': 'Hueso Grueso',
    'stick': 'Palo', 'red-scarf': 'Bufanda Roja', 'blue-scarf': 'Bufanda Azul', 'pink-scarf': 'Bufanda Rosa', 'green-scarf': 'Bufanda Verde',
    'yellow-scarf': 'Bufanda Amarilla', 'wide-lens': 'Lente Amplio', 'muscle-band': 'Banda Musculo', 'wise-glasses': 'Gafas Espec.',
    'expert-belt': 'Cint. Experto', 'light-clay': 'Arcilla Blanca', 'life-orb': 'Esfera Vida', 'power-herb': 'Hierba Poder',
    'toxic-orb': 'Esfera Tóxica', 'flame-orb': 'Esfera Llama', 'quick-powder': 'Polvo Veloz', 'focus-sash': 'Banda Focus',
    'zoom-lens': 'Teleobjetivo', 'metronome': 'Metrónomo', 'iron-ball': 'Bola Férrea', 'lagging-tail': 'Cola Lenta',
    'destiny-knot': 'Lazo Destino', 'black-sludge': 'Lodo Negro', 'icy-rock': 'Roca Helada', 'smooth-rock': 'Roca Suave',
    'heat-rock': 'Roca Calor', 'damp-rock': 'Roca Humedad', 'grip-claw': 'Garra Garfio', 'choice-scarf': 'Pañuelo Elegido',
    'sticky-barb': 'Púa Pegajosa', 'power-bracer': 'Brazal Poder', 'power-belt': 'Cinturón Poder', 'power-lens': 'Lente Poder',
    'power-band': 'Banda Poder', 'power-anklet': 'Tobillera Poder', 'power-weight': 'Peso Poder', 'shed-shell': 'Muda Concha',
    'big-root': 'Raíz Grande', 'choice-specs': 'Gafas Elegidas', 'flame-plate': 'Tabla Llama', 'splash-plate': 'Tabla Agua',
    'zap-plate': 'Tabla Voltio', 'meadow-plate': 'Tabla Prado', 'icicle-plate': 'Tabla Hielo', 'fist-plate': 'Tabla Puño',
    'toxic-plate': 'Tabla Tóxica', 'earth-plate': 'Tabla Tierra', 'sky-plate': 'Tabla Cielo', 'mind-plate': 'Tabla Mental',
    'insect-plate': 'Tabla Bicho', 'stone-plate': 'Tabla Roca', 'spooky-plate': 'Tabla Espectro', 'draco-plate': 'Tabla Dragón',
    'dread-plate': 'Tabla Siniestra', 'iron-plate': 'Tabla Acero', 'pixie-plate': 'Tabla Hada', 'fire-gem': 'Gema Fuego',
    'water-gem': 'Gema Agua', 'electric-gem': 'Gema Eléctrica', 'grass-gem': 'Gema Planta', 'ice-gem': 'Gema Hielo',
    'fighting-gem': 'Gema Lucha', 'poison-gem': 'Gema Veneno', 'ground-gem': 'Gema Tierra', 'flying-gem': 'Gema Voladora',
    'psychic-gem': 'Gema Psíquica', 'bug-gem': 'Gema Bicho', 'rock-gem': 'Gema Roca', 'ghost-gem': 'Gema Fantasma',
    'dragon-gem': 'Gema Dragón', 'dark-gem': 'Gema Siniestra', 'steel-gem': 'Gema Acero', 'fairy-gem': 'Gema Hada'
  };

  const getSpanishName = (englishName, type) => {
      if (type === 'move') return moveTranslations[englishName] || englishName;
      if (type === 'item') return itemTranslations[englishName] || englishName;
      return englishName;
    };

    const getEnglishName = (spanishName, type) => {
      if (type === 'move') {
        const entry = Object.entries(moveTranslations).find(([key, value]) => 
          normalizeText(value) === normalizeText(spanishName)
        );
        return entry ? entry[0] : spanishName;
      } else if (type === 'item') {
        const entry = Object.entries(itemTranslations).find(([key, value]) => 
          normalizeText(value) === normalizeText(spanishName)
        );
        return entry ? entry[0] : spanishName;
      }
      return spanishName;
    };

    const normalizeText = (text) => {
      return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s]/g, "")
        .trim();
    };

    useEffect(() => {
      const loadAllData = async () => {
        try {
          const loadAllPages = async (endpoint, limit = 10000) => {
            let allResults = [];
            let url = `https://pokeapi.co/api/v2/${endpoint}?limit=${limit}`;
            
            while (url) {
              const response = await fetch(url);
              const data = await response.json();
              allResults = [...allResults, ...data.results];
              url = data.next;
            }
            return allResults;
          };

          const [pokemonData, movesData, itemsData] = await Promise.all([
            loadAllPages('pokemon', 2000),
            loadAllPages('move', 1000),
            loadAllPages('item', 3000)
          ]);

          const pokemonWithSpanish = await Promise.all(
            pokemonData.map(async (pokemon, index) => {
              try {
                const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemon.name}`);
                const speciesData = await speciesResponse.json();
                const spanishName = speciesData.names.find(name => name.language.name === 'es');
                return {
                  name: spanishName?.name || pokemon.name,
                  englishName: pokemon.name,
                  id: speciesData.id,
                  type: 'pokemon'
                };
              } catch (error) {
                return {
                  name: pokemon.name,
                  englishName: pokemon.name,
                  id: pokemon.url.split('/').filter(Boolean).pop(),
                  type: 'pokemon'
                };
              }
            })
          );

          const movesWithSpanish = movesData.map((move) => ({
            name: getSpanishName(move.name, 'move'),
            englishName: move.name,
            id: move.url.split('/').filter(Boolean).pop(),
            type: 'move'
          }));

          const itemsWithSpanish = itemsData.map((item) => ({
            name: getSpanishName(item.name, 'item'),
            englishName: item.name,
            id: item.url.split('/').filter(Boolean).pop(),
            type: 'item'
          }));

          setAllData({
            pokemon: pokemonWithSpanish.filter(p => p.name),
            moves: movesWithSpanish.filter(m => m.name),
            items: itemsWithSpanish.filter(i => i.name)
          });

        } catch (error) {
          console.error('❌ Error loading data:', error);
        }
      };

      loadAllData();
    }, []);

    const updateSuggestions = (input, type) => {
      if (input.length < 1) {
        setSuggestions([]);
        return;
      }

      const dataToSearch = allData[type] || [];
      const inputNormalized = normalizeText(input);

      const filtered = dataToSearch.filter(item => {
        const nameNormalized = normalizeText(item.name);
        const englishNormalized = normalizeText(item.englishName);
        
        return nameNormalized.includes(inputNormalized) || englishNormalized.includes(inputNormalized);
      })
      .sort((a, b) => {
        const aNameNormalized = normalizeText(a.name);
        const bNameNormalized = normalizeText(b.name);
        const aEnglishNormalized = normalizeText(a.englishName);
        const bEnglishNormalized = normalizeText(b.englishName);

        const aStarts = aNameNormalized.startsWith(inputNormalized) || aEnglishNormalized.startsWith(inputNormalized);
        const bStarts = bNameNormalized.startsWith(inputNormalized) || bEnglishNormalized.startsWith(inputNormalized);
        
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        
        const aIndex = Math.min(
          aNameNormalized.indexOf(inputNormalized),
          aEnglishNormalized.indexOf(inputNormalized)
        );
        const bIndex = Math.min(
          bNameNormalized.indexOf(inputNormalized),
          bEnglishNormalized.indexOf(inputNormalized)
        );

        if (aIndex !== bIndex) return aIndex - bIndex;
        return a.name.length - b.name.length;
      })
      .slice(0, 10);

      setSuggestions(filtered);
    };

    const statNames = {
      hp: 'PS', attack: 'Ataque', defense: 'Defensa', 'special-attack': 'Ataque Especial',
      'special-defense': 'Defensa Especial', speed: 'Velocidad'
    };

    const damageClassNames = {
      physical: 'Físico', special: 'Especial', status: 'Estado'
    };

    const searchPokeAPI = async (query, type) => {
      if (!query.trim()) return;
      
      setIsLoading(true);
      setError('');
      
      try {
        const allItems = allData[type] || [];
        const queryNormalized = normalizeText(query);
        
        let foundItem = allItems.find(item => {
          const nameNormalized = normalizeText(item.name);
          const englishNormalized = normalizeText(item.englishName);
          return nameNormalized === queryNormalized || englishNormalized === queryNormalized;
        });
        
        if (!foundItem) {
          foundItem = allItems.find(item => {
            const nameNormalized = normalizeText(item.name);
            const englishNormalized = normalizeText(item.englishName);
            return nameNormalized.includes(queryNormalized) || englishNormalized.includes(queryNormalized);
          });
        }
        
        let searchQuery;
        if (foundItem) {
          searchQuery = foundItem.englishName.toLowerCase();
        } else {
          searchQuery = getEnglishName(query, type).toLowerCase();
        }
        
        const url = `https://pokeapi.co/api/v2/${type}/${searchQuery}`;
        const response = await fetch(url);
        
        if (!response.ok) throw new Error(`${type === 'pokemon' ? 'Pokémon' : type === 'move' ? 'Movimiento' : 'Objeto'} no encontrado`);

        const data = await response.json();
        
        switch (type) {
          case 'pokemon': await handlePokemonData(data); break;
          case 'move': await handleMoveData(data); break;
          case 'item': await handleItemData(data); break;
        }
        
      } catch (error) {
        console.error('❌ Error en búsqueda:', error);
        setError(error.message);
        setSelectedPokemon(null);
        setSelectedMove(null);
        setSelectedItem(null);
      } finally {
        setIsLoading(false);
        setSuggestions([]);
      }
    };

    const handlePokemonData = async (data) => {
      try {
        const speciesResponse = await fetch(data.species.url);
        const speciesData = await speciesResponse.json();
        
        const spanishName = speciesData.names.find(name => name.language.name === 'es');
        const spanishEntry = speciesData.flavor_text_entries.find(entry => entry.language.name === 'es');

        const abilitiesWithSpanish = await Promise.all(
          data.abilities.map(async (ability) => {
            try {
              const abilityResponse = await fetch(ability.ability.url);
              const abilityData = await abilityResponse.json();
              const spanishAbilityName = abilityData.names.find(name => name.language.name === 'es');
              return {
                name: spanishAbilityName?.name || ability.ability.name,
                englishName: ability.ability.name,
                isHidden: ability.is_hidden
              };
            } catch (error) {
              return {
                name: ability.ability.name,
                englishName: ability.ability.name,
                isHidden: ability.is_hidden
              };
            }
          })
        );

        const totalStats = data.stats.reduce((sum, stat) => sum + stat.base_stat, 0);

        const pokemonInfo = {
          id: data.id,
          name: spanishName?.name || data.name,
          types: data.types.map(type => ({
            name: type.type.name,
            spanishName: typeColors[type.type.name]?.name || type.type.name
          })),
          stats: data.stats.map(stat => ({
            name: stat.stat.name,
            spanishName: statNames[stat.stat.name] || stat.stat.name,
            value: stat.base_stat
          })),
          totalStats: totalStats,
          abilities: abilitiesWithSpanish,
          height: data.height / 10,
          weight: data.weight / 10,
          sprites: {
            front: data.sprites.front_default,
            back: data.sprites.back_default,
            official: data.sprites.other['official-artwork']?.front_default,
            shiny: data.sprites.front_shiny
          },
          description: spanishEntry?.flavor_text?.replace(/\n/g, ' ') || 'Descripción no disponible',
          baseExperience: data.base_experience
        };
        
        setSelectedPokemon(pokemonInfo);
        setSelectedMove(null);
        setSelectedItem(null);
      } catch (error) {
        console.error('❌ Error procesando Pokémon:', error);
        throw error;
      }
    };

    const handleMoveData = async (data) => {
      try {
        const spanishName = getSpanishName(data.name, 'move');
        const spanishEntry = data.flavor_text_entries.find(entry => entry.language.name === 'es');

        const moveInfo = {
          name: spanishName,
          type: {
            name: data.type.name,
            spanishName: typeColors[data.type.name]?.name || data.type.name
          },
          power: data.power,
          accuracy: data.accuracy,
          pp: data.pp,
          priority: data.priority,
          damageClass: {
            name: data.damage_class.name,
            spanishName: damageClassNames[data.damage_class.name] || data.damage_class.name
          },
          description: spanishEntry?.flavor_text || 'Descripción no disponible'
        };
        
        setSelectedMove(moveInfo);
        setSelectedPokemon(null);
        setSelectedItem(null);
      } catch (error) {
        console.error('❌ Error procesando movimiento:', error);
        throw error;
      }
    };

    const handleItemData = async (data) => {
      try {
        const spanishName = getSpanishName(data.name, 'item');

        let categoryName = data.category.name;
        try {
          const categoryResponse = await fetch(data.category.url);
          const categoryData = await categoryResponse.json();
          const spanishCategory = categoryData.names.find(name => name.language.name === 'es');
          categoryName = spanishCategory?.name || categoryName;
        } catch (error) {
          console.log('ℹ️ No se pudo cargar categoría en español');
        }

        const getItemFunctionality = (itemData) => {
          const itemName = itemData.name.toLowerCase();
          const category = itemData.category.name.toLowerCase();
          
          if (itemName.includes('ball') && !itemName.includes('light-ball') && !itemName.includes('iron-ball')) {
            if (itemName.includes('master')) return 'Captura Pokémon sin fallar. La Poké Ball más poderosa.';
            if (itemName.includes('ultra')) return 'Ratio de captura x2. Muy efectiva contra Pokémon salvajes.';
            if (itemName.includes('great')) return 'Ratio de captura x1.5. Mejor que la Poké Ball estándar.';
            if (itemName.includes('net')) return 'Efectiva contra Pokémon tipo Bicho y Agua (x3 ratio).';
            if (itemName.includes('dive')) return 'Efectiva al pescar o bajo el agua (x3.5 ratio).';
            if (itemName.includes('nest')) return 'Mejor con Pokémon de bajo nivel (mejora con nivel).';
            if (itemName.includes('repeat')) return 'Efectiva con Pokémon ya capturados (x3 ratio).';
            if (itemName.includes('timer')) return 'Mejora con cada turno de batalla (máx x4 ratio).';
            if (itemName.includes('luxury')) return 'Aumenta la felicidad del Pokémon capturado.';
            if (itemName.includes('premier')) return 'Poké Ball especial de edición limitada.';
            if (itemName.includes('dusk')) return 'Mejor de noche o en cuevas (x3.5 ratio).';
            if (itemName.includes('heal')) return 'Cura al Pokémon capturado y elimina problemas de estado.';
            if (itemName.includes('quick')) return 'Muy efectiva en el primer turno (x5 ratio).';
            if (itemName.includes('cherish')) return 'Poké Ball especial de eventos.';
            if (itemName.includes('safari')) return 'Exclusiva para zonas Safari.';
            return 'Poké Ball estándar para capturar Pokémon salvajes.';
          }

          if (itemName.includes('potion') || category.includes('healing')) {
            if (itemName.includes('max')) return 'Cura todos los PS de un Pokémon. La poción más poderosa.';
            if (itemName.includes('hyper')) return 'Cura 200 PS de un Pokémon. Para Pokémon de alto nivel.';
            if (itemName.includes('super')) return 'Cura 50 PS de un Pokémon. Poción de nivel medio.';
            if (itemName.includes('full-restore')) return 'Cura todos los PS y elimina todos los problemas de estado.';
            return 'Cura 20 PS de un Pokémon. Poción básica de curación.';
          }

          if (itemName.includes('revive')) {
            if (itemName.includes('max')) return 'Revive un Pokémon debilitado con todos sus PS.';
            return 'Revive un Pokémon debilitado con la mitad de sus PS máximos.';
          }

          if (itemName.includes('berry') || category.includes('berries')) {
            if (itemName.includes('cheri')) return 'Cura la parálisis de un Pokémon.';
            if (itemName.includes('chesto')) return 'Despierta a un Pokémon dormido.';
            if (itemName.includes('pecha')) return 'Cura el envenenamiento de un Pokémon.';
            if (itemName.includes('rawst')) return 'Cura las quemaduras de un Pokémon.';
            if (itemName.includes('aspear')) return 'Cura la congelación de un Pokémon.';
            if (itemName.includes('leppa')) return 'Restaura 10 PP de un movimiento.';
            if (itemName.includes('oran')) return 'Restaura 10 PS de un Pokémon.';
            if (itemName.includes('persim')) return 'Cura la confusión de un Pokémon.';
            if (itemName.includes('lum')) return 'Cura cualquier problema de estado de un Pokémon.';
            if (itemName.includes('sitrus')) return 'Restaura 25% de los PS máximos del Pokémon.';
            if (itemName.includes('figy') || itemName.includes('wiki') || itemName.includes('mago') || 
                itemName.includes('aguav') || itemName.includes('iapapa')) {
              return 'Restaura PS pero puede causar confusión si al Pokémon no le gusta el sabor.';
            }
            if (itemName.includes('razz')) return 'Facilita la captura de Pokémon en Pokémon GO.';
            if (itemName.includes('pinap')) return 'Aumenta los caramelos obtenidos en Pokémon GO.';
            if (itemName.includes('nanab')) return 'Calma a los Pokémon en Pokémon GO.';
            return 'Baya con diversos efectos beneficiosos para los Pokémon.';
          }

          if (itemName.includes('protein') || itemName.includes('iron') || itemName.includes('calcium') || 
              itemName.includes('zinc') || itemName.includes('carbos') || itemName.includes('hp-up')) {
            if (itemName.includes('protein')) return 'Aumenta los puntos de esfuerzo de Ataque.';
            if (itemName.includes('iron')) return 'Aumenta los puntos de esfuerzo de Defensa.';
            if (itemName.includes('calcium')) return 'Aumenta los puntos de esfuerzo de Ataque Especial.';
            if (itemName.includes('zinc')) return 'Aumenta los puntos de esfuerzo de Defensa Especial.';
            if (itemName.includes('carbos')) return 'Aumenta los puntos de esfuerzo de Velocidad.';
            if (itemName.includes('hp-up')) return 'Aumenta los puntos de esfuerzo de PS.';
            return 'Aumenta los puntos de esfuerzo de las estadísticas base.';
          }

          if (itemName.includes('stone') && !itemName.includes('everstone') && !itemName.includes('hard-stone')) {
            if (itemName.includes('fire')) return 'Evoluciona a Pokémon como Vulpix, Growlithe y Eevee.';
            if (itemName.includes('water')) return 'Evoluciona a Pokémon como Poliwhirl, Shellder y Eevee.';
            if (itemName.includes('thunder')) return 'Evoluciona a Pokémon como Pikachu, Eevee y Magneton.';
            if (itemName.includes('leaf')) return 'Evoluciona a Pokémon como Gloom, Weepinbell y Exeggcute.';
            if (itemName.includes('moon')) return 'Evoluciona a Pokémon como Nidorina, Nidorino y Munna.';
            if (itemName.includes('sun')) return 'Evoluciona a Pokémon como Gloom, Sunkern y Petilil.';
            if (itemName.includes('shiny')) return 'Evoluciona a Pokémon como Togetic y Roselia.';
            if (itemName.includes('dusk')) return 'Evoluciona a Pokémon como Murkrow y Misdreavus.';
            if (itemName.includes('dawn')) return 'Evoluciona a Pokémon como Kirlia y Snorunt.';
            if (itemName.includes('ice')) return 'Evoluciona a Pokémon como Eevee.';
            return 'Piedra evolutiva para hacer evolucionar a ciertos Pokémon.';
          }

          if (itemName.includes('leftovers')) return 'El Pokémon recupera 1/16 de sus PS al final de cada turno.';
          if (itemName.includes('life-orb')) return 'Aumenta el poder de los movimientos en 30%, pero resta 10% de PS al atacar.';
          if (itemName.includes('focus-sash')) return 'Permite aguantar un golpe que debilitaría al Pokémon, quedándose con 1 PS.';
          if (itemName.includes('focus-band')) return 'Tiene un 10% de probabilidad de aguantar un golpe que debilitaría al Pokémon.';
          if (itemName.includes('choice-band')) return 'Aumenta el Ataque en 50%, pero solo permite usar un movimiento.';
          if (itemName.includes('choice-scarf')) return 'Aumenta la Velocidad en 50%, pero solo permite usar un movimiento.';
          if (itemName.includes('choice-specs')) return 'Aumenta el Ataque Especial en 50%, pero solo permite usar un movimiento.';
          if (itemName.includes('light-ball')) return 'Dobla el Ataque y Ataque Especial de Pikachu.';
          if (itemName.includes('thick-club')) return 'Dobla el Ataque de Cubone y Marowak.';
          if (itemName.includes('metal-powder')) return 'Aumenta la Defensa de Ditto en 50%.';
          if (itemName.includes('quick-powder')) return 'Aumenta la Velocidad de Ditto en 50%.';
          if (itemName.includes('soul-dew')) return 'Aumenta el Ataque Especial y Defensa Especial de Latios y Latias en 50%.';
          if (itemName.includes('deep-sea-tooth')) return 'Dobla el Ataque Especial de Clamperl.';
          if (itemName.includes('deep-sea-scale')) return 'Dobla la Defensa Especial de Clamperl.';
          if (itemName.includes('adamant-orb')) return 'Aumenta el poder de movimientos de tipo Dragón y Acero de Dialga en 20%.';
          if (itemName.includes('lustrous-orb')) return 'Aumenta el poder de movimientos de tipo Dragón y Agua de Palkia en 20%.';
          if (itemName.includes('griseous-orb')) return 'Aumenta el poder de movimientos de tipo Dragón y Fantasma de Giratina en 20%.';

          if (itemName.includes('plate') || itemName.includes('gem') || itemName.includes('incense')) {
            if (itemName.includes('plate')) return 'Aumenta el poder de movimientos de su tipo en 20%.';
            if (itemName.includes('gem')) return 'Aumenta el poder del primer movimiento de su tipo en 30%.';
            if (itemName.includes('incense')) return 'Aumenta el poder de movimientos de su tipo y afecta la cría.';
            return 'Aumenta el poder de movimientos de un tipo específico.';
          }

          if (category.includes('machine') || category.includes('technical-machine') || 
              category.includes('hidden-machine')) {
            return 'Enseña un movimiento a un Pokémon. Algunos son reutilizables.';
          }

          if (itemName.includes('nugget')) return 'Pepita de oro puro. Se puede vender por un alto precio.';
          if (itemName.includes('pearl')) return 'Perla bonita y brillante. Se puede vender a bajo precio.';
          if (itemName.includes('stardust')) return 'Polvo de estrella rojo y bonito. Se puede vender a buen precio.';
          if (itemName.includes('star-piece')) return 'Trozo de estrella muy valioso. Se puede vender por un precio muy alto.';
          if (itemName.includes('big-mushroom')) return 'Seta grande y rara. Se puede vender a buen precio.';
          if (itemName.includes('tiny-mushroom')) return 'Seta pequeña y común. Se puede vender a bajo precio.';
          if (itemName.includes('rare-bone')) return 'Hueso raro y valioso. Se puede vender por un precio muy alto.';
          if (itemName.includes('heart-scale')) return 'Escama bonita y con forma de corazón. Se puede usar para reaprender movimientos.';

          if (itemName.includes('fossil') || itemName.includes('old-amber')) {
            if (itemName.includes('helix')) return 'Fósil de un Pokémon marino antiguo. Revive a Omanyte.';
            if (itemName.includes('dome')) return 'Fósil de un Pokémon marino antiguo. Revive a Kabuto.';
            if (itemName.includes('old-amber')) return 'Ámbar que contiene material genético. Revive a Aerodactyl.';
            if (itemName.includes('root')) return 'Fósil de un Pokémon planta antiguo. Revive a Lileep.';
            if (itemName.includes('claw')) return 'Fósil de un Pokémon antiguo. Revive a Anorith.';
            if (itemName.includes('armor')) return 'Fósil de un Pokémon blindado antiguo. Revive a Shieldon.';
            if (itemName.includes('skull')) return 'Fósil de un Pokémon antiguo. Revive a Cranidos.';
            return 'Fósil para revivir Pokémon prehistóricos en laboratorios especializados.';
          }

          if (itemName.includes('x-attack') || itemName.includes('x-defense') || itemName.includes('x-speed') || 
              itemName.includes('x-accuracy') || itemName.includes('x-sp-atk') || itemName.includes('x-sp-def') ||
              itemName.includes('dire-hit') || itemName.includes('guard-spec')) {
            if (itemName.includes('x-attack')) return 'Aumenta el Ataque de un Pokémon durante el combate.';
            if (itemName.includes('x-defense')) return 'Aumenta la Defensa de un Pokémon durante el combate.';
            if (itemName.includes('x-speed')) return 'Aumenta la Velocidad de un Pokémon durante el combate.';
            if (itemName.includes('x-accuracy')) return 'Aumenta la Precisión de un Pokémon durante el combate.';
            if (itemName.includes('x-sp-atk')) return 'Aumenta el Ataque Especial de un Pokémon durante el combate.';
            if (itemName.includes('x-sp-def')) return 'Aumenta la Defensa Especial de un Pokémon durante el combate.';
            if (itemName.includes('dire-hit')) return 'Aumenta la probabilidad de asestar un golpe crítico.';
            if (itemName.includes('guard-spec')) return 'Protege al equipo de reducciones de características.';
            return 'Objeto que aumenta temporalmente las estadísticas en combate.';
          }

          if (itemName.includes('flute')) {
            if (itemName.includes('blue')) return 'Despierta a un Pokémon dormido.';
            if (itemName.includes('yellow')) return 'Cura la confusión de un Pokémon.';
            if (itemName.includes('red')) return 'Libera a un Pokémon del enamoramiento.';
            if (itemName.includes('black')) return 'Aumenta la frecuencia de encuentros con Pokémon salvajes.';
            if (itemName.includes('white')) return 'Disminuye la frecuencia de encuentros con Pokémon salvajes.';
            return 'Flauta con efectos especiales sobre los Pokémon.';
          }

          if (itemName.includes('repel')) {
            if (itemName.includes('max')) return 'Repele Pokémon débiles durante 250 pasos.';
            if (itemName.includes('super')) return 'Repele Pokémon débiles durante 200 pasos.';
            return 'Repele Pokémon débiles durante 100 pasos.';
          }

          if (itemName.includes('mail') || itemName.includes('letter')) {
            return 'Carta decorativa para enviar mensajes a otros entrenadores.';
          }

          if (itemName.includes('rare-candy')) return 'Aumenta el nivel de un Pokémon en 1.';
          if (itemName.includes('exp-share')) return 'El Pokémon que lo lleva gana experiencia aunque no participe en combate.';
          if (itemName.includes('lucky-egg')) return 'Aumenta la experiencia ganada en un 50%.';
          if (itemName.includes('everstone')) return 'Evita que el Pokémon evolucione.';
          if (itemName.includes('destiny-knot')) return 'Si el Pokémon que lo lleva es alcanzado por Atracción, el oponente también queda enamorado.';
          if (itemName.includes('amulet-coin')) return 'Dobla el dinero recibido después de ganar un combate.';
          if (itemName.includes('soothe-bell')) return 'Ayuda a aumentar la felicidad del Pokémon más rápidamente.';

          if (category.includes('vitamin')) return 'Aumenta las estadísticas base del Pokémon.';
          if (category.includes('healing')) return 'Cura PS o elimina problemas de estado del Pokémon.';
          if (category.includes('pokeballs')) return 'Dispositivo para capturar Pokémon salvajes.';
          if (category.includes('evolution')) return 'Instrumento para hacer evolucionar a ciertos Pokémon.';
          if (category.includes('mulch')) return 'Abono especial para cultivar bayas más rápidamente.';
          if (category.includes('special-balls')) return 'Poké Ball con efectos especiales para capturar Pokémon.';
          if (category.includes('standard-balls')) return 'Poké Ball estándar para capturar Pokémon.';
          if (category.includes('medicine')) return 'Medicina para curar o mejorar a los Pokémon.';
          if (category.includes('effort-drop')) return 'Modifica los puntos de esfuerzo del Pokémon.';
          if (category.includes('other')) return 'Objeto misceláneo con diversos usos.';

          return 'Objeto con diversas utilidades para el entrenador Pokémon.';
        };

        const itemInfo = {
          name: spanishName,
          category: categoryName,
          cost: data.cost,
          functionality: getItemFunctionality(data),
          sprite: data.sprites.default
        };
        
        setSelectedItem(itemInfo);
        setSelectedPokemon(null);
        setSelectedMove(null);
      } catch (error) {
        console.error('❌ Error procesando objeto:', error);
        throw error;
      }
    };

    const handleSearch = (e) => {
      e.preventDefault();
      searchPokeAPI(searchTerm, searchType);
    };

    const handleInputChange = (e) => {
      const value = e.target.value;
      setSearchTerm(value);
      updateSuggestions(value, searchType);
    };

    const handleSuggestionClick = (suggestion) => {
      setSearchTerm(suggestion.name);
      setSuggestions([]);
      searchPokeAPI(suggestion.name, searchType);
    };

    const handleSearchTypeChange = (type) => {
      setSearchType(type);
      setSearchTerm('');
      setSuggestions([]);
      setSelectedPokemon(null);
      setSelectedMove(null);
      setSelectedItem(null);
    };

    return (
      <div className="space-y-6 p-6">
        <h2 className="text-3xl font-bold mb-6 text-purple-400 border-b border-purple-400/50 pb-4">
          📚 Pokédex - Información Completa
        </h2>

        <div className="bg-white/10 p-6 rounded-xl shadow-lg">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex gap-2">
                <button type="button" onClick={() => handleSearchTypeChange('pokemon')} className={`px-4 py-2 rounded-lg font-bold transition duration-300 ${searchType === 'pokemon' ? 'bg-purple-600 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}>Pokémon</button>
                <button type="button" onClick={() => handleSearchTypeChange('move')} className={`px-4 py-2 rounded-lg font-bold transition duration-300 ${searchType === 'move' ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}>Movimientos</button>
                <button type="button" onClick={() => handleSearchTypeChange('item')} className={`px-4 py-2 rounded-lg font-bold transition duration-300 ${searchType === 'item' ? 'bg-yellow-600 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}>Objetos</button>
              </div>

              <div className="flex-grow relative">
                <input 
                  type="text" 
                  value={searchTerm} 
                  onChange={handleInputChange} 
                  placeholder={
                    searchType === 'pokemon' ? 'Buscar Pokémon... (Ej: Pikachu, Charizard)' : 
                    searchType === 'move' ? 'Buscar movimiento... (Ej: Lanzallamas, Rayo)' : 
                    'Buscar objeto... (Ej: Poción, Poké Ball)'
                  } 
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400" 
                />
                {suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-gray-800 border border-white/20 rounded-lg mt-1 z-20 max-h-60 overflow-y-auto shadow-2xl">
                    {suggestions.map((suggestion, index) => (
                      <button 
                        key={index} 
                        type="button" 
                        onClick={() => handleSuggestionClick(suggestion)} 
                        className="w-full text-left p-3 hover:bg-white/10 transition duration-200 flex items-center gap-3 text-white/80 hover:text-white border-b border-white/5 last:border-b-0"
                      >
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{suggestion.name}</span>
                          {suggestion.name !== suggestion.englishName && (
                            <span className="text-white/50 text-xs">{suggestion.englishName}</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                disabled={isLoading || !searchTerm.trim()} 
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition duration-300 flex items-center gap-2 whitespace-nowrap"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Buscando...
                  </>
                ) : (
                  '🔍 Buscar'
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
              <p className="text-red-400">❌ {error}</p>
            </div>
          )}
        </div>

        <div className="min-h-96">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white/70">Buscando información...</p>
            </div>
          ) : selectedPokemon ? (
            <PokemonInfo pokemon={selectedPokemon} typeColors={typeColors} />
          ) : selectedMove ? (
            <MoveInfo move={selectedMove} typeColors={typeColors} />
          ) : selectedItem ? (
            <ItemInfo item={selectedItem} />
          ) : (
            <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-2xl font-bold text-white/70 mb-2">Pokédex Completa</h3>
              <p className="text-white/50 mb-6">Busca información detallada sobre Pokémon, movimientos y objetos.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-2xl mx-auto">
                <div className="bg-purple-900/30 p-4 rounded-lg">
                  <h4 className="font-bold text-purple-300 mb-2">🔍 Pokémon</h4>
                  <p className="text-white/70 text-sm">Estadísticas, tipos, habilidades y más</p>
                </div>
                <div className="bg-blue-900/30 p-4 rounded-lg">
                  <h4 className="font-bold text-blue-300 mb-2">⚡ Movimientos</h4>
                  <p className="text-white/70 text-sm">Poder, precisión, PP y efectos</p>
                </div>
                <div className="bg-yellow-900/30 p-4 rounded-lg">
                  <h4 className="font-bold text-yellow-300 mb-2">🎒 Objetos</h4>
                  <p className="text-white/70 text-sm">Precios, efectos y categorías</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  function PokemonInfo({ pokemon, typeColors }) {
    return (
      <div className="bg-white/10 rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div><h3 className="text-3xl font-bold text-white">{pokemon.name}</h3><p className="text-white/80">#{String(pokemon.id).padStart(3, '0')}</p></div>
            <div className="flex gap-2 mt-2 md:mt-0">
              {pokemon.types.map(type => <span key={type.name} className={`px-3 py-1 rounded-full text-white font-bold capitalize ${typeColors[type.name].bg}`}>{type.spanishName}</span>)}
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <img src={pokemon.sprites.official || pokemon.sprites.front} alt={pokemon.name} className="w-48 h-48 mx-auto object-contain" />
                <p className="text-white/70 mt-2">Ilustración Oficial</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/5 rounded-lg p-3 text-center"><img src={pokemon.sprites.front} alt={`${pokemon.name} frontal`} className="w-20 h-20 mx-auto object-contain" /><p className="text-white/70 text-sm">Frontal</p></div>
                <div className="bg-white/5 rounded-lg p-3 text-center"><img src={pokemon.sprites.back} alt={`${pokemon.name} trasero`} className="w-20 h-20 mx-auto object-contain" /><p className="text-white/70 text-sm">Trasero</p></div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="font-bold text-purple-300 mb-3">📊 Estadísticas Base</h4>
                {pokemon.stats.map(stat => (
                  <div key={stat.name} className="flex justify-between items-center mb-2">
                    <span className="text-white/80">{stat.spanishName}:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">{stat.value}</span>
                      <div className="w-24 bg-white/10 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(stat.value, 150) / 150 * 100}%` }}></div></div>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/10">
                  <span className="text-white/80 font-bold">Total:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400 font-bold text-lg">{pokemon.totalStats}</span>
                    <div className="w-24 bg-white/10 rounded-full h-2"><div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${Math.min(pokemon.totalStats, 600) / 600 * 100}%` }}></div></div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="font-bold text-purple-300 mb-3">📏 Características</h4>
                <div className="flex justify-between mb-2"><span className="text-white/80">Altura:</span><span className="text-white font-bold">{pokemon.height} m</span></div>
                <div className="flex justify-between mb-2"><span className="text-white/80">Peso:</span><span className="text-white font-bold">{pokemon.weight} kg</span></div>
                <div className="flex justify-between"><span className="text-white/80">Experiencia Base:</span><span className="text-yellow-400 font-bold">{pokemon.baseExperience}</span></div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="font-bold text-purple-300 mb-3">🌟 Habilidades</h4>
                {pokemon.abilities.map(ability => (
                  <div key={ability.englishName} className="mb-3 last:mb-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-white capitalize">{ability.name}</span>
                      {ability.isHidden && <span className="text-yellow-400 text-sm bg-yellow-900/30 px-2 py-1 rounded-full">Oculta</span>}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="font-bold text-purple-300 mb-3">📖 Descripción</h4>
                <p className="text-white/80 text-sm leading-relaxed">{pokemon.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function MoveInfo({ move, typeColors }) {
    return (
      <div className="bg-white/10 rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div><h3 className="text-3xl font-bold text-white">{move.name}</h3><p className="text-white/80">Movimiento</p></div>
            <div className="flex gap-2 mt-2 md:mt-0">
              <span className={`px-3 py-1 rounded-full text-white font-bold capitalize ${typeColors[move.type.name].bg}`}>{move.type.spanishName}</span>
              <span className={`px-3 py-1 rounded-full text-white font-bold capitalize ${move.damageClass.name === 'physical' ? 'bg-red-500' : move.damageClass.name === 'special' ? 'bg-blue-500' : 'bg-gray-500'}`}>{move.damageClass.spanishName}</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="font-bold text-blue-300 mb-3">⚡ Estadísticas</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-900/30 rounded-lg"><div className="text-2xl font-bold text-white">{move.power || '—'}</div><div className="text-blue-300 text-sm">Poder</div></div>
                  <div className="text-center p-3 bg-blue-900/30 rounded-lg"><div className="text-2xl font-bold text-white">{move.accuracy || '—'}</div><div className="text-blue-300 text-sm">Precisión</div></div>
                  <div className="text-center p-3 bg-blue-900/30 rounded-lg"><div className="text-2xl font-bold text-white">{move.pp}</div><div className="text-blue-300 text-sm">PP</div></div>
                  <div className="text-center p-3 bg-blue-900/30 rounded-lg"><div className="text-2xl font-bold text-white">{move.priority}</div><div className="text-blue-300 text-sm">Prioridad</div></div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="font-bold text-blue-300 mb-3">📖 Descripción</h4>
                <p className="text-white/80 text-sm leading-relaxed">{move.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function ItemInfo({ item }) {
    return (
      <div className="bg-white/10 rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-600 to-amber-600 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h3 className="text-3xl font-bold text-white">{item.name}</h3>
              <p className="text-white/80">Objeto</p>
            </div>
            <div className="flex gap-2 mt-2 md:mt-0">
              <span className="px-3 py-1 bg-yellow-500 rounded-full text-white font-bold">
                {item.cost} ₽
              </span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="flex justify-center">
            <div className="bg-white/5 rounded-lg p-6 text-center">
              {item.sprite && (
                <img
                  src={item.sprite}
                  alt={item.name}
                  className="w-32 h-32 mx-auto object-contain"
                />
              )}
              <p className="text-white/70 mt-2">Sprite del Objeto</p>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="font-bold text-yellow-300 mb-3">📋 Información del Objeto</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/80">Categoría:</span>
                  <span className="text-white capitalize">{item.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">Precio:</span>
                  <span className="text-yellow-400 font-bold">{item.cost} Pokéyenes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">Funcionalidad:</span>
                  <span className="text-blue-400 text-sm">{item.functionality}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}