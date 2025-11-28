import React, { useState, useEffect } from 'react';

export default function PokedexPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('pokemon');
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [selectedMove, setSelectedMove] = useState(null);
  const [selectedAbility, setSelectedAbility] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [allData, setAllData] = useState({ pokemon: [], moves: [], abilities: [] });

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
    'drain-punch': 'Puño Drenaje', 'drain-bite': 'Mordisco Drenaje', 'spiky-shield': "Barrera Espinosa", "kings-shield": "Escudo real", 'branch-poke': 'Punzada Rama', 'drum-beating': 'Batería Asalto', 'snap-trap': 'Cepo','pyro-ball': 'Balón Ígneo','double-iron-bash': 'Golpe Férreo','dynamax-cannon': 'Cañón Dinamax','snipe-shot': 'Disparo Certero','apple-acid': 'Ácido Málico','grav-apple': 'Grave Manzana','spirit-break': 'Quebranto', 'strange-steam': 'Humo Extraño','life-dew': 'Rocío Vital','body-press': 'Plancha Corporal','decorate': 'Decoración','dragon-darts': 'Dardos Dragón','behemoth-blade': 'Tajo Supremo','behemoth-bash': 'Embestida Suprema','aura-wheel': 'Rueda Aural','breaking-swipe': 'Vasto Impacto','branch-poke': 'Punzada Rama','overdrive': 'Sobrecarga','eternabeam': 'Rayo Infinito','jungle-healing': 'Cura Selvática','wicked-blow': 'Golpe Tremendo','surging-strikes': 'Asalto Espumoso',
  };

  const abilityTranslations = {
    'stench': 'Hedor', 'drizzle': 'Llovizna', 'speed-boost': 'Impulso', 'battle-armor': 'Armadura Batalla',
    'sturdy': 'Robustez', 'damp': 'Humedad', 'limber': 'Flexibilidad', 'sand-veil': 'Velo Arena',
    'static': 'Estática', 'volt-absorb': 'Absorbe Electricidad', 'water-absorb': 'Absorbe Agua',
    'oblivious': 'Despiste', 'cloud-nine': 'Aclimatación', 'compound-eyes': 'Ojo Compuesto',
    'insomnia': 'Insomnio', 'color-change': 'Cambio Color', 'immunity': 'Inmunidad',
    'flash-fire': 'Absorbe Fuego', 'shield-dust': 'Polvo Escudo', 'own-tempo': 'Ritmo Propio',
    'suction-cups': 'Ventosas', 'intimidate': 'Intimidación', 'shadow-tag': 'Sombra Trampa',
    'rough-skin': 'Piel Tosca', 'wonder-guard': 'Superguarda', 'levitate': 'Levitación',
    'effect-spore': 'Efecto Espora', 'synchronize': 'Sincronía', 'clear-body': 'Cuerpo Puro',
    'natural-cure': 'Cura Natural', 'lightning-rod': 'Pararrayos', 'serene-grace': 'Dicha',
    'swift-swim': 'Nado Rápido', 'chlorophyll': 'Clorofila', 'illuminate': 'Iluminación',
    'trace': 'Calco', 'huge-power': 'Potencia', 'poison-point': 'Punto Tóxico',
    'inner-focus': 'Foco Interno', 'magma-armor': 'Escudo Magma', 'water-veil': 'Velo Agua',
    'magnet-pull': 'Imán', 'soundproof': 'Insonorizar', 'rain-dish': 'Cura Lluvia',
    'sand-stream': 'Chorro Arena', 'pressure': 'Presión', 'thick-fat': 'Sebo',
    'early-bird': 'Madrugar', 'flame-body': 'Cuerpo Llama', 'run-away': 'Fuga',
    'keen-eye': 'Vista Lince', 'hyper-cutter': 'Corte Fuerte', 'pickup': 'Recogida',
    'truant': 'Ausente', 'hustle': 'Entusiasmo', 'cute-charm': 'Gran Encanto',
    'plus': 'Más', 'minus': 'Menos', 'forecast': 'Predicción', 'sticky-hold': 'Viscosidad',
    'shed-skin': 'Mudar', 'guts': 'Agallas', 'marvel-scale': 'Escama Especial',
    'liquid-ooze': 'Lodo Líquido', 'overgrow': 'Espesura', 'blaze': 'Mar Llamas',
    'torrent': 'Torrente', 'swarm': 'Enjambre', 'rock-head': 'Cabeza Roca',
    'drought': 'Sequía', 'arena-trap': 'Trampa Arena', 'vital-spirit': 'Espíritu Vital',
    'white-smoke': 'Humo Blanco', 'pure-power': 'Energía Pura', 'shell-armor': 'Caparazón',
    'air-lock': 'Bucle Aire', 'tangled-feet': 'Tumbos', 'motor-drive': 'Electromotor',
    'rivalry': 'Rivalidad', 'steadfast': 'Impasible', 'snow-cloak': 'Manto Níveo',
    'gluttony': 'Gula', 'anger-point': 'Irascible', 'unburden': 'Liviano',
    'heatproof': 'Ignífugo', 'simple': 'Simple', 'dry-skin': 'Piel Seca',
    'download': 'Descarga', 'iron-fist': 'Puño Férreo', 'poison-heal': 'Antídoto',
    'adaptability': 'Adaptable', 'skill-link': 'Encadenado', 'hydration': 'Hidratación',
    'solar-power': 'Poder Solar', 'quick-feet': 'Pies Rápidos', 'normalize': 'Normalidad',
    'sniper': 'Francotirador', 'magic-guard': 'Muro Mágico', 'no-guard': 'Indefenso',
    'stall': 'Rezagado', 'technician': 'Experto', 'leaf-guard': 'Defensa Hoja',
    'klutz': 'Zote', 'mold-breaker': 'Rompemoldes', 'super-luck': 'Afortunado',
    'aftermath': 'Resquicio', 'anticipation': 'Anticipación', 'forewarn': 'Alerta',
    'unaware': 'Ignorante', 'tinted-lens': 'Cromolente', 'filter': 'Filtro',
    'slow-start': 'Inicio Lento', 'scrappy': 'Intrépido', 'storm-drain': 'Colector',
    'ice-body': 'Gélido', 'solid-rock': 'Roca Sólida', 'snow-warning': 'Nevada',
    'honey-gather': 'Recogemiel', 'frisk': 'Cacheo', 'reckless': 'Audaz',
    'multitype': 'Multitipo', 'flower-gift': 'Don Floral', 'bad-dreams': 'Mal Sueño',
    'pickpocket': 'Hurto', 'sheer-force': 'Potencia Bruta', 'contrary': 'Respondón',
    'unnerve': 'Nerviosismo', 'defiant': 'Competitivo', 'defeatist': 'Flaqueza',
    'cursed-body': 'Cuerpo Maldito', 'healer': 'Alma Cura', 'friend-guard': 'Compiescolta',
    'weak-armor': 'Armadura Frágil', 'heavy-metal': 'Metal Pesado', 'light-metal': 'Metal Liviano',
    'multiscale': 'Compensación', 'toxic-boost': 'Ímpetu Tóxico', 'flare-boost': 'Ímpetu Ardiente',
    'harvest': 'Cosecha', 'telepathy': 'Telepatía', 'moody': 'Veleta',
    'overcoat': 'Funda', 'poison-touch': 'Toque Tóxico', 'regenerator': 'Regeneración',
    'big-pecks': 'Sacapecho', 'sand-rush': 'Ímpetu Arena', 'wonder-skin': 'Piel Milagro',
    'analytic': 'Cálculo Final', 'illusion': 'Ilusión', 'imposter': 'Impostor',
    'infiltrator': 'Allanamiento', 'mummy': 'Momia', 'moxie': 'Autoestima',
    'justified': 'Justiciero', 'rattled': 'Cobardía', 'magic-bounce': 'Espejo Mágico',
    'sap-sipper': 'Herbívoro', 'prankster': 'Bromista', 'sand-force': 'Poder Arena',
    'iron-barbs': 'Punta Acero', 'zen-mode': 'Modo Zen', 'victory-star': 'Tinovictoria',
    'turboblaze': 'Turbollama', 'teravolt': 'Terravoltaje', 'aroma-veil': 'Velo Aroma',
    'flower-veil': 'Velo Flor', 'cheek-pouch': 'Carrillo', 'protean': 'Mutatipo',
    'fur-coat': 'Pelaje Recio', 'magician': 'Prestidigitación', 'bulletproof': 'Antibalas',
    'competitive': 'Tenacidad', 'strong-jaw': 'Mandíbula Fuerte', 'refrigerate': 'Piel Helada',
    'sweet-veil': 'Velo Dulce', 'stance-change': 'Cambio Táctico', 'gale-wings': 'Alas Vendaval',
    'mega-launcher': 'Megadisparador', 'grass-pelt': 'Manto Frondoso', 'symbiosis': 'Simbiosis',
    'tough-claws': 'Garras Duras', 'pixilate': 'Piel Feérica', 'gooey': 'Baba',
    'aerilate': 'Piel Celeste', 'parental-bond': 'Amor Filial', 'dark-aura': 'Aura Oscura',
    'fairy-aura': 'Aura Feérica', 'aura-break': 'Rompeaura', 'primordial-sea': 'Mar del Albor',
    'desolate-land': 'Tierra del Ocaso', 'delta-stream': 'Ráfaga Delta', 'stamina': 'Firmeza',
    'wimp-out': 'Huida', 'emergency-exit': 'Retirada', 'water-compaction': 'Hidrorrefuerzo',
    'merciless': 'Ensañamiento', 'shields-down': 'Escudo Limitado', 'stakeout': 'Vigilante',
    'water-bubble': 'Pompa', 'steelworker': 'Acero Templado', 'berserk': 'Cólera',
    'slush-rush': 'Quitanieves', 'long-reach': 'Remoto', 'liquid-voice': 'Voz Fluida',
    'triage': 'Primer Auxilio', 'galvanize': 'Piel Eléctrica', 'surge-surfer': 'Cola Surf',
    'schooling': 'Banco', 'disguise': 'Disfraz', 'battle-bond': 'Fuerte Afecto',
    'power-construct': 'Agrupamiento', 'corrosion': 'Corrosión', 'comatose': 'Letargo Perenne',
    'queenly-majesty': 'Regia Presencia', 'innards-out': 'Vísceras', 'dancer': 'Pareja de Baile',
    'battery': 'Batería', 'fluffy': 'Peluche', 'dazzling': 'Cuerpo Vívido',
    'soul-heart': 'Coránima', 'tangling-hair': 'Rizos Rebeldes', 'receiver': 'Receptor',
    'power-of-alchemy': 'Reacción Química', 'beast-boost': 'Ultraimpulso', 'rks-system': 'Sistema ALAD',
    'electric-surge': 'Electrogénesis', 'psychic-surge': 'Psicogénesis', 'misty-surge': 'Campo de Niebla',
    'grassy-surge': 'Herbogénesis', 'full-metal-body': 'Guardia Metálica', 'shadow-shield': 'Guardia Espectro',
    'prism-armor': 'Armadura Prisma', 'neuroforce': 'Fuerza Cerebral', 'intrepid-sword': 'Espada Indómita',
    'dauntless-shield': 'Escudo Recio', 'libero': 'Líbero', 'ball-fetch': 'Recogebolas',
    'cotton-down': 'Pelusa', 'propeller-tail': 'Hélice Caudal', 'mirror-armor': 'Coraza Reflejo',
    'gulp-missile': 'Tragamisil', 'stalwart': 'Acérrimo', 'steam-engine': 'Máquina de Vapor',
    'punk-rock': 'Música Punk', 'sand-spit': 'Escuparena', 'ice-scales': 'Escamas de Hielo',
    'ripen': 'Maduración', 'ice-face': 'Cara de Hielo', 'power-spot': 'Punto Potencia',
    'mimicry': 'Mimetismo', 'screen-cleaner': 'Antibarrera', 'steely-spirit': 'Alma Acerada',
    'perish-body': 'Cuerpo Mortal', 'wandering-spirit': 'Alma Errante', 'gorilla-tactics': 'Táctica Simia',
    'neutralizing-gas': 'Gas Reactivo', 'pastel-veil': 'Velo Pastel', 'hunger-switch': 'Mutapetito',
    'quick-draw': 'Mano Rápida', 'unseen-fist': 'Puño Invisible', 'curious-medicine': 'Medicina Extraña',
    'transistor': 'Transistor', 'dragons-maw': 'Mandíbula Dragón', 'chilling-neigh': 'Relincho Blanco',
    'grim-neigh': 'Relincho Negro', 'as-one-glastrier': 'Unidad Glastrier', 'as-one-spectrier': 'Unidad Spectrier',
    'lingering-aroma': 'Aroma Persistente', 'seed-sower': 'Siembra', 'thermal-exchange': 'Termocambio',
    'anger-shell': 'Coraza de Ira', 'purifying-salt': 'Sal Purificadora', 'well-baked-body': 'Cuerpo Horneado',
    'wind-rider': 'Surcavientos', 'guard-dog': 'Perro Guardián', 'rocky-payload': 'Transportarrocas',
    'wind-power': 'Energía Eólica', 'zero-to-hero': 'De Cero a Héroe', 'commander': 'Comandante',
    'electromorphosis': 'Electromorfosis', 'protosynthesis': 'Protosíntesis', 'quark-drive': 'Motor Cuark',
    'good-as-gold': 'Oro Puro', 'vessel-of-ruin': 'Poder Aniquilador', 'sword-of-ruin': 'Espada Aniquiladora',
    'tablets-of-ruin': 'Tablas Aniquiladoras', 'beads-of-ruin': 'Cuentas Aniquiladoras', 'orichalcum-pulse': 'Latido Oricalco',
    'hadron-engine': 'Motor de Hadrones', 'opportunist': 'Oportunista', 'cud-chew': 'Rumia',
    'sharpness': 'Cortante', 'supersweet-syrup': 'Jarabe Dulce', 'hospitality': 'Hospitalidad',
    'toxic-debris': 'Escombros Tóxicos', 'embody-aspect': 'Encarnar Aspecto', 'tera-shift': 'Teracambio',
    'tera-shell': 'Teracaparazón', 'teraform-zero': 'Teraforma Cero', 'poison-puppeteer': 'Marioneta Venenosa', 'stench':'Hedor','drizzle':'Llovizna','speed-boost':'Impulso','battle-armor':'Armadura Batalla',
    'sturdy':'Robustez','damp':'Humedad','limber':'Flexibilidad','sand-veil':'Velo Arena',
    'static':'Estática','volt-absorb':'Absorbe Electricidad','water-absorb':'Absorbe Agua',
    'oblivious':'Despiste','cloud-nine':'Aclimatación','compound-eyes':'Ojo Compuesto',
    'insomnia':'Insomnio','color-change':'Cambio Color','immunity':'Inmunidad',
    'flash-fire':'Absorbe Fuego','shield-dust':'Polvo Escudo','own-tempo':'Ritmo Propio',
    'suction-cups':'Ventosas','intimidate':'Intimidación','shadow-tag':'Sombra Trampa',
    'rough-skin':'Piel Tosca','wonder-guard':'Superguarda','levitate':'Levitación',
    'effect-spore':'Efecto Espora','synchronize':'Sincronía','clear-body':'Cuerpo Puro',
    'natural-cure':'Cura Natural','lightning-rod':'Pararrayos','serene-grace':'Dicha',
    'swift-swim':'Nado Rápido','chlorophyll':'Clorofila','illuminate':'Iluminación',
    'trace':'Calco','huge-power':'Potencia','poison-point':'Punto Tóxico',
    'inner-focus':'Foco Interno','magma-armor':'Escudo Magma','water-veil':'Velo Agua',
    'magnet-pull':'Imán','soundproof':'Insonorizar','rain-dish':'Cura Lluvia',
    'sand-stream':'Chorro Arena','pressure':'Presión','thick-fat':'Sebo',
    'early-bird':'Madrugar','flame-body':'Cuerpo Llama','run-away':'Fuga',
    'keen-eye':'Vista Lince','hyper-cutter':'Corte Fuerte','pickup':'Recogida',
    'truant':'Ausente','hustle':'Entusiasmo','cute-charm':'Gran Encanto',
    'plus':'Más','minus':'Menos','forecast':'Predicción','sticky-hold':'Viscosidad',
    'shed-skin':'Mudar','guts':'Agallas','marvel-scale':'Escama Especial',
    'liquid-ooze':'Lodo Líquido','overgrow':'Espesura','blaze':'Mar Llamas',
    'torrent':'Torrente','swarm':'Enjambre','rock-head':'Cabeza Roca',
    'drought':'Sequía','arena-trap':'Trampa Arena','vital-spirit':'Espíritu Vital',
    'white-smoke':'Humo Blanco','pure-power':'Energía Pura','shell-armor':'Caparazón',
    'air-lock':'Bucle Aire','tangled-feet':'Tumbos','motor-drive':'Electromotor',
    'rivalry':'Rivalidad','steadfast':'Impasible','snow-cloak':'Manto Níveo',
    'gluttony':'Gula','anger-point':'Irascible','unburden':'Liviano',
    'heatproof':'Ignífugo','simple':'Simple','dry-skin':'Piel Seca',
    'download':'Descarga','iron-fist':'Puño Férreo','poison-heal':'Antídoto',
    'adaptability':'Adaptable','skill-link':'Encadenado','hydration':'Hidratación',
    'solar-power':'Poder Solar','quick-feet':'Pies Rápidos','normalize':'Normalidad',
    'sniper':'Francotirador','magic-guard':'Muro Mágico','no-guard':'Indefenso',
    'stall':'Rezagado','technician':'Experto','leaf-guard':'Defensa Hoja',
    'klutz':'Zote','mold-breaker':'Rompemoldes','super-luck':'Afortunado',
    'aftermath':'Resquicio','anticipation':'Anticipación','forewarn':'Alerta',
    'unaware':'Ignorante','tinted-lens':'Cromolente','filter':'Filtro',
    'slow-start':'Inicio Lento','scrappy':'Intrépido','storm-drain':'Colector',
    'ice-body':'Gélido','solid-rock':'Roca Sólida','snow-warning':'Nevada',
    'honey-gather':'Recogemiel','frisk':'Cacheo','reckless':'Audaz',
    'multitype':'Multitipo','flower-gift':'Don Floral','bad-dreams':'Mal Sueño',
    'pickpocket':'Hurto','sheer-force':'Potencia Bruta','contrary':'Respondón',
    'unnerve':'Nerviosismo','defiant':'Competitivo','defeatist':'Flaqueza',
    'cursed-body':'Cuerpo Maldito','healer':'Alma Cura','friend-guard':'Compiescolta',
    'weak-armor':'Armadura Frágil','heavy-metal':'Metal Pesado','light-metal':'Metal Liviano',
    'multiscale':'Compensación','toxic-boost':'Ímpetu Tóxico','flare-boost':'Ímpetu Ardiente',
    'harvest':'Cosecha','telepathy':'Telepatía','moody':'Veleta',
    'overcoat':'Funda','poison-touch':'Toque Tóxico','regenerator':'Regeneración',
    'big-pecks':'Sacapecho','sand-rush':'Ímpetu Arena','wonder-skin':'Piel Milagro',
    'analytic':'Cálculo Final','illusion':'Ilusión','imposter':'Impostor',
    'infiltrator':'Allanamiento','mummy':'Momia','moxie':'Autoestima',
    'justified':'Justiciero','rattled':'Cobardía','magic-bounce':'Espejo Mágico',
    'sap-sipper':'Herbívoro','prankster':'Bromista','sand-force':'Poder Arena',
    'iron-barbs':'Punta Acero','zen-mode':'Modo Zen','victory-star':'Tinovictoria',
    'turboblaze':'Turbollama','teravolt':'Terravoltaje','aroma-veil':'Velo Aroma',
    'flower-veil':'Velo Flor','cheek-pouch':'Carrillo','protean':'Mutatipo',
    'fur-coat':'Pelaje Recio','magician':'Prestidigitación','bulletproof':'Antibalas',
    'competitive':'Tenacidad','strong-jaw':'Mandíbula Fuerte','refrigerate':'Piel Helada',
    'sweet-veil':'Velo Dulce','stance-change':'Cambio Táctico','gale-wings':'Alas Vendaval',
    'mega-launcher':'Megadisparador','grass-pelt':'Manto Frondoso','symbiosis':'Simbiosis',
    'tough-claws':'Garras Duras','pixilate':'Piel Feérica','gooey':'Baba',
    'aerilate':'Piel Celeste','parental-bond':'Amor Filial','dark-aura':'Aura Oscura',
    'fairy-aura':'Aura Feérica','aura-break':'Rompeaura','primordial-sea':'Mar del Albor',
    'desolate-land':'Tierra del Ocaso','delta-stream':'Ráfaga Delta',

    // === GENERACIÓN 7 (Alola) ===
    'battery':'Batería','beast-boost':'Ultraimpulso','berserk':'Cólera','comatose':'Letargo Perenne',
    'corrosion':'Corrosión','dancer':'Pareja de Baile','disguise':'Disfraz','electric-surge':'Electrogénesis',
    'emergency-exit':'Retirada','fluffy':'Peluche','full-metal-body':'Guardia Metálica','galvanize':'Piel Eléctrica',
    'grassy-surge':'Herbogénesis','innards-out':'Vísceras','liquid-voice':'Voz Fluida','long-reach':'Remoto',
    'merciless':'Ensañamiento','misty-surge':'Campo de Niebla','neuroforce':'Fuerza Cerebral','power-construct':'Agrupamiento',
    'power-of-alchemy':'Reacción Química','prism-armor':'Armadura Prisma','psychic-surge':'Psicogénesis','queenly-majesty':'Regia Presencia',
    'receiver':'Receptor','rks-system':'Sistema ALAD','schooling':'Banco','shadow-shield':'Guardia Espectro',
    'shields-down':'Escudo Limitado','slush-rush':'Quitanieves','soul-heart':'Coránima','stakeout':'Vigilante',
    'stamina':'Firmeza','steelworker':'Acero Templado','surge-surfer':'Cola Surf','tangling-hair':'Rizos Rebeldes',
    'triage':'Primer Auxilio','water-bubble':'Pompa','water-compaction':'Hidrorrefuerzo','wimp-out':'Huida',

    // === GENERACIÓN 8 (Galar) ===
    'ball-fetch':'Recogebolas','cotton-down':'Pelusa','curious-medicine':'Medicina Extraña','dauntless-shield':'Escudo Recio',
    'dragons-maw':'Mandíbula Dragón','gorilla-tactics':'Táctica Simia','gulp-missile':'Tragamisil','hunger-switch':'Mutapetito',
    'ice-face':'Cara de Hielo','ice-scales':'Escamas de Hielo','intrepid-sword':'Espada Indómita','libero':'Líbero',
    'mirror-armor':'Coraza Reflejo','neutralizing-gas':'Gas Reactivo','pastel-veil':'Velo Pastel','perish-body':'Cuerpo Mortal',
    'power-spot':'Punto Potencia','propeller-tail':'Hélice Caudal','punk-rock':'Música Punk','quick-draw':'Mano Rápida',
    'ripen':'Maduración','sand-spit':'Escuparena','screen-cleaner':'Antibarrera','steam-engine':'Máquina de Vapor',
    'steely-spirit':'Alma Acerada','stalwart':'Acérrimo','unseen-fist':'Puño Invisible','wandering-spirit':'Alma Errante',

    // === GENERACIÓN 9 (Paldea) ===
    'angershell':'Coraza Ira','armor-tail':'Cola Armada','beads-of-ruin':'Cuentas Aniquiladoras','commander':'Comandante',
    'costar':'Copión','cud-chew':'Rumia','electromorphosis':'Electromorfosis','embody-aspect':'Encarnar Aspecto',
    'good-as-gold':'Oro Puro','guard-dog':'Perro Guardián','hadron-engine':'Motor de Hadrones','hospitality':'Hospitalidad',
    'mind\'s-eye':'Ojo Mental','mycelium-might':'Poder Micelio','opportunist':'Oportunista','orichalcum-pulse':'Latido Oricalco',
    'poison-puppeteer':'Marioneta Venenosa','protosynthesis':'Protosíntesis','purifying-salt':'Sal Purificadora','quark-drive':'Motor Cuark',
    'rocky-payload':'Transportarrocas','seed-sower':'Siembra','sharpness':'Cortante','supersweet-syrup':'Jarabe Dulce',
    'sword-of-ruin':'Espada Aniquiladora','tablets-of-ruin':'Tablas Aniquiladoras','tera-shift':'Teracambio','tera-shell':'Teracaparazón',
    'teraform-zero':'Teraforma Cero','thermal-exchange':'Termocambio','toxic-debris':'Escombros Tóxicos','vessel-of-ruin':'Poder Aniquilador',
    'well-baked-body':'Cuerpo Horneado','wind-power':'Energía Eólica','wind-rider':'Surcavientos','zero-to-hero':'De Cero a Héroe',
  };

  const getSpanishName = (englishName, type) => {
    if (type === 'move') return moveTranslations[englishName] || englishName;
    if (type === 'ability') return abilityTranslations[englishName] || englishName;
    return englishName;
  };

  const getEnglishName = (spanishName, type) => {
    if (type === 'move') {
      const entry = Object.entries(moveTranslations).find(([key, value]) => 
        normalizeText(value) === normalizeText(spanishName)
      );
      return entry ? entry[0] : spanishName;
    } else if (type === 'ability') {
      const entry = Object.entries(abilityTranslations).find(([key, value]) => 
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

        const [pokemonData, movesData, abilitiesData] = await Promise.all([
          loadAllPages('pokemon', 2000),
          loadAllPages('move', 1000),
          loadAllPages('ability', 1000)
        ]);

        // Cargar Pokémon con sprites
        const pokemonWithSprites = await Promise.all(
          pokemonData.map(async (pokemon) => {
            try {
              const response = await fetch(pokemon.url);
              const data = await response.json();
              const speciesResponse = await fetch(data.species.url);
              const speciesData = await speciesResponse.json();
              const spanishName = speciesData.names.find(name => name.language.name === 'es');
              
              return {
                name: spanishName?.name || pokemon.name,
                englishName: pokemon.name,
                id: data.id,
                type: 'pokemon',
                sprite: data.sprites.front_default || data.sprites.other['official-artwork']?.front_default
              };
            } catch (error) {
              return {
                name: pokemon.name,
                englishName: pokemon.name,
                id: pokemon.url.split('/').filter(Boolean).pop(),
                type: 'pokemon',
                sprite: null
              };
            }
          })
        );

        // Cargar movimientos con información para sugerencias
        const movesWithDetails = await Promise.all(
          movesData.map(async (move) => {
            try {
              const response = await fetch(move.url);
              const data = await response.json();
              const spanishName = getSpanishName(data.name, 'move');
              
              return {
                name: spanishName,
                englishName: data.name,
                id: data.id,
                type: 'move',
                typeName: data.type.name,
                sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/${data.type.name}.png`
              };
            } catch (error) {
              return {
                name: getSpanishName(move.name, 'move'),
                englishName: move.name,
                id: move.url.split('/').filter(Boolean).pop(),
                type: 'move',
                typeName: 'unknown',
                sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/unknown.png`
              };
            }
          })
        );

        // Cargar habilidades con información para sugerencias
        const abilitiesWithDetails = await Promise.all(
          abilitiesData.map(async (ability) => {
            try {
              const response = await fetch(ability.url);
              const data = await response.json();
              const spanishName = data.names.find(name => name.language.name === 'es')?.name || getSpanishName(data.name, 'ability');
              
              return {
                name: spanishName,
                englishName: data.name,
                id: data.id,
                type: 'ability',
                sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ability-capsule.png`
              };
            } catch (error) {
              return {
                name: getSpanishName(ability.name, 'ability'),
                englishName: ability.name,
                id: ability.url.split('/').filter(Boolean).pop(),
                type: 'ability',
                sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ability-capsule.png`
              };
            }
          })
        );

        setAllData({
          pokemon: pokemonWithSprites.filter(p => p.name),
          moves: movesWithDetails.filter(m => m.name),
          abilities: abilitiesWithDetails.filter(a => a.name)
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
      
      if (!response.ok) throw new Error(`${type === 'pokemon' ? 'Pokémon' : type === 'move' ? 'Movimiento' : 'Habilidad'} no encontrado`);

      const data = await response.json();
      
      switch (type) {
        case 'pokemon': await handlePokemonData(data); break;
        case 'move': await handleMoveData(data); break;
        case 'ability': await handleAbilityData(data); break;
      }
      
    } catch (error) {
      console.error('❌ Error en búsqueda:', error);
      setError(error.message);
      setSelectedPokemon(null);
      setSelectedMove(null);
      setSelectedAbility(null);
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
      setSelectedAbility(null);
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
      setSelectedAbility(null);
    } catch (error) {
      console.error('❌ Error procesando movimiento:', error);
      throw error;
    }
  };

  const handleAbilityData = async (data) => {
    try {
      const spanishName = data.names.find(name => name.language.name === 'es')?.name || getSpanishName(data.name, 'ability');
      const spanishEntry = data.flavor_text_entries.find(entry => entry.language.name === 'es');
      const spanishEffect = data.effect_entries.find(entry => entry.language.name === 'es')?.effect || 
                           data.effect_entries.find(entry => entry.language.name === 'en')?.effect ||
                           'Efecto no disponible';
      
      // Obtener Pokémon que tienen esta habilidad
      const pokemonWithAbility = data.pokemon.slice(0, 10).map(p => p.pokemon.name);
      
      // Obtener generación de introducción
      const generation = data.generation?.name ? 
        data.generation.name.replace('generation-', '').toUpperCase() : 'Desconocida';

      const abilityInfo = {
        name: spanishName,
        englishName: data.name,
        description: spanishEntry?.flavor_text || 'Descripción no disponible',
        effect: spanishEffect,
        generation: generation,
        pokemon: pokemonWithAbility,
        isMainSeries: data.is_main_series
      };
      
      setSelectedAbility(abilityInfo);
      setSelectedPokemon(null);
      setSelectedMove(null);
    } catch (error) {
      console.error('❌ Error procesando habilidad:', error);
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
    setSelectedAbility(null);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-purple-400 border-b border-purple-400/50 pb-3 md:pb-4">
        📚 Pokédex - Información Completa
      </h2>

      <div className="bg-white/10 p-4 md:p-6 rounded-xl shadow-lg">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-stretch">
            <div className="flex gap-2 flex-wrap justify-center md:justify-start">
              <button type="button" onClick={() => handleSearchTypeChange('pokemon')} className={`px-3 py-2 md:px-4 md:py-2 rounded-lg font-bold transition duration-300 text-sm md:text-base ${searchType === 'pokemon' ? 'bg-purple-600 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}>Pokémon</button>
              <button type="button" onClick={() => handleSearchTypeChange('move')} className={`px-3 py-2 md:px-4 md:py-2 rounded-lg font-bold transition duration-300 text-sm md:text-base ${searchType === 'move' ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}>Movimientos</button>
              <button type="button" onClick={() => handleSearchTypeChange('ability')} className={`px-3 py-2 md:px-4 md:py-2 rounded-lg font-bold transition duration-300 text-sm md:text-base ${searchType === 'ability' ? 'bg-green-600 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}>Habilidades</button>
            </div>

            <div className="flex-grow relative min-w-0">
              <input 
                type="text" 
                value={searchTerm} 
                onChange={handleInputChange} 
                placeholder={
                  searchType === 'pokemon' ? 'Buscar Pokémon... (Ej: Pikachu, Charizard)' : 
                  searchType === 'move' ? 'Buscar movimiento... (Ej: Lanzallamas, Rayo)' : 
                  'Buscar habilidad... (Ej: Potencia, Intimidación)'
                } 
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm md:text-base" 
              />
              
              {/* SUGERENCIAS CON IMÁGENES - FUNCIONA PARA TODOS LOS TIPOS */}
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-gray-800 border border-white/20 rounded-lg mt-1 z-20 max-h-60 overflow-y-auto shadow-2xl">
                  {suggestions.map((suggestion, index) => (
                    <button 
                      key={index} 
                      type="button" 
                      onClick={() => handleSuggestionClick(suggestion)} 
                      className="w-full text-left p-3 hover:bg-white/10 transition duration-200 flex items-center gap-3 text-white/80 hover:text-white border-b border-white/5 last:border-b-0"
                    >
                      {/* IMAGEN DE LA SUGERENCIA */}
                      <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center">
                        {suggestion.sprite ? (
                          <img 
                            src={suggestion.sprite} 
                            alt={suggestion.name}
                            className="w-6 h-6 md:w-8 md:h-8 object-contain"
                          />
                        ) : null}
                      </div>
                      
                      {/* INFORMACIÓN DE LA SUGERENCIA */}
                      <div className="flex flex-col items-start flex-grow min-w-0">
                        <span className="font-medium text-sm md:text-base truncate w-full">{suggestion.name}</span>
                        {suggestion.name !== suggestion.englishName && (
                          <span className="text-white/50 text-xs">{suggestion.englishName}</span>
                        )}
                      </div>
                      
                      {/* TIPO PARA MOVIMIENTOS */}
                      {suggestion.type === 'move' && suggestion.typeName && (
                        <div className="flex-shrink-0">
                          <span className={`px-2 py-1 rounded-full text-xs text-white font-bold ${typeColors[suggestion.typeName]?.bg || 'bg-gray-500'}`}>
                            {typeColors[suggestion.typeName]?.name || suggestion.typeName}
                          </span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={isLoading || !searchTerm.trim()} 
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 md:px-6 rounded-lg transition duration-300 flex items-center justify-center gap-2 whitespace-nowrap text-sm md:text-base w-full md:w-auto"
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
            <p className="text-red-400 text-sm md:text-base">❌ {error}</p>
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
        ) : selectedAbility ? (
          <AbilityInfo ability={selectedAbility} />
        ) : (
          <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-bold text-white/70 mb-2">Pokédex Completa</h3>
            <p className="text-white/50 mb-6">Busca información detallada sobre Pokémon, movimientos y habilidades.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 text-left max-w-4xl mx-auto">
              <div className="bg-purple-900/30 p-4 rounded-lg">
                <h4 className="font-bold text-purple-300 mb-2">🔍 Pokémon</h4>
                <p className="text-white/70 text-sm">Estadísticas, tipos, habilidades y más</p>
              </div>
              <div className="bg-blue-900/30 p-4 rounded-lg">
                <h4 className="font-bold text-blue-300 mb-2">⚡ Movimientos</h4>
                <p className="text-white/70 text-sm">Poder, precisión, PP y efectos</p>
              </div>
              <div className="bg-green-900/30 p-4 rounded-lg">
                <h4 className="font-bold text-green-300 mb-2">🌟 Habilidades</h4>
                <p className="text-white/70 text-sm">Efectos, Pokémon que las tienen y generación</p>
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
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-white">{pokemon.name}</h3>
            <p className="text-white/80 text-sm md:text-base">#{String(pokemon.id).padStart(3, '0')}</p>
          </div>
          <div className="flex gap-2 mt-2 md:mt-0 flex-wrap">
            {pokemon.types.map(type => (
              <span key={type.name} className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-white font-bold capitalize text-sm md:text-base ${typeColors[type.name].bg}`}>
                {type.spanishName}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
          <div className="space-y-4">
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <img src={pokemon.sprites.official || pokemon.sprites.front} alt={pokemon.name} className="w-32 h-32 md:w-48 md:h-48 mx-auto object-contain" />
              <p className="text-white/70 mt-2 text-sm md:text-base">Ilustración Oficial</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/5 rounded-lg p-2 md:p-3 text-center">
                <img src={pokemon.sprites.front} alt={`${pokemon.name} frontal`} className="w-16 h-16 md:w-20 md:h-20 mx-auto object-contain" />
                <p className="text-white/70 text-xs md:text-sm mt-1">Frontal</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2 md:p-3 text-center">
                <img src={pokemon.sprites.back} alt={`${pokemon.name} trasero`} className="w-16 h-16 md:w-20 md:h-20 mx-auto object-contain" />
                <p className="text-white/70 text-xs md:text-sm mt-1">Trasero</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="font-bold text-purple-300 mb-3 text-lg">📊 Estadísticas Base</h4>
              {pokemon.stats.map(stat => (
                <div key={stat.name} className="flex justify-between items-center mb-2">
                  <span className="text-white/80 text-sm md:text-base">{stat.spanishName}:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-sm md:text-base">{stat.value}</span>
                    <div className="w-16 md:w-24 bg-white/10 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(stat.value, 150) / 150 * 100}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/10">
                <span className="text-white/80 font-bold text-sm md:text-base">Total:</span>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400 font-bold text-lg">{pokemon.totalStats}</span>
                  <div className="w-16 md:w-24 bg-white/10 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${Math.min(pokemon.totalStats, 600) / 600 * 100}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="font-bold text-purple-300 mb-3 text-lg">📏 Características</h4>
              <div className="flex justify-between mb-2">
                <span className="text-white/80 text-sm md:text-base">Altura:</span>
                <span className="text-white font-bold text-sm md:text-base">{pokemon.height} m</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-white/80 text-sm md:text-base">Peso:</span>
                <span className="text-white font-bold text-sm md:text-base">{pokemon.weight} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/80 text-sm md:text-base">Experiencia Base:</span>
                <span className="text-yellow-400 font-bold text-sm md:text-base">{pokemon.baseExperience}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="font-bold text-purple-300 mb-3 text-lg">🌟 Habilidades</h4>
              {pokemon.abilities.map(ability => (
                <div key={ability.englishName} className="mb-3 last:mb-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-white capitalize text-sm md:text-base">{ability.name}</span>
                    {ability.isHidden && (
                      <span className="text-yellow-400 text-xs md:text-sm bg-yellow-900/30 px-2 py-1 rounded-full">Oculta</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="font-bold text-purple-300 mb-3 text-lg">📖 Descripción</h4>
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
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-white">{move.name}</h3>
            <p className="text-white/80 text-sm md:text-base">Movimiento</p>
          </div>
          <div className="flex gap-2 mt-2 md:mt-0 flex-wrap">
            <span className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-white font-bold capitalize text-sm md:text-base ${typeColors[move.type.name].bg}`}>
              {move.type.spanishName}
            </span>
            <span className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-white font-bold capitalize text-sm md:text-base ${move.damageClass.name === 'physical' ? 'bg-red-500' : move.damageClass.name === 'special' ? 'bg-blue-500' : 'bg-gray-500'}`}>
              {move.damageClass.spanishName}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-4">
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="font-bold text-blue-300 mb-3 text-lg">⚡ Estadísticas</h4>
              <div className="grid grid-cols-2 gap-2 md:gap-4">
                <div className="text-center p-3 bg-blue-900/30 rounded-lg">
                  <div className="text-xl md:text-2xl font-bold text-white">{move.power || '—'}</div>
                  <div className="text-blue-300 text-sm">Poder</div>
                </div>
                <div className="text-center p-3 bg-blue-900/30 rounded-lg">
                  <div className="text-xl md:text-2xl font-bold text-white">{move.accuracy || '—'}</div>
                  <div className="text-blue-300 text-sm">Precisión</div>
                </div>
                <div className="text-center p-3 bg-blue-900/30 rounded-lg">
                  <div className="text-xl md:text-2xl font-bold text-white">{move.pp}</div>
                  <div className="text-blue-300 text-sm">PP</div>
                </div>
                <div className="text-center p-3 bg-blue-900/30 rounded-lg">
                  <div className="text-xl md:text-2xl font-bold text-white">{move.priority}</div>
                  <div className="text-blue-300 text-sm">Prioridad</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="font-bold text-blue-300 mb-3 text-lg">📖 Descripción</h4>
              <p className="text-white/80 text-sm leading-relaxed">{move.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AbilityInfo({ ability }) {
  return (
    <div className="bg-white/10 rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-white">{ability.name}</h3>
            <p className="text-white/80 text-sm md:text-base">Habilidad</p>
          </div>
          <div className="flex gap-2 mt-2 md:mt-0">
            <span className="px-2 py-1 md:px-3 md:py-1 bg-green-500 rounded-full text-white font-bold text-sm md:text-base">
              Gen {ability.generation}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-4">
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="font-bold text-green-300 mb-3 text-lg">📖 Descripción</h4>
              <p className="text-white/80 text-sm leading-relaxed">{ability.description}</p>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="font-bold text-green-300 mb-3 text-lg">⚡ Efecto</h4>
              <p className="text-white/80 text-sm leading-relaxed">{ability.effect}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="font-bold text-green-300 mb-3 text-lg">🎯 Pokémon con esta habilidad</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ability.pokemon.slice(0, 8).map((pokemon, index) => (
                  <div key={index} className="bg-green-900/30 rounded-lg p-2 text-center">
                    <span className="text-white capitalize text-sm">{pokemon}</span>
                  </div>
                ))}
              </div>
              {ability.pokemon.length > 8 && (
                <p className="text-white/50 text-sm mt-2">
                  Y {ability.pokemon.length - 8} Pokémon más...
                </p>
              )}
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="font-bold text-green-300 mb-3 text-lg">ℹ️ Información Adicional</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/80 text-sm md:text-base">Nombre en inglés:</span>
                  <span className="text-white capitalize text-sm md:text-base">{ability.englishName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80 text-sm md:text-base">Generación:</span>
                  <span className="text-green-400 font-bold text-sm md:text-base">{ability.generation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80 text-sm md:text-base">Serie principal:</span>
                  <span className={ability.isMainSeries ? 'text-green-400' : 'text-yellow-400'}>
                    {ability.isMainSeries ? 'Sí' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}