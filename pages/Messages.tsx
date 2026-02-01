
import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Heart, MessageCircle, Calendar as CalendarIcon, X, Clock, MapPin, ChevronRight } from 'lucide-react';

const WeeklyCalendar = ({ projects, t }: { projects: any[], t: any }) => {
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const weekDays = t.weekDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Calculate dates for current week starting Monday
  const currentWeekDates = useMemo(() => {
    const curr = new Date(); 
    const day = curr.getDay();
    // Adjust so week starts on Monday (1)
    // If today is Sunday (0), we need to go back 6 days to get Monday.
    // If today is Monday (1), we go back 0 days.
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(curr);
    monday.setDate(diff);

    return Array.from({ length: 7 }).map((_, idx) => {
       const d = new Date(monday);
       d.setDate(monday.getDate() + idx);
       return d.getDate();
    });
  }, []);

  const today = new Date();
  const currentDay = today.getDay();
  // Map JS getDay() (0=Sun, 1=Mon...) to our index (0=Mon, 6=Sun)
  const todayIndex = currentDay === 0 ? 6 : currentDay - 1;

  const getEventStyle = (timeStr: string) => {
    const dayMap: Record<string, number> = { 
        '周一': 0, '周二': 1, '周三': 2, '周四': 3, '周五': 4, '周六': 5, '周日': 6,
        'Mon': 0, 'Tue': 1, 'Wed': 2, 'Thu': 3, 'Fri': 4, 'Sat': 5, 'Sun': 6
    };
    let dayIndex = -1;
    for (const [key, val] of Object.entries(dayMap)) {
      if (timeStr.includes(key)) {
         dayIndex = val;
         break;
      }
    }
    
    const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
    let hour = 19; 
    let minute = 0;
    if (timeMatch) {
      hour = parseInt(timeMatch[1]);
      minute = parseInt(timeMatch[2]);
    }
    
    const startHour = 12;
    const endHour = 26; 
    const normalizedHour = hour < 6 ? hour + 24 : hour;
    const topPercent = Math.max(0, Math.min(100, ((normalizedHour + minute/60) - startHour) / (endHour - startHour) * 100));
    
    return { dayIndex, topPercent };
  };

  const weekEvents = useMemo(() => {
     return projects.map(p => {
        const { dayIndex, topPercent } = getEventStyle(p.time);
        return { ...p, dayIndex, topPercent };
     }).filter(p => p.dayIndex !== -1);
  }, [projects]);

  const selectedDayEvents = useMemo(() => {
     if (selectedDay === null) return [];
     return weekEvents.filter(e => e.dayIndex === selectedDay).sort((a, b) => a.topPercent - b.topPercent);
  }, [selectedDay, weekEvents]);

  return (
    <>
      <div className="bg-white p-5 rounded-[32px] border border-black/5 shadow-premium mb-6 overflow-hidden relative z-10">
         <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center space-x-2">
               <CalendarIcon size={16} className="text-accent" />
               <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">{t.messages.schedule}</h3>
            </div>
            <span className="text-[10px] font-bold bg-gray-100 px-2 py-0.5 rounded-md text-zinc-500">{t.messages.thisWeek}</span>
         </div>
         
         <div className="flex justify-between">
            {weekDays.map((day: string, idx: number) => (
               <div 
                  key={day} 
                  onClick={() => setSelectedDay(idx)}
                  className="flex flex-col items-center space-y-2 flex-1 relative h-40 cursor-pointer group select-none"
               >
                  {/* Hover Background */}
                  <div className={`absolute inset-y-0 -inset-x-1 rounded-xl transition-all duration-300 ${idx === todayIndex ? 'bg-black/5' : 'group-hover:bg-gray-50'} ${selectedDay === idx ? 'bg-black/5' : ''}`}></div>

                  {/* Header */}
                  <div className={`relative z-10 flex flex-col items-center space-y-1 transition-opacity duration-300 ${idx === todayIndex ? 'opacity-100' : 'opacity-40 group-hover:opacity-80'}`}>
                     <span className="text-[9px] font-black uppercase tracking-wider">{day}</span>
                     <span className={`text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-full transition-all ${idx === todayIndex ? 'bg-black text-white shadow-lg' : 'group-hover:bg-gray-200 text-zinc-500'}`}>
                        {currentWeekDates[idx]}
                     </span>
                  </div>
                  
                  {/* Timeline Lane */}
                  <div className="w-full h-full relative border-l border-dashed border-gray-100/50 mt-2 pointer-events-none">
                     {weekEvents.filter(e => e.dayIndex === idx).map(event => (
                        <div 
                          key={event.id}
                          className="absolute left-1 right-1 h-8 rounded-md bg-black shadow-md border border-white/10 overflow-hidden group-hover:scale-105 transition-transform duration-300"
                          style={{ top: `${event.topPercent}%` }}
                        >
                           {event.coverImage ? (
                              <img src={event.coverImage} className="w-full h-full object-cover opacity-80" alt="Event" />
                           ) : (
                              <div className="w-full h-full bg-accent/20"></div>
                           )}
                        </div>
                     ))}
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* Floating Detail Window */}
      {selectedDay !== null && (
        <div className="fixed inset-0 z-[150] flex items-end justify-center px-4 pb-6">
            <div 
                className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={() => setSelectedDay(null)}
            />
            <div className="w-full max-w-md bg-white rounded-[32px] p-6 relative z-20 animate-in slide-in-from-bottom-10 duration-300 shadow-2xl flex flex-col max-h-[60vh]">
                <div className="flex justify-between items-start mb-6 shrink-0">
                    <div>
                        <h3 className="text-2xl font-black text-black">{weekDays[selectedDay]}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                             <span className="w-2 h-2 rounded-full bg-accent"></span>
                             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                {t.messages.schedule}
                             </p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setSelectedDay(null)}
                        className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors active:scale-90"
                    >
                        <X size={16} className="text-gray-500" />
                    </button>
                </div>

                <div className="space-y-3 overflow-y-auto no-scrollbar pb-2">
                    {selectedDayEvents.length > 0 ? selectedDayEvents.map(event => (
                        <div 
                            key={event.id}
                            onClick={() => navigate(`/project/${event.id}`)}
                            className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50 border border-gray-100 active:scale-95 transition-all cursor-pointer hover:bg-white hover:shadow-premium hover:border-black/5"
                        >
                             <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-200 shrink-0 shadow-sm">
                                <img src={event.coverImage || event.hostAvatar} className="w-full h-full object-cover" alt="Cover" />
                             </div>
                             <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                    <span className="px-1.5 py-0.5 rounded bg-black text-white text-[8px] font-bold uppercase tracking-wider">{event.category}</span>
                                    <span className="text-[10px] font-bold text-gray-400 flex items-center"><Clock size={10} className="mr-1"/> {event.time.split(' ').pop()}</span>
                                </div>
                                <h4 className="text-sm font-bold text-black truncate">{event.title}</h4>
                                <div className="flex items-center text-[10px] text-gray-500 mt-1">
                                    <MapPin size={10} className="mr-1" />
                                    <span className="truncate">{event.location}</span>
                                </div>
                             </div>
                             <ChevronRight size={16} className="text-gray-300" />
                        </div>
                    )) : (
                        <div className="py-12 text-center border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center">
                            <Clock size={32} className="text-gray-200 mb-2" />
                            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">No events</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}
    </>
  );
};

const Messages: React.FC = () => {
  const { projects, currentUser, t } = useApp();
  const navigate = useNavigate();

  // Filter projects where user is host or participant
  const myProjects = projects.filter(p => 
    p.hostId === currentUser.id || 
    p.participants.some(u => u.id === currentUser.id)
  );

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between px-2 pt-2">
         <h1 className="text-3xl font-black tracking-tighter">{t.nav.message}</h1>
      </div>

      {/* Weekly Calendar Timeline */}
      <WeeklyCalendar projects={myProjects} t={t} />

      {/* Top Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Applications */}
        <div className="bg-black text-white p-5 rounded-[28px] relative overflow-hidden shadow-premium group cursor-pointer active:scale-95 transition-all">
           <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 blur-2xl"></div>
           <div className="relative z-10 flex flex-col justify-between h-24">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                 <UserPlus size={20} className="text-accent" />
              </div>
              <div>
                 <h3 className="text-sm font-black uppercase tracking-widest mb-1">{t.messages.applications}</h3>
                 <p className="text-[10px] text-white/60 font-medium leading-tight">{t.messages.appDesc}</p>
              </div>
           </div>
           {/* Mock Notification Dot */}
           <div className="absolute top-5 right-5 w-2 h-2 bg-accent rounded-full animate-pulse"></div>
        </div>

        {/* Interested */}
        <div className="bg-white p-5 rounded-[28px] border border-black/5 relative overflow-hidden shadow-premium group cursor-pointer active:scale-95 transition-all">
           <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full -mr-8 -mt-8 blur-2xl"></div>
           <div className="relative z-10 flex flex-col justify-between h-24">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-black/5">
                 <Heart size={20} className="text-black" />
              </div>
              <div>
                 <h3 className="text-sm font-black uppercase tracking-widest mb-1">{t.messages.interested}</h3>
                 <p className="text-[10px] text-secondary/60 font-medium leading-tight">{t.messages.intDesc}</p>
              </div>
           </div>
        </div>
      </div>

      {/* Chat List */}
      <div className="space-y-4">
         <h2 className="text-[10px] font-black text-secondary uppercase tracking-widest px-2 opacity-60">{t.messages.projectChats}</h2>
         
         <div className="space-y-2">
            {myProjects.length > 0 ? myProjects.map(p => {
               const lastMsg = p.chatMessages[p.chatMessages.length - 1];
               return (
                  <div 
                    key={p.id} 
                    onClick={() => navigate(`/project/${p.id}`)}
                    className="flex items-center gap-4 p-4 bg-white rounded-[24px] border border-black/[0.04] active:scale-[0.98] transition-all cursor-pointer hover:shadow-premium"
                  >
                     <div className="relative shrink-0 w-14 h-14 rounded-2xl overflow-hidden bg-gray-50 border border-black/[0.04]">
                        <img src={p.coverImage || p.hostAvatar} className="w-full h-full object-cover" alt={p.title} />
                        {/* Avatar Overlay if provided */}
                        {p.coverImage && (
                          <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full border border-white overflow-hidden">
                             <img src={p.hostAvatar} className="w-full h-full object-cover" />
                          </div>
                        )}
                     </div>
                     
                     <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                           <h3 className="text-sm font-bold text-black truncate pr-2">{p.title}</h3>
                           {lastMsg && <span className="text-[10px] font-bold text-gray-400 shrink-0">{lastMsg.createdAt}</span>}
                        </div>
                        <p className="text-[11px] font-medium text-gray-500 truncate">
                           {lastMsg ? `${lastMsg.authorName}: ${lastMsg.content}` : t.messages.noChats}
                        </p>
                     </div>
                  </div>
               );
            }) : (
               <div className="text-center py-12 opacity-40">
                  <MessageCircle size={32} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{t.messages.noChats}</p>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default Messages;
