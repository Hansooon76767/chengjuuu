import React from 'react';
import { Project, ProjectCategory, ProjectStatus } from '../types';
import { MapPin, Calendar, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProjectCardProps {
  project: Project;
}

const getCategoryEmoji = (category: ProjectCategory) => {
  switch (category) {
    case ProjectCategory.DRINKING: return '🍹';
    case ProjectCategory.SPORTS: return '🚴';
    case ProjectCategory.BOARD_GAME: return '🎲';
    case ProjectCategory.OUTDOOR: return '🏔️';
    case ProjectCategory.DINING: return '🍽️';
    case ProjectCategory.WORKSHOP: return '💡';
    default: return '✨';
  }
};

const getStatusConfig = (status: ProjectStatus, current: number, max: number) => {
  if (status === ProjectStatus.FULL || current >= max) {
    return { label: 'Full', color: 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400' };
  }
  if (current >= max * 0.8) {
    return { label: 'Few Spots', color: 'bg-accent/20 text-yellow-700 dark:text-yellow-400' };
  }
  return { label: 'Open', color: 'bg-accent/20 text-black dark:text-accent' };
};

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const navigate = useNavigate();
  const statusConfig = getStatusConfig(project.status, project.currentPeople, project.maxPeople);

  return (
    <div 
      onClick={() => navigate(`/project/${project.id}`)}
      className="flex items-start gap-4 p-4 mb-3 bg-white dark:bg-zinc-900 rounded-[24px] border border-black/[0.04] dark:border-white/[0.05] shadow-[0_4px_12px_-4px_rgba(0,0,0,0.05)] active:scale-[0.98] transition-all cursor-pointer group hover:border-black/[0.08] dark:hover:border-white/[0.1]"
    >
      {/* Left: Artwork / Cover */}
      <div className="relative shrink-0 w-[72px] h-[72px] rounded-[18px] overflow-hidden bg-gray-50 dark:bg-zinc-800 border border-black/[0.04] dark:border-white/[0.05]">
        {project.coverImage ? (
          <img 
            src={project.coverImage} 
            alt={project.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl bg-gray-50 dark:bg-zinc-800 group-hover:bg-accent/10 transition-colors">
            {getCategoryEmoji(project.category)}
          </div>
        )}
      </div>

      {/* Right: Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between h-[72px]">
        
        {/* Top Row: Title & Status */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[14px] font-bold text-gray-900 dark:text-white leading-snug truncate pr-2 transition-colors">
            {project.title}
          </h3>
          <span className={`shrink-0 text-[9px] font-black uppercase tracking-wide px-2 py-0.5 rounded-md ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
        </div>

        {/* Description */}
        <p className="text-[11px] text-gray-500 dark:text-zinc-400 truncate leading-relaxed font-medium mt-0.5 transition-colors">
          {project.description}
        </p>

        {/* Bottom Row: Metadata */}
        <div className="flex items-center gap-3 mt-auto pt-1">
          <div className="flex items-center gap-1 text-gray-400 dark:text-zinc-500">
            <Calendar size={11} strokeWidth={2.5} />
            <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500">{project.time.split(' ')[0]}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400 dark:text-zinc-500">
            <MapPin size={11} strokeWidth={2.5} />
            <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 truncate max-w-[60px]">{project.city}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400 dark:text-zinc-500">
            <Users size={11} strokeWidth={2.5} />
            <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500">{project.currentPeople}/{project.maxPeople}</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProjectCard;