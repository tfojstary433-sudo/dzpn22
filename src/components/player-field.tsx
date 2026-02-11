'use client';

import React from 'react';

interface PlayerFieldProps {
  position?: string;
  isReferee?: boolean;
}

const positionCoordinates: Record<string, { top: string; left: string; label: string }> = {
  'GK': { top: '85%', left: '50%', label: 'BR' },
  'CB': { top: '70%', left: '50%', label: 'ŚO' },
  'LB': { top: '70%', left: '20%', label: 'LO' },
  'RB': { top: '70%', left: '80%', label: 'PO' },
  'CDM': { top: '55%', left: '50%', label: 'DP' },
  'CM': { top: '45%', left: '50%', label: 'ŚP' },
  'CAM': { top: '35%', left: '50%', label: 'OP' },
  'LM': { top: '45%', left: '20%', label: 'LP' },
  'RM': { top: '45%', left: '80%', label: 'PP' },
  'LW': { top: '20%', left: '20%', label: 'LN' },
  'RW': { top: '20%', left: '80%', label: 'PN' },
  'ST': { top: '15%', left: '50%', label: 'N' },
  'CF': { top: '25%', left: '50%', label: 'ŚN' },
  // Additional positions for visual variety as seen in image
  'LS': { top: '25%', left: '15%', label: 'LS' },
  'PD': { top: '55%', left: '80%', label: 'PD' },
};

const generalMappings: Record<string, string> = {
  'Bramkarz': 'GK',
  'Obrońca': 'CB',
  'Pomocnik': 'CM',
  'Napastnik': 'ST',
  'BR': 'GK',
  'ŚO': 'CB',
  'LO': 'LB',
  'PO': 'RB',
  'DP': 'CDM',
  'ŚP': 'CM',
  'OP': 'CAM',
  'LP': 'LM',
  'PP': 'RM',
  'LN': 'LW',
  'PN': 'RW',
  'N': 'ST',
  'ŚN': 'CF',
};

export const PlayerField: React.FC<PlayerFieldProps> = ({ position = '', isReferee = false }) => {
  const normalizedPosition = String(position || '').trim().toUpperCase();
  
  if (isReferee || !normalizedPosition || normalizedPosition === '---' || normalizedPosition === 'BRAK') {
    // Pitch background only, no position marker
    return (
      <div className="relative w-full aspect-[3/4] bg-[#1a1a1a] rounded-[24px] border border-white/5 overflow-hidden p-3 shadow-2xl group/field">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover/field:opacity-100 transition-opacity duration-700" />
        
        <div className="relative w-full h-full border border-white/10 rounded-xl bg-white/[0.03] overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/2 left-0 w-full h-[1.5px] bg-white" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-[1.5px] border-white rounded-full flex items-center justify-center p-4">
              <img src="https://i.ibb.co/kVC8bKr1/LOGO-PFF.png" alt="" className="w-full h-auto opacity-80 brightness-110" />
            </div>
            
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[18%] border-[1.5px] border-t-0 border-white" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[30%] h-[7%] border-[1.5px] border-t-0 border-white" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-[18%] border-[1.5px] border-b-0 border-white" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[30%] h-[7%] border-[1.5px] border-b-0 border-white" />
            <div className="absolute top-[18%] left-1/2 -translate-x-1/2 w-16 h-8 border-[1.5px] border-t-0 border-white rounded-b-full" />
            <div className="absolute bottom-[18%] left-1/2 -translate-x-1/2 w-16 h-8 border-[1.5px] border-b-0 border-white rounded-t-full" />
          </div>
        </div>
      </div>
    );
  }

  let posKey = position.toUpperCase();
  if (!positionCoordinates[posKey]) {
    posKey = generalMappings[position] || generalMappings[posKey] || '';
  }

  const activePos = positionCoordinates[posKey];
  
  return (
    <div className="relative w-full aspect-[3/4] bg-[#1a1a1a] rounded-[24px] border border-white/5 overflow-hidden p-3 shadow-2xl group/field">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover/field:opacity-100 transition-opacity duration-700" />
      
      <div className="relative w-full h-full border border-white/10 rounded-xl bg-white/[0.03] overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/2 left-0 w-full h-[1.5px] bg-white" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-[1.5px] border-white rounded-full flex items-center justify-center p-4">
            <img src="https://i.ibb.co/kVC8bKr1/LOGO-PFF.png" alt="" className="w-full h-auto opacity-80 brightness-110" />
          </div>
          
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[18%] border-[1.5px] border-t-0 border-white" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[30%] h-[7%] border-[1.5px] border-t-0 border-white" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-[18%] border-[1.5px] border-b-0 border-white" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[30%] h-[7%] border-[1.5px] border-b-0 border-white" />
          <div className="absolute top-[18%] left-1/2 -translate-x-1/2 w-16 h-8 border-[1.5px] border-t-0 border-white rounded-b-full" />
          <div className="absolute bottom-[18%] left-1/2 -translate-x-1/2 w-16 h-8 border-[1.5px] border-b-0 border-white rounded-t-full" />
        </div>

        {activePos && (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 text-white font-black z-20 shadow-[0_0_50px_rgba(37,99,235,0.9),0_0_20px_rgba(37,99,235,1)] text-sm border-2 border-white/50 transform transition-transform hover:scale-110 duration-300 cursor-help"
            style={{ top: activePos.top, left: activePos.left }}
          >
            {activePos.label}
          </div>
        )}
      </div>
    </div>
  );
};
