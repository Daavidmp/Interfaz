import React from "react";

export default function CardDisplay({ card, isActive }) {
  if (!card) return null;
  return (
    <div className={`card-3d ${isActive ? 'scale-105' : ''}`}>
      <div className="inner">
        {/* Usamos un div envoltorio para centrar bien la imagen si es pequeña */}
        <div className="w-full flex justify-center h-32"> 
            <img src={card.image} className="w-32 h-32 object-contain mt-4" alt={card.name}/>
        </div>
        <div className="mt-auto text-center text-white p-3">
          <div className="font-bold">{card.name}</div>
          <div className="text-sm text-white/70">Poder: {card.power ?? '—'}</div>
        </div>
      </div>
    </div>
  );
}

