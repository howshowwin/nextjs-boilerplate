'use client';

import { CalendarEvent, CalendarFilter, CalendarStats, CountdownEvent } from '@/lib/types/calendar';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface CalendarStore {
  events: CalendarEvent[];
  filter: CalendarFilter;
  loading: boolean;
  
  // API Actions
  loadEvents: () => Promise<void>;
  addEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  toggleEventCompletion: (id: string) => Promise<void>;
  
  // Getters
  getEventsByDate: (date: Date) => CalendarEvent[];
  getEventsByMonth: (year: number, month: number) => CalendarEvent[];
  getUpcomingEvents: (limit?: number) => CalendarEvent[];
  getOverdueEvents: () => CalendarEvent[];
  getCountdownEvents: () => CountdownEvent[];
  getCalendarStats: () => CalendarStats;
  
  // Filter
  setFilter: (filter: Partial<CalendarFilter>) => void;
  getFilteredEvents: () => CalendarEvent[];
  
  // Utilities
  searchEvents: (query: string) => CalendarEvent[];
  getEventsByCategory: (category: string) => CalendarEvent[];
}

// API 輔助函數
const apiRequest = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
};

// 轉換資料庫事件為前端格式
const transformDbEvent = (dbEvent: any): CalendarEvent => ({
  id: dbEvent.id.toString(),
  title: dbEvent.title,
  description: dbEvent.description,
  date: new Date(dbEvent.date_time || dbEvent.date),
  startTime: dbEvent.start_time,
  endTime: dbEvent.end_time,
  type: dbEvent.type,
  priority: dbEvent.priority,
  completed: dbEvent.is_completed || dbEvent.completed,
  color: dbEvent.color,
  reminder: dbEvent.reminder ? new Date(dbEvent.reminder) : undefined,
  category: dbEvent.category,
  location: dbEvent.location,
  attendees: dbEvent.attendees,
  recurring: dbEvent.recurrence_pattern ? {
    type: dbEvent.recurrence_pattern,
    interval: 1,
    endDate: dbEvent.recurrence_end_date ? new Date(dbEvent.recurrence_end_date) : undefined,
  } : undefined,
  createdAt: new Date(dbEvent.created_at),
  updatedAt: new Date(dbEvent.updated_at),
});

