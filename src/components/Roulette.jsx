import React, { useState, useEffect, useCallback } from "react";
import "./Roulette.css";

const SEGMENTS = [
  { name: "Nada", color: "#22c55e", desc: "No ocurre nada especial." },
  { name: "Sin objetos", color: "#3b82f6", desc: "No puedes usar objetos en el próximo combate." },
  { name: "Sin pociones", color: "#ef4444", desc: "No puedes usar pociones hasta el siguiente gimnasio." },
  { name: "Ditto", color: "#a855f7", desc: "Copia el efecto de otro jugador." },
  { name: "+5000₽", color: "#eab308", desc: "Ganas 5000 Pokéyenes." },
  { name: "Nerfeada", color: "#f97316", desc: "Tu Pokémon más fuerte no puede pelear el próximo combate." },
  { name: "Anulacartas", color: "#ec4899", desc: "Escoge la carta que quieras anular." },
  { name: "Ataque a distancia", color: "#06b6d4", desc: "Tu Pokémon aprende un nuevo movimiento." },
  { name: "Potenciador", color: "#8b5cf6", desc: "Tu Pokémon obtiene un beneficio temporal." },
  { name: "Intercambio", color: "#ef4444", desc: "Intercambia un Pokémon con otro." },
  { name: "Poción extra", color: "#10b981", desc: "Obtienes 2 pociones adicionales." },
  { name: "Sin Pokéballs", color: "#2563eb", desc: "No puedes capturar Pokémon hasta el próximo gimnasio." }
];

const COOLDOWN = 24 * 60 * 60 * 1000;

function formatTime(ms) {
  if (!ms || ms <= 0) return "00:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
}

// 🔑 MODIFICADO: Recibir la función onResult
export default function Roulette({ onResult }) {
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    const updateCountdown = () => {
      const lastSpin = localStorage.getItem("lastSpinTime");
      if (!lastSpin) return setTimeRemaining(0);
      const remaining = +lastSpin + COOLDOWN - Date.now();
      setTimeRemaining(remaining > 0 ? remaining : 0);
      if (remaining <= 0) localStorage.removeItem("lastSpinTime");
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const spin = () => {
    if (spinning || timeRemaining > 0) return;

    setSpinning(true);
    setResult(null);

    localStorage.setItem("lastSpinTime", Date.now().toString());

    const segmentAngle = 360 / SEGMENTS.length;
    const randomIndex = Math.floor(Math.random() * SEGMENTS.length);
    const extraSpins = 6;
    const targetRotation = 360 * extraSpins + (360 - randomIndex * segmentAngle - segmentAngle / 2);

    setAngle(prev => prev + targetRotation);

    setTimeout(() => {
      setSpinning(false);
      const finalResult = SEGMENTS[randomIndex]; // Capturar el resultado
      setResult(finalResult);
      
      // 🔑 LLAMAR A LA FUNCIÓN DEL PADRE
      if (onResult) {
          onResult(finalResult);
      }
    }, 4500);
  };

  return (
    <div className="roulette-page">
      <h1>Rueda de la Fortuna</h1>

      {timeRemaining > 0 && (
        <div className="cooldown">Próximo giro en: {formatTime(timeRemaining)}</div>
      )}

      <div className="wheel-wrapper">
        <svg viewBox="0 0 300 300" className="wheel" style={{ transform: `rotate(${angle}deg)`, transition: spinning ? "transform 4.5s cubic-bezier(0.2,0.8,0.2,1)" : "none" }}>
          {SEGMENTS.map((seg, i) => {
            const segmentAngle = 360 / SEGMENTS.length;
            const startAngle = (segmentAngle*i-90)*Math.PI/180;
            const endAngle = (segmentAngle*(i+1)-90)*Math.PI/180;
            const midAngle = (startAngle+endAngle)/2;

            const radius = 140;
            const x1 = 150 + radius * Math.cos(startAngle);
            const y1 = 150 + radius * Math.sin(startAngle);
            const x2 = 150 + radius * Math.cos(endAngle);
            const y2 = 150 + radius * Math.sin(endAngle);

            const textRadius = 95; 
            const textX = 150 + textRadius * Math.cos(midAngle);
            const textY = 150 + textRadius * Math.sin(midAngle);
            let textRotation = midAngle * 180 / Math.PI;

            return (
              <g key={i}>
                <path d={`M150 150 L${x1} ${y1} A140 140 0 0 1 ${x2} ${y2} Z`} fill={seg.color} stroke="#fff" strokeWidth="2"/>
                <text
                  x={textX}
                  y={textY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${textRotation},${textX},${textY})`}
                  style={{ fill: "white", fontWeight: "bold", fontSize: "11px" }}
                >
                  {seg.name}
                </text>
              </g>
            );
          })}
          <circle cx="150" cy="150" r="30" fill="rgba(255,255,255,0.2)" />
        </svg>

        <div className="arrow"></div>

        <button onClick={spin} disabled={spinning || timeRemaining > 0} className="spin-btn">
          {spinning ? "Girando..." : timeRemaining > 0 ? "ESPERA" : "¡GIRA!"}
        </button>
      </div>

      {result && (
        <div className="result" style={{ borderColor: result.color }}>
          <h2>{result.name}</h2>
          <p>{result.desc}</p>
        </div>
      )}
    </div>
  );
}





