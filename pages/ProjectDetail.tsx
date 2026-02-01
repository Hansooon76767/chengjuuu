import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  MapPin, ArrowLeft, MoreHorizontal, Send, Users, ShieldCheck, 
  Calendar, Clock, Share, ExternalLink, Sparkles, Navigation,
  ScanLine, Layers, History, ChevronRight, Star,
  Receipt, Wallet, CreditCard, Gift
} from 'lucide-react';
import { CostType, Project } from '../types';

const StarRating = ({ score, size = 24 }: { score: number, size?: number }) => {
  const rating = (score / 100) * 5;
  return (
    <div className="flex items-center space-x-1.5">
      {[...Array(5)].map((_, i) => {
        const fillAmount = Math.max(0, Math.min(1, rating - i));
        return (
          <div key={i} className="relative" style={{ width: size, height: size }}>
            <Star size={size} className="text-white/20 absolute inset-0" strokeWidth={2.5} />
            <div className="absolute inset-0 overflow-hidden" style={{ width: `${fillAmount * 100}%` }}>
              <Star size={size} fill="#FACC15" className="text-accent" strokeWidth={2.5} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const BillSection = ({ project, t }: { project: Project, t: any }) => {
  const COLORS = ['#FACC15', '#000000', '#9CA3AF', '#60A5FA', '#F87171'];

  const splitResult = useMemo(() => {
    if (project.costType !== CostType.SMART_SPLIT || !project.smartBill) return null;

    const totalCents = Math.round(project.smartBill.totalAmount * 100);
    const groups = project.smartBill.groups;
    
    let totalWeightedPopulation = 0;
    groups.forEach(g => {
      totalWeightedPopulation += g.count * (g.ratio || 0);
    });

    if (totalWeightedPopulation === 0 || totalCents === 0) return null;

    // Distribute Total
    const tempAllocations = groups.map(g => {
        const weightPop = g.count * (g.ratio || 0);
        const idealShare = (totalCents * weightPop) / totalWeightedPopulation;
        const integerShare = Math.floor(idealShare);
        return {
            id: g.id,
            name: g.name,
            count: g.count,
            integerShare,
            decimalPart: idealShare - integerShare
        };
    });

    // Handle Remainder
    const integerSum = tempAllocations.reduce((sum, t) => sum + t.integerShare, 0);
    let remainder = totalCents - integerSum;
    const sorted = [...tempAllocations].sort((a, b) => b.decimalPart - a.decimalPart);
    const extras = new Map<string, number>();
    for (let i = 0; i < remainder; i++) {
        const item = sorted[i % sorted.length];
        extras.set(item.id, (extras.get(item.id) || 0) + 1);
    }

    return tempAllocations.map(t => {
        const extra = extras.get(t.id) || 0;
        const groupTotalCents = t.integerShare + extra;
        const perPerson = t.count > 0 ? (groupTotalCents / 100) / t.count : 0;
        return {
          id: t.id,
          name: t.name,
          count: t.count,
          perPerson
        };
    });
  }, [project]);

  if (project.costType === CostType.SMART_SPLIT && splitResult) {
    return (
      <div className="pt-2">
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">{t.detail.labels.bill}</h3>
        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-black/5 shadow-sm space-y-4">
           <div className="flex justify-between items-center pb-3 border-b border-black/5">
              <div className="flex items-center space-x-2">
                 <div className="p-1.5 bg-black text-accent rounded-lg"><Receipt size={14} /></div>
                 <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block">{t.detail.bill.smart}</span>
                    <span className="text-xs font-bold text-zinc-800">{t.detail.bill.smartDesc}</span>
                 </div>
              </div>
              <div className="text-right">
                 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block">{t.detail.bill.total}</span>
                 <span className="text-lg font-black text-zinc-900">¥ {project.smartBill?.totalAmount.toFixed(0)}</span>
              </div>
           </div>
           
           <div className="space-y-2">
             {splitResult.map((group, idx) => (
                <div key={group.id} className="flex items-center justify-between">
                   <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                      <span className="text-xs font-bold text-zinc-700">{group.name}</span>
                      <span className="text-[10px] font-medium text-zinc-400">x{group.count}</span>
                   </div>
                   <div className="flex items-center space-x-1">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase">{t.detail.bill.perPerson}</span>
                      <span className="text-sm font-black text-zinc-900">¥ {group.perPerson.toFixed(1)}</span>
                   </div>
                </div>
             ))}
           </div>
        </div>
      </div>
    );
  }

  // CostType.AA
  if (project.costType === CostType.AA) {
     return (
       <div className="pt-2">
         <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">{t.detail.labels.bill}</h3>
         <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-black/5 shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-3">
               <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <Wallet size={20} strokeWidth={2} />
               </div>
               <div>
                  <h4 className="text-sm font-black text-zinc-900">{t.detail.bill.aa}</h4>
                  <p className="text-xs font-medium text-zinc-500">{t.detail.bill.aaDesc}</p>
               </div>
            </div>
            <div className="px-3 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-lg uppercase tracking-wider">
               AA Mode
            </div>
         </div>
       </div>
     )
  }

  // CostType.TREATER
  if (project.costType === CostType.TREATER) {
    return (
      <div className="pt-2">
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">{t.detail.labels.bill}</h3>
        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-black/5 shadow-sm flex items-center justify-between">
           <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                 <Gift size={20} strokeWidth={2} />
              </div>
              <div>
                 <h4 className="text-sm font-black text-zinc-900">{t.detail.bill.treat}</h4>
                 <p className="text-xs font-medium text-zinc-500">{t.detail.bill.treatDesc}</p>
              </div>
           </div>
           <div className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-lg uppercase tracking-wider">
              Host Pays
           </div>
        </div>
      </div>
    )
 }

 // CostType.FREE
 if (project.costType === CostType.FREE) {
  return (
    <div className="pt-2">
      <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">{t.detail.labels.bill}</h3>
      <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-black/5 shadow-sm flex items-center justify-between">
         <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
               <Sparkles size={20} strokeWidth={2} />
            </div>
            <div>
               <h4 className="text-sm font-black text-zinc-900">{t.detail.bill.free}</h4>
               <p className="text-xs font-medium text-zinc-500">{t.detail.bill.freeDesc}</p>
            </div>
         </div>
      </div>
    </div>
  )
}

 return null;
};

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, currentUser, joinProject, sendMessage, t, getUser } = useApp();
  const [msgInput, setMsgInput] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserCardOpen, setIsUserCardOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const project = projects.find(p => p.id === id);
  if (!project) return null;

  const isParticipant = project.participants.some(u => u.id === currentUser.id);
  const isHost = project.hostId === currentUser.id;
  const hostUser = getUser(project.hostId);
  
  // Status Logic
  const isFull = project.currentPeople >= project.maxPeople;
  const isNearFull = !isFull && project.currentPeople >= project.maxPeople * 0.8;
  const statusLabel = isFull ? t.detail.status.full : isNearFull ? t.detail.status.near : t.detail.status.open;
  
  // Status colors optimized for light theme
  const statusColor = isFull ? 'bg-red-50 text-red-600' : isNearFull ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600';

  // Format Date Logic (Simple parser for the mock string)
  const dateParts = project.time.split(' '); // e.g., "本周五 20:00" or "10-24 周五 19:00"
  const displayTime = dateParts.length > 1 ? dateParts[dateParts.length - 1] : project.time;
  const displayDate = dateParts.length > 1 ? dateParts.slice(0, dateParts.length - 1).join(' ') : t.detail.labels.upcoming;

  // Handle click outside for menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openMap = () => {
    const query = encodeURIComponent(`${project.city} ${project.location}`);
    window.open(`https://www.amap.com/search?query=${query}`, '_blank');
  };

  const handleEdit = () => {
    setIsMenuOpen(false);
    navigate('/create', { state: { editProject: project } });
  };

  return (
    // Immersive Overlay: Glass Theme
    <div className="fixed inset-0 z-[200] bg-white text-zinc-900 overflow-y-auto no-scrollbar">
      
      {/* Ambient Background Glow - Vivid Glass Effect */}
      {project.coverImage && (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          {/* The Source Image - Increased opacity for vivid color */}
          <img 
            src={project.coverImage} 
            className="absolute inset-0 w-full h-full object-cover scale-125 blur-[70px] opacity-80"
            alt="Ambient Background" 
          />
          
          {/* Reduced overlay opacity to let more color pop through */}
          <div className="absolute inset-0 bg-white/20 backdrop-blur-[50px]" />
          
          {/* Gradient to ensure bottom text readability, but lighter at top */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-white" />
        </div>
      )}

      <div className="relative z-10 w-full max-w-md mx-auto min-h-screen flex flex-col pb-32">
        
        {/* Navigation Bar */}
        <div className="sticky top-0 z-50 flex items-center justify-between px-6 py-6">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 rounded-full bg-white/40 backdrop-blur-xl flex items-center justify-center hover:bg-white transition-all active:scale-95 border border-white/20 shadow-sm"
          >
            <ArrowLeft size={18} strokeWidth={2.5} className="text-zinc-800" />
          </button>
          
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-10 h-10 rounded-full bg-white/40 backdrop-blur-xl flex items-center justify-center hover:bg-white transition-all active:scale-95 border border-white/20 shadow-sm"
            >
              <MoreHorizontal size={18} strokeWidth={2.5} className="text-zinc-800" />
            </button>
             {/* Menu Dropdown */}
             {isMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-premium-lg p-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                {isHost && (
                  <button onClick={handleEdit} className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-black/5 text-sm font-medium transition-colors text-zinc-700">
                    <Sparkles size={14} /> <span>{t.detail.actions.edit}</span>
                  </button>
                )}
                <button className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-black/5 text-sm font-medium transition-colors text-zinc-700">
                  <Share size={14} /> <span>{t.detail.actions.share}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Poster Artwork */}
        <div className="px-6 mt-2 mb-8">
          <div className="aspect-square w-full rounded-[32px] overflow-hidden shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15)] border border-white/20 relative group bg-white/50">
            {project.coverImage ? (
              <img src={project.coverImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Poster" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
                 <span className="text-6xl mb-4">{project.category === '酒局' ? '🍹' : project.category === '运动' ? '🚴' : '✨'}</span>
                 <span className="text-zinc-400 font-bold uppercase tracking-widest text-xs">{project.category}</span>
              </div>
            )}
            
            {/* Floating Category Tag */}
            <div className="absolute top-4 left-4 px-3 py-1.5 bg-white/60 backdrop-blur-md rounded-full border border-white/20 shadow-sm">
               <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-900">{project.category}</span>
            </div>
          </div>
        </div>

        {/* Event Details */}
        <div className="px-6 space-y-8 animate-in slide-in-from-bottom-8 duration-700">
          
          {/* Title & Host */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-zinc-900 mix-blend-hard-light">{project.title}</h1>
            
            <div className="flex items-center justify-between">
               {/* Host Pill */}
               <div 
                 onClick={(e) => {
                   e.stopPropagation();
                   setIsUserCardOpen(true);
                 }}
                 className="flex items-center space-x-2 bg-white/40 backdrop-blur-md rounded-full pl-1 pr-3 py-1 border border-white/20 w-fit shadow-sm cursor-pointer hover:bg-white/60 transition-colors group"
               >
                  <img src={project.hostAvatar} className="w-6 h-6 rounded-full object-cover group-hover:scale-105 transition-transform" alt="Host" />
                  <span className="text-xs font-medium text-zinc-800 group-hover:text-black transition-colors">{t.detail.organizer} {project.hostName}</span>
               </div>
               <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md ${statusColor} bg-opacity-80 backdrop-blur-sm`}>
                  {statusLabel}
               </span>
            </div>
          </div>

          {/* Info Grid */}
          <div className="space-y-5">
            {/* Date */}
            <div className="flex items-start space-x-4">
               <div className="w-10 h-10 rounded-xl bg-white/50 backdrop-blur-sm flex items-center justify-center border border-white/20 shrink-0 shadow-sm">
                  <Calendar size={18} className="text-zinc-700" />
               </div>
               <div>
                  <h3 className="text-sm font-bold text-zinc-900 mb-0.5">{displayDate}</h3>
                  <p className="text-xs text-zinc-600 font-medium">{displayTime}</p>
               </div>
            </div>

            {/* Optimized Location Section */}
            <div className="space-y-3">
               <div className="flex items-center justify-between px-1">
                  <div className="flex items-center space-x-2">
                     <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                        <MapPin size={12} />
                     </div>
                     <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">{t.detail.location}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-zinc-400">
                     <span className="text-[10px] font-bold">{project.city}</span>
                  </div>
               </div>

               <div 
                  onClick={openMap}
                  className="group relative w-full aspect-[2/1] bg-zinc-100 rounded-[28px] overflow-hidden border border-white/40 shadow-sm cursor-pointer"
               >
                  {/* Map Image - Use a schematic looking map if possible, or just the satellite one */}
                  <img 
                    src="https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&q=80&w=1000" 
                    className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 scale-105 group-hover:scale-110"
                    alt="Map"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90"></div>

                  {/* Center Navigation Button */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="relative group-hover:scale-110 transition-transform duration-300">
                          <div className="absolute -inset-4 bg-accent/20 rounded-full animate-[ping_2s_ease-in-out_infinite]"></div>
                          <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(250,204,21,0.4)] border-2 border-white text-black z-10">
                              <Navigation size={20} fill="currentColor" className="ml-0.5 mt-0.5" />
                          </div>
                      </div>
                  </div>

                  {/* Address Label */}
                  <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-start justify-between">
                          <div className="flex-1 pr-4">
                              <h3 className="text-white text-base font-bold leading-tight drop-shadow-lg">{project.location}</h3>
                              <p className="text-white/60 text-[10px] font-medium mt-1 uppercase tracking-wider">Tap to Navigate</p>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-white group-hover:bg-white group-hover:text-black transition-all">
                              <ExternalLink size={14} />
                          </div>
                      </div>
                  </div>
               </div>
            </div>

             {/* Description */}
            <div className="pt-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">{t.detail.labels.about}</h3>
              <p className="text-sm text-zinc-800 leading-relaxed font-medium">{project.description}</p>
            </div>
          </div>
          
          {/* Bill / Cost Section */}
          <BillSection project={project} t={t} />

          {/* Community / Chat Teaser */}
          <div className="pt-6 border-t border-black/5">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">{t.detail.labels.community}</h3>
                <div className="flex items-center space-x-1">
                   <Users size={12} className="text-zinc-500" />
                   <span className="text-xs font-bold text-zinc-500">{project.currentPeople} / {project.maxPeople}</span>
                </div>
             </div>
             
             {/* Chat Box */}
             <div className="bg-white/40 backdrop-blur-md rounded-2xl p-4 border border-white/30 shadow-sm space-y-3">
                {project.chatMessages.length > 0 ? (
                  <div className="space-y-3 max-h-40 overflow-hidden relative">
                    {project.chatMessages.slice(-2).map(m => (
                       <div key={m.id} className="flex items-start space-x-2">
                          <div className="w-5 h-5 rounded-full bg-white/60 flex items-center justify-center text-[8px] font-bold text-zinc-600 shrink-0">
                             {m.authorName[0]}
                          </div>
                          <div>
                             <p className="text-[10px] font-bold text-zinc-800 mb-0.5">{m.authorName}</p>
                             <p className="text-xs text-zinc-700">{m.content}</p>
                          </div>
                       </div>
                    ))}
                    <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white/40 to-transparent"></div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-zinc-500 text-xs italic">
                     {t.detail.labels.joinTip}
                  </div>
                )}
                
                {isParticipant && (
                   <button 
                     onClick={() => { /* Scroll to full chat or open modal */ }}
                     className="w-full py-2 bg-white hover:bg-white/80 rounded-xl text-xs font-bold text-zinc-800 border border-white/20 shadow-sm transition-all"
                   >
                     {t.detail.actions.chat}
                   </button>
                )}
             </div>
          </div>
        </div>

      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent z-[60]">
         <div className="max-w-md mx-auto flex items-center gap-3">
            {isParticipant ? (
               <div className="flex-1 flex items-center gap-2 bg-gray-100 p-1.5 rounded-[20px] border border-black/5">
                  <input 
                     value={msgInput}
                     onChange={e => setMsgInput(e.target.value)}
                     placeholder={t.detail.msgPlaceholder}
                     className="flex-1 bg-transparent border-none outline-none text-sm px-4 text-zinc-900 placeholder-zinc-400"
                  />
                  <button 
                     onClick={() => { if(msgInput) { sendMessage(project.id, msgInput); setMsgInput(''); } }}
                     className="w-10 h-10 bg-black text-white rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                  >
                     <Send size={16} />
                  </button>
               </div>
            ) : (
               <button 
                  onClick={() => joinProject(project.id)}
                  disabled={isFull}
                  className="w-full h-14 bg-black text-white rounded-[20px] font-bold text-sm uppercase tracking-widest shadow-xl shadow-black/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:bg-zinc-800"
               >
                  <span>{isFull ? t.detail.actions.soldOut : t.detail.actions.register}</span>
                  {!isFull && <ArrowLeft size={16} className="rotate-180" />}
               </button>
            )}
         </div>
      </div>

      {/* User Info Card Modal */}
      {isUserCardOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center px-4">
           {/* Backdrop */}
           <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
              onClick={() => setIsUserCardOpen(false)}
           />
           {/* Card Content */}
           <div className="w-full max-w-sm bg-white rounded-[32px] p-6 relative animate-in zoom-in-95 duration-300 shadow-2xl flex flex-col">
              
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                 <button 
                   onClick={() => setIsUserCardOpen(false)} 
                   className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
                 >
                    <ArrowLeft size={20} className="text-black" />
                 </button>
                 <div className="flex flex-col items-center -mt-2">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-float mb-2">
                       <img src={hostUser.avatar} className="w-full h-full object-cover" alt="Avatar" />
                    </div>
                    <h3 className="text-xl font-black tracking-tight">{hostUser.name}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t.profile.identity}</p>
                 </div>
                 <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-blue-500 hover:bg-gray-100 transition-colors">
                    <ScanLine size={20} />
                 </button>
              </div>

              {/* Black Info Card */}
              <div className="bg-black text-white rounded-[24px] p-6 mb-6 relative overflow-hidden shadow-premium-lg">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                 
                 <div className="flex justify-between items-start mb-10 relative z-10">
                    <div>
                       <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-2">{t.profile.trustScore}</p>
                       <StarRating score={hostUser.creditScore} />
                    </div>
                    <ShieldCheck size={28} className="text-white/20" />
                 </div>
                 
                 <div className="flex justify-between items-end relative z-10">
                    <div>
                       <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-1">{t.profile.userIdentity}</p>
                       <p className="text-sm font-bold tracking-widest">**** **** {hostUser.id.replace('u', '')}</p> 
                    </div>
                    <div className="w-10 h-6 bg-white/20 rounded-md backdrop-blur-md"></div>
                 </div>
              </div>

              {/* Menu Actions */}
              <div className="bg-gray-50 rounded-[24px] p-2 space-y-1">
                 <button 
                   onClick={() => navigate(`/profile/${hostUser.id}`)}
                   className="w-full flex items-center justify-between p-4 bg-white rounded-[20px] shadow-sm hover:shadow-md transition-all group active:scale-[0.98]"
                 >
                    <div className="flex items-center space-x-3">
                       <Layers size={20} strokeWidth={2} />
                       <span className="text-sm font-bold">Projects</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-black transition-colors" />
                 </button>
                 <button 
                   className="w-full flex items-center justify-between p-4 bg-white rounded-[20px] shadow-sm hover:shadow-md transition-all group active:scale-[0.98]"
                 >
                    <div className="flex items-center space-x-3">
                       <History size={20} strokeWidth={2} />
                       <span className="text-sm font-bold">历史项目</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-black transition-colors" />
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;