// 轉換前端事件為資料庫格式
const transformEventForDb = (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => ({
  title: event.title,
  description: event.description,
  date_time: event.date.toISOString(),
  type: event.type,
  priority: event.priority,
  category: event.category,
  location: event.location,
  is_all_day: false,
  reminder_minutes: event.reminder ? 30 : undefined,
  recurrence_pattern: event.recurring?.type,
  recurrence_end_date: event.recurring?.endDate?.toISOString(),
  is_completed: event.completed || false,
});

const isSameDay = (date1: Date, date2: Date) => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

const calculateTimeLeft = (targetDate: Date) => {
  const now = new Date();
  const timeDiff = targetDate.getTime() - now.getTime();
  
  const daysLeft = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hoursLeft = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutesLeft = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  
  return { daysLeft, hoursLeft, minutesLeft };
};

export const useCalendarStore = create<CalendarStore>()(
  persist(
    (set, get) => ({
      events: [],
      loading: false,
      filter: {
        categories: [],
        types: ['task', 'event', 'milestone'],
        priorities: ['low', 'medium', 'high'],
      },
      
      loadEvents: async () => {
        set({ loading: true });
        try {
          const dbEvents = await apiRequest('/api/calendar');
          const events = dbEvents.map(transformDbEvent);
          set({ events, loading: false });
        } catch (error) {
          console.error('載入事件失敗:', error);
          set({ loading: false });
        }
      },
      
      addEvent: async (eventData: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
          const dbEventData = transformEventForDb(eventData);
          const newDbEvent = await apiRequest('/api/calendar', {
            method: 'POST',
            body: JSON.stringify(dbEventData),
          });
          const newEvent = transformDbEvent(newDbEvent);
          
          set((state: CalendarStore) => ({
            events: [...state.events, newEvent]
          }));
        } catch (error) {
          console.error('新增事件失敗:', error);
          throw error;
        }
      },
      
      updateEvent: async (id: string, updates: Partial<CalendarEvent>) => {
        try {
          const currentEvent = get().events.find((e: CalendarEvent) => e.id === id);
          if (!currentEvent) throw new Error('事件不存在');
          
          const updatedEventData = { ...currentEvent, ...updates };
          const dbEventData = transformEventForDb(updatedEventData);
          
          const updatedDbEvent = await apiRequest(`/api/calendar/${id}`, {
            method: 'PUT',
            body: JSON.stringify(dbEventData),
          });
          const updatedEvent = transformDbEvent(updatedDbEvent);
          
          set((state: CalendarStore) => ({
            events: state.events.map((event: CalendarEvent) =>
              event.id === id ? updatedEvent : event
            )
          }));
        } catch (error) {
          console.error('更新事件失敗:', error);
          throw error;
        }
      },
      
      deleteEvent: async (id: string) => {
        try {
          await apiRequest(`/api/calendar/${id}`, {
            method: 'DELETE',
          });
          
          set((state: CalendarStore) => ({
            events: state.events.filter((event: CalendarEvent) => event.id !== id)
          }));
        } catch (error) {
          console.error('刪除事件失敗:', error);
          throw error;
        }
      },
      
      toggleEventCompletion: async (id: string) => {
        try {
          const currentEvent = get().events.find((e: CalendarEvent) => e.id === id);
          if (!currentEvent) throw new Error('事件不存在');
          
          await get().updateEvent(id, { completed: !currentEvent.completed });
        } catch (error) {
          console.error('切換事件完成狀態失敗:', error);
          throw error;
        }
      },
      
      getEventsByDate: (date: Date) => {
        const events = get().events;
        return events.filter((event: CalendarEvent) => isSameDay(event.date, date));
      },
      
      getEventsByMonth: (year: number, month: number) => {
        const events = get().events;
        return events.filter((event: CalendarEvent) => 
          event.date.getFullYear() === year && 
          event.date.getMonth() === month
        );
      },
      
      getUpcomingEvents: (limit: number = 5) => {
        const events = get().events;
        const now = new Date();
        
        return events
          .filter((event: CalendarEvent) => event.date >= now && !event.completed)
          .sort((a: CalendarEvent, b: CalendarEvent) => a.date.getTime() - b.date.getTime())
          .slice(0, limit);
      },
      
      getOverdueEvents: () => {
        const events = get().events;
        const now = new Date();
        
        return events.filter((event: CalendarEvent) => 
          event.date < now && 
          !event.completed && 
          event.type === 'task'
        );
      },
      
      getCountdownEvents: () => {
        const events = get().events;
        const now = new Date();
        
        return events
          .filter((event: CalendarEvent) => 
            event.date >= now && 
            !event.completed && 
            (event.type === 'task' || event.type === 'milestone')
          )
          .map((event: CalendarEvent) => {
            const timeLeft = calculateTimeLeft(event.date);
            return {
              id: event.id,
              title: event.title,
              targetDate: event.date,
              type: event.type as 'task' | 'milestone',
              priority: event.priority,
              ...timeLeft
            };
          })
          .sort((a: CountdownEvent, b: CountdownEvent) => a.targetDate.getTime() - b.targetDate.getTime());
      },
      
      getCalendarStats: () => {
        const events = get().events;
        const now = new Date();
        
        return {
          totalEvents: events.length,
          completedTasks: events.filter((e: CalendarEvent) => e.completed).length,
          pendingTasks: events.filter((e: CalendarEvent) => !e.completed && e.type === 'task').length,
          upcomingEvents: events.filter((e: CalendarEvent) => e.date >= now && !e.completed).length,
          overdueEvents: events.filter((e: CalendarEvent) => e.date < now && !e.completed && e.type === 'task').length,
        };
      },
      
      setFilter: (newFilter: Partial<CalendarFilter>) => {
        set((state: CalendarStore) => ({
          filter: { ...state.filter, ...newFilter }
        }));
      },
      
      getFilteredEvents: () => {
        const { events, filter } = get();
        
        return events.filter((event: CalendarEvent) => {
          const matchesType = filter.types.length === 0 || filter.types.includes(event.type);
          const matchesPriority = filter.priorities.length === 0 || filter.priorities.includes(event.priority);
          const matchesCategory = filter.categories.length === 0 || 
            (event.category && filter.categories.includes(event.category));
          const matchesCompleted = filter.completed === undefined || event.completed === filter.completed;
          
          return matchesType && matchesPriority && matchesCategory && matchesCompleted;
        });
      },
      
      searchEvents: (query: string) => {
        const events = get().events;
        const searchTerm = query.toLowerCase();
        
        return events.filter((event: CalendarEvent) =>
          event.title.toLowerCase().includes(searchTerm) ||
          event.description?.toLowerCase().includes(searchTerm) ||
          event.category?.toLowerCase().includes(searchTerm)
        );
      },
      
      getEventsByCategory: (category: string) => {
        const events = get().events;
        return events.filter((event: CalendarEvent) => event.category === category);
      },
    }),
    {
      name: 'calendar-store',
      partialize: (state) => ({ events: state.events }),
      storage: createJSONStorage(() => localStorage),
      version: 1,
      // 轉換日期字串為 Date 物件
      migrate: (persistedState: any) => {
        // 同上：第一次升級時也轉換
        if (persistedState?.events) {
          persistedState.events = persistedState.events.map((e: any) => ({
            ...e,
            date: new Date(e.date),
            createdAt: e.createdAt ? new Date(e.createdAt) : undefined,
            updatedAt: e.updatedAt ? new Date(e.updatedAt) : undefined,
            reminder: e.reminder ? new Date(e.reminder) : undefined,
            recurring: e.recurring?.endDate
              ? { ...e.recurring, endDate: new Date(e.recurring.endDate) }
              : e.recurring,
          }));
        }
        return persistedState;
      },
      onRehydrateStorage: () => (state: CalendarStore | undefined) => {
        if (state?.events) {
          state.events = state.events.map((e: any) => ({
            ...e,
            date: new Date(e.date),
            createdAt: e.createdAt ? new Date(e.createdAt) : undefined,
            updatedAt: e.updatedAt ? new Date(e.updatedAt) : undefined,
            reminder: e.reminder ? new Date(e.reminder) : undefined,
            recurring: e.recurring?.endDate
              ? { ...e.recurring, endDate: new Date(e.recurring.endDate) }
              : e.recurring,
          }));
        }
      },
    }
  )
); 