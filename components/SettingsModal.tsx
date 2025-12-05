
import React, { useState } from 'react';
import { UserSettings, TrainingStyle, Faction } from '../types';
import { X, Volume2, VolumeX, Bell, BellOff, Settings, Swords, Flag, Trash2 } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface ExtendedSettingsModalProps {
    settings: UserSettings;
    onUpdateSettings: (s: UserSettings) => void;
    onClose: () => void;
    currentStyle?: TrainingStyle;
    onUpdateStyle?: (style: TrainingStyle) => void;
    currentFaction?: Faction;
    onUpdateFaction?: (faction: Faction) => void;
    onReset?: () => void;
}

const SettingsModal: React.FC<ExtendedSettingsModalProps> = ({ 
  settings, 
  onUpdateSettings, 
  onClose, 
  currentStyle, 
  onUpdateStyle, 
  currentFaction, 
  onUpdateFaction,
  onReset 
}) => {
  const [showFactionSelect, setShowFactionSelect] = useState(false);

  const toggleSound = () => {
    const newEnabled = !settings.soundEnabled;
    onUpdateSettings({ ...settings, soundEnabled: newEnabled });
    soundEngine.setEnabled(newEnabled);
    if (newEnabled) soundEngine.playClick();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    onUpdateSettings({ ...settings, volume: newVolume });
    soundEngine.setVolume(newVolume);
  };

  const toggleNotifications = () => {
    const newEnabled = !settings.notificationEnabled;
    if (newEnabled && "Notification" in window) {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          onUpdateSettings({ ...settings, notificationEnabled: true });
          new Notification("Titan RPG", { body: "Hệ thống thông báo đã được kích hoạt!" });
        } else {
          alert("Bạn cần cấp quyền thông báo trong trình duyệt.");
          onUpdateSettings({ ...settings, notificationEnabled: false });
        }
      });
    } else {
      onUpdateSettings({ ...settings, notificationEnabled: false });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4 animate-fadeIn">
      <div className="bg-rpg-panel border-2 border-slate-600 rounded-xl max-w-sm w-full relative shadow-2xl flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50 rounded-t-xl">
          <h3 className="text-xl font-rpg text-slate-200 flex items-center gap-2">
            <Settings className="text-slate-400" /> Cài Đặt Hệ Thống
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          
          {/* Sound Toggle */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${settings.soundEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-500'}`}>
                  {settings.soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
                </div>
                <div>
                  <div className="text-slate-200 font-bold">Hiệu ứng âm thanh</div>
                  <div className="text-xs text-slate-500">Âm thanh 8-bit retro</div>
                </div>
              </div>
              <button onClick={toggleSound} className={`w-12 h-6 rounded-full relative transition-colors ${settings.soundEnabled ? 'bg-emerald-600' : 'bg-slate-700'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.soundEnabled ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
            {settings.soundEnabled && (
              <div className="pl-14 pr-2">
                 <input type="range" min="0" max="1" step="0.1" value={settings.volume} onChange={handleVolumeChange} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                 <div className="flex justify-between text-[10px] text-slate-500 mt-1"><span>Mute</span><span>Max</span></div>
              </div>
            )}
          </div>

          {/* Notification Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${settings.notificationEnabled ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-500'}`}>
                {settings.notificationEnabled ? <Bell size={24} /> : <BellOff size={24} />}
              </div>
              <div>
                <div className="text-slate-200 font-bold">Thông báo nhắc nhở</div>
                <div className="text-xs text-slate-500">Nhắc tập luyện & ăn uống</div>
              </div>
            </div>
            <button onClick={toggleNotifications} className={`w-12 h-6 rounded-full relative transition-colors ${settings.notificationEnabled ? 'bg-blue-600' : 'bg-slate-700'}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.notificationEnabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

           {/* Style & Faction Switching */}
           {(currentStyle || currentFaction) && (
               <div className="pt-4 border-t border-slate-700 space-y-4">
                  {currentStyle && onUpdateStyle && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                         <Swords size={16} className="text-rpg-gold" /> 
                         <span className="text-slate-200 font-bold text-sm">Chuyển Đổi Trường Phái</span>
                      </div>
                      <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
                         <button onClick={() => onUpdateStyle(TrainingStyle.CALISTHENICS)} className={`flex-1 text-xs py-2 rounded transition-all ${currentStyle === TrainingStyle.CALISTHENICS ? 'bg-cyan-900 text-cyan-400 font-bold shadow' : 'text-slate-500 hover:text-slate-300'}`}>Calisthenics</button>
                         <button onClick={() => onUpdateStyle(TrainingStyle.GYM)} className={`flex-1 text-xs py-2 rounded transition-all ${currentStyle === TrainingStyle.GYM ? 'bg-red-900 text-red-400 font-bold shadow' : 'text-slate-500 hover:text-slate-300'}`}>Gym</button>
                      </div>
                    </div>
                  )}

                  {currentFaction && onUpdateFaction && (
                    <div>
                       <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                             <Flag size={16} className="text-rpg-gold" />
                             <span className="text-slate-200 font-bold text-sm">Đổi Môn Phái</span>
                          </div>
                          <button onClick={() => setShowFactionSelect(!showFactionSelect)} className="text-[10px] text-blue-400 underline">Thay đổi</button>
                       </div>
                       
                       <div className="text-xs text-slate-500 bg-slate-900 p-2 rounded mb-2 border border-slate-700">
                         Hiện tại: <span className="text-white font-bold">{currentFaction}</span>
                       </div>

                       {showFactionSelect && (
                         <div className="grid grid-cols-1 gap-2 animate-fadeIn">
                            {Object.values(Faction).map(f => (
                              <button 
                                key={f}
                                onClick={() => { onUpdateFaction(f); setShowFactionSelect(false); }}
                                className={`text-xs p-2 rounded border text-left ${currentFaction === f ? 'bg-rpg-gold text-slate-900 border-rpg-gold font-bold' : 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700'}`}
                              >
                                {f}
                              </button>
                            ))}
                         </div>
                       )}
                    </div>
                  )}
               </div>
           )}

           {/* Reset Button (Replaces Logout) */}
           {onReset && (
             <div className="pt-4 border-t border-slate-700">
                <button 
                  onClick={() => {
                    // Safe click handler: try sound, but ensure reset is called
                    try { soundEngine.playClick(); } catch(e) {}
                    onReset();
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-red-900/30 hover:bg-red-900/60 text-red-400 hover:text-red-300 font-bold py-3 rounded border border-red-900/50 hover:border-red-500 transition-colors group"
                >
                   <Trash2 size={16} className="group-hover:animate-bounce" /> Xóa dữ liệu & Tạo lại
                </button>
             </div>
           )}

          <div className="space-y-3 pt-2">
            <div className="bg-slate-800 p-3 rounded text-xs text-slate-400 italic text-center">
              *Cài đặt và tiến trình được tự động lưu.
            </div>
            <div className="flex flex-col items-center justify-center mt-4">
              <div className="w-16 h-16 rounded-full border-2 border-rpg-gold/50 overflow-hidden mb-2 shadow-lg">
                 <img src="./avatar.png" alt="Developer" className="w-full h-full object-cover" />
              </div>
              <p className="text-[10px] text-slate-600 font-mono uppercase tracking-widest">
                Credit: Hoàng Lê Minh Sang - PK04346
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
