export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  type: 'task' | 'event' | 'milestone';
  priority: 'low' | 'medium' | 'high';
  completed?: boolean;
  color?: string;
  reminder?: Date;
  category?: string;
  location?: string;
  attendees?: string[];
  recurring?: {
    type: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CalendarViewType {
  type: 'month' | 'week' | 'day' | 'agenda';
  date: Date;
}

export interface CalendarFilter {
  categories: string[];
  types: CalendarEvent['type'][];
  priorities: CalendarEvent['priority'][];
  completed?: boolean;
}

export interface CountdownEvent {
  id: string;
  title: string;
  targetDate: Date;
  type: 'task' | 'milestone';
  priority: CalendarEvent['priority'];
  category?: string;
  location?: string;
  daysLeft: number;
  hoursLeft: number;
  minutesLeft: number;
  isOverdue?: boolean;
}

export interface CalendarStats {
  totalEvents: number;
  completedTasks: number;
  pendingTasks: number;
  upcomingEvents: number;
  overdueEvents: number;
} 