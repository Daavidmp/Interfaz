import React from 'react';
import './CardDisplay.css';

const CardDisplay = ({ symbol = "♠", design = "default", title = "CARD", rarity = "common" }) => {
    const getCardClass = () => {
        return `card-display ${design} rarity-${rarity}`;
    };

    const getSymbolColor = () => {
        switch(rarity) {
            case 'common': return '#666';
            case 'rare': return '#007bff';
            case 'epic': return '#6f42c1';
            case 'legendary': return '#fd7e14';
            default: return '#333';
        }
    };

    return (
        <div className={getCardClass()}>
            <div className="card-border">
                <div className="card-corner top-left">{symbol}</div>
                <div className="card-corner top-right">{symbol}</div>
                
                <div className="card-center">
                    <div 
                        className="card-symbol"
                        style={{ color: getSymbolColor() }}
                    >
                        {symbol}
                    </div>
                    <div className="card-title">{title}</div>
                </div>
                
                <div className="card-corner bottom-left">{symbol}</div>
                <div className="card-corner bottom-right">{symbol}</div>
            </div>
            
            <div className="card-glow"></div>
        </div>
    );
};

export default CardDisplay;

