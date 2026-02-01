import React from 'react';
import { Store as StoreIcon } from 'lucide-react';

const Store: React.FC = () => {
  return (
    <div className="h-[calc(100vh-12rem)] w-full flex items-center justify-center">
      <div className="w-full h-full border-2 border-dashed border-[#8B9DE4]/60 rounded-[32px] flex flex-col items-center justify-center space-y-5 animate-in fade-in zoom-in duration-500 bg-white/50 backdrop-blur-sm">
        <div className="w-24 h-24 bg-[#F2F2F7] rounded-[32px] flex items-center justify-center shadow-sm border border-black/5">
          <StoreIcon size={40} className="text-[#C7C7CC]" strokeWidth={2} />
        </div>
        <div className="text-center space-y-1.5">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-[#8E8E93]">Merchant Activities</h3>
          <p className="text-[10px] font-bold text-[#C7C7CC] tracking-wide">Coming Soon</p>
        </div>
      </div>
    </div>
  );
};

export default Store;