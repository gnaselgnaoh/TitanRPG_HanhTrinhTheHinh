
import React from 'react';
import { UserProfile, StatType, StatDetail, TrainingStyle, Faction } from '../types';
import { Shield, BookOpen, Sword, Dumbbell, Wind, Skull, Scale, Zap, Crown, Footprints, Heart, Brain } from 'lucide-react';

interface HeroCardProps {
  profile: UserProfile;
}

const HeroCard: React.FC<HeroCardProps> = ({ profile }) => {
  const globalProgress = (profile.currentXP / profile.maxXP) * 100;

  const getFactionIcon = (faction: Faction) => {
    switch(faction) {
      case Faction.IRON_CLAN: return <Dumbbell size={16} className="text-red-400" />;
      case Faction.SHADOW_RUNNER: return <Wind size={16} className="text-purple-400" />;
      case Faction.TITAN_TRIBE: return <Skull size={16} className="text-orange-400" />;
      case Faction.BALANCE_ORDER: return <Scale size={16} className="text-emerald-400" />;
      default: return <Sword size={16} />;
    }
  };

  const renderStatBar = (label: string, icon: React.ReactNode, stat: StatDetail, colorClass: string, bgClass: string) => {
    if (!stat) return null;
    const percent = Math.min(100, (stat.xp / stat.maxXP) * 100);
    return (
      <div className="flex flex-col gap-1 w-full">
        <div className="flex justify-between items-center text-xs">
          <div className={`flex items-center gap-1.5 font-bold ${colorClass}`}>
             {icon} {label} <span className="text-[9px] text-slate-400">Lv.{stat.level}</span>
          </div>
        </div>
        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-700/50">
          <div 
            className={`h-full ${bgClass} transition-all duration-700 ease-out`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-rpg-panel border border-slate-600 rounded-xl p-6 shadow-xl relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 opacity-5 pointer-events-none">
        <Crown size={150} />
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-center">
        {/* Avatar Section */}
        <div className="relative group cursor-pointer shrink-0">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border-2 border-rpg-gold flex items-center justify-center shadow-[0_0_15px_rgba(251,191,36,0.3)] group-hover:shadow-[0_0_25px_rgba(251,191,36,0.6)] transition-all duration-300 relative overflow-hidden">
             <div className={`absolute inset-0 opacity-20 ${profile.trainingStyle === TrainingStyle.CALISTHENICS ? 'bg-cyan-500' : 'bg-red-500'}`}></div>
            <span className="text-3xl font-rpg text-rpg-gold drop-shadow-md relative z-10">{profile.level}</span>
          </div>
          <div className="absolute -bottom-2 w-full text-center">
            <span className="bg-rpg-dark text-[10px] text-rpg-gold px-2 py-1 rounded border border-rpg-gold uppercase tracking-wider font-bold truncate block mx-auto max-w-[90%]">
              {profile.userClass || 'Adventurer'}
            </span>
          </div>
        </div>

        {/* Info Section */}
        <div className="flex-1 w-full space-y-4">
          
          {/* Main Level & Global XP */}
          <div>
            <div className="flex justify-between items-baseline mb-1">
              <h2 className="text-2xl font-bold font-rpg text-white tracking-wide flex items-center gap-2">
                {profile.name} 
                <span className="text-xs text-slate-300 font-sans font-normal ml-2 flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-full border border-slate-700" title={`Môn phái: ${profile.faction}`}>
                  {getFactionIcon(profile.faction)}
                  <span className="hidden sm:inline">{profile.faction}</span>
                </span>
              </h2>
              <span className="text-rpg-xp font-mono text-sm">{profile.currentXP} / {profile.maxXP} XP</span>
            </div>
            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-600 shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-1000 ease-out relative"
                style={{ width: `${globalProgress}%` }}
              >
                  <div className="absolute top-0 right-0 bottom-0 w-[1px] bg-white/50 shadow-[0_0_5px_white]"></div>
              </div>
            </div>
          </div>

          {/* Detailed 5 Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 bg-slate-800/40 p-3 rounded-lg border border-slate-700/50">
            {renderStatBar("STR", <Sword size={12} />, profile.stats[StatType.STR], "text-red-400", "bg-red-500")}
            {renderStatBar("AGI", <Footprints size={12} />, profile.stats[StatType.AGI], "text-cyan-400", "bg-cyan-500")}
            {renderStatBar("VIT", <Heart size={12} />, profile.stats[StatType.VIT], "text-emerald-400", "bg-emerald-500")}
            {renderStatBar("INT", <Brain size={12} />, profile.stats[StatType.INT], "text-purple-400", "bg-purple-500")}
            {renderStatBar("CHA", <Crown size={12} />, profile.stats[StatType.CHA], "text-yellow-400", "bg-yellow-500")}
          </div>
        </div>
      </div>
      
      {/* Physical Stats Footer */}
      <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between text-sm text-slate-400 flex-wrap gap-2">
        <div className="flex items-center gap-4">
          <span>Chiều cao: <strong className="text-slate-200">{profile.height} cm</strong></span>
          <span>Cân nặng: <strong className="text-slate-200">{profile.weight} kg</strong></span>
        </div>
        <span>Chuỗi bất bại: <strong className="text-orange-400">{profile.streak} ngày 🔥</strong></span>
      </div>
    </div>
  );
};

export default HeroCard;
