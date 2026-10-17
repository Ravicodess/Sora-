import React from 'react';
import { Smartphone, Headphones, Speaker, Check, X } from 'lucide-react';

interface AirPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDevice: string;
  onSelectDevice: (device: string) => void;
}

export const AirPlayModal: React.FC<AirPlayModalProps> = ({
  isOpen,
  onClose,
  currentDevice,
  onSelectDevice
}) => {
  if (!isOpen) return null;

  const devices = [
    { id: 'phone', name: 'Android Device Speaker', icon: <Smartphone className="w-5 h-5" />, desc: 'This Phone' },
    { id: 'bluetooth', name: 'Bluetooth Headphones / Car Audio', icon: <Headphones className="w-5 h-5" />, desc: 'Wireless Audio Output' },
    { id: 'cast', name: 'Smart Cast / Home Speaker', icon: <Speaker className="w-5 h-5" />, desc: 'Local Network' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-[#242426] border border-white/10 p-5 shadow-apple-float mb-6">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="text-base font-bold text-white">Audio Output</h3>
            <p className="text-xs text-[#8E8E93]">Choose where audio is playing</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-white/5 mt-2">
          {devices.map((dev) => {
            const isSelected = currentDevice === dev.id;
            return (
              <div
                key={dev.id}
                onClick={() => {
                  onSelectDevice(dev.id);
                  onClose();
                }}
                className="flex items-center justify-between py-3.5 px-2 hover:bg-white/5 rounded-xl cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${isSelected ? 'bg-[#FA233B] text-white' : 'bg-white/10 text-white/70'}`}>
                    {dev.icon}
                  </div>
                  <div className="text-left">
                    <p className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-white/80'}`}>
                      {dev.name}
                    </p>
                    <p className="text-xs text-[#8E8E93]">{dev.desc}</p>
                  </div>
                </div>

                {isSelected && (
                  <Check className="w-5 h-5 text-[#FA233B] stroke-[2.5]" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
