import React from 'react';
import { 
  LayoutDashboard, 
  Pill, 
  PlusCircle, 
  History, 
  HeartHandshake, 
  Settings, 
  Sparkles,
  Users,
  UserPlus,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenAiModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, onOpenAiModal }) => {
  const { user } = useAuth();
  if (!user) return null;

  const isCaregiver = user.role === 'caregiver';

  const patientNavItems = [
    { id: 'dashboard', label: 'Today’s Plan', icon: LayoutDashboard },
    { id: 'medicines', label: 'My Medicines', icon: Pill },
    { id: 'add-medicine', label: 'Add Medicine', icon: PlusCircle },
    { id: 'history', label: 'Reminder History', icon: History },
    { id: 'caregiver', label: 'Caregiver Support', icon: HeartHandshake },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const caregiverNavItems = [
    { id: 'caregiver-dashboard', label: 'My Patients', icon: Users },
    { id: 'connect-patient', label: 'Connect Patient', icon: UserPlus },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const navItems = isCaregiver ? caregiverNavItems : patientNavItems;

  return (
    <>
      {/* Desktop Sidebar (hidden on small mobile) */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-[#E2E8E8] min-h-[calc(100vh-4.5rem)] p-4 shrink-0 justify-between">
        <div className="space-y-6">
          {/* Quick AI Trigger for Patients */}
          {!isCaregiver && onOpenAiModal && (
            <button
              id="sidebar-ai-modal-btn"
              onClick={onOpenAiModal}
              className="w-full flex items-center justify-center gap-2.5 p-3.5 bg-[#0D5A5A] hover:bg-[#094242] active:bg-[#062E2E] text-white rounded-xl shadow-xs font-bold text-base transition-all cursor-pointer select-none"
            >
              <Sparkles size={18} className="text-[#E0F2F1]" />
              <span>✨ AI Schedule Setup</span>
            </button>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1.5" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`sidebar-link-${item.id}`}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-bold text-base transition-all cursor-pointer select-none text-left min-h-[48px] ${
                    isActive
                      ? 'bg-[#E0F2F1] text-[#0D5A5A] shadow-2xs font-semibold'
                      : 'text-[#5A6E6E] hover:bg-[#F7F9F9] hover:text-[#1A2E2E]'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon
                    size={20}
                    className={`shrink-0 ${isActive ? 'text-[#0D5A5A]' : 'text-[#7A8E8E]'}`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Safety Badge & Disclaimers at Bottom */}
        <div className="pt-4 border-t border-[#E2E8E8] text-xs text-[#5A6E6E] space-y-2">
          <div className="flex items-center gap-1.5 text-[#1A2E2E] font-semibold">
            <ShieldCheck size={16} className="text-[#0D5A5A] shrink-0" />
            <span>Reminder & Self-Report Tool</span>
          </div>
          <p className="text-[11px] leading-relaxed text-[#5A6E6E]">
            MediMate records what you report. It does not provide medical advice or verify swallowing.
          </p>
        </div>
      </aside>

      {/* Mobile Bottom Navigation (Visible on phones/tablets) */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E2E8E8] px-2 py-1.5 flex items-center justify-around shadow-lg"
        aria-label="Mobile Navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`mobile-nav-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-bold transition-all min-w-[60px] min-h-[48px] cursor-pointer ${
                isActive ? 'text-[#0D5A5A] bg-[#E0F2F1]' : 'text-[#5A6E6E] hover:text-[#1A2E2E]'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={20} className={isActive ? 'text-[#0D5A5A] stroke-[2.5]' : 'text-[#7A8E8E]'} />
              <span className="mt-1 leading-none truncate max-w-[70px]">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
