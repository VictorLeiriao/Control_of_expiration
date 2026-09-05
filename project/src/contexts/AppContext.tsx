import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Company, Notification, NotificationChannel } from '@/types';
import { mockCompany, mockNotifications } from '@/mocks';
import { companyService } from '@/services';

interface AppContextValue {
  company: Company;
  notifications: Notification[];
  unreadCount: number;
  channels: NotificationChannel[];
  refreshCompany: () => Promise<void>;
  updateCompany: (data: Partial<Company>) => Promise<void>;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  toggleChannel: (id: string) => void;
  addChannel: (channel: Omit<NotificationChannel, 'id' | 'createdAt'>) => void;
  removeChannel: (id: string) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const initialChannels: NotificationChannel[] = [
  { id: 'ch1', tenantId: 't1', type: 'EMAIL', destination: 'carlos@amigofiel.com.br', enabled: true, createdAt: '2026-01-15T10:00:00Z' },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [company, setCompany] = useState<Company>(mockCompany);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [channels, setChannels] = useState<NotificationChannel[]>(initialChannels);

  useEffect(() => {
    companyService.getCompany().then((c) => setCompany(c));
  }, []);

  async function refreshCompany() {
    const c = await companyService.getCompany();
    setCompany(c);
  }

  async function updateCompany(data: Partial<Company>) {
    const updated = await companyService.updateCompany(data);
    setCompany(updated);
  }

  function markNotificationRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  function markAllNotificationsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function toggleChannel(id: string) {
    setChannels((prev) => prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c)));
  }

  function addChannel(channel: Omit<NotificationChannel, 'id' | 'createdAt'>) {
    setChannels((prev) => [...prev, { ...channel, id: `ch${Date.now()}`, createdAt: new Date().toISOString() }]);
  }

  function removeChannel(id: string) {
    setChannels((prev) => prev.filter((c) => c.id !== id));
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AppContext.Provider value={{
      company,
      notifications,
      unreadCount,
      channels,
      refreshCompany,
      updateCompany,
      markNotificationRead,
      markAllNotificationsRead,
      toggleChannel,
      addChannel,
      removeChannel,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
