'use client';

import { useEffect, useState } from 'react';
import { useCalendarStore } from '@/lib/store/calendar';
import { CalendarDaysIcon, CheckCircleIcon, ExclamationTriangleIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { PlusIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

interface CountdownData {
  tasks: any[];
  milestones: any[];
  stats: {
    totalTasks: number;
    totalMilestones: number;
    urgentTasks: number;
    urgentMilestones: number;
  };
}

export default function Home() {
  const { getCalendarStats, getUpcomingEvents, getOverdueEvents, loadEvents } = useCalendarStore();
  const [countdownData, setCountdownData] = useState<CountdownData>({
    tasks: [],
    milestones: [],
    stats: { totalTasks: 0, totalMilestones: 0, urgentTasks: 0, urgentMilestones: 0 }
  });
  const [, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    // 載入事件
    loadEvents();
    
    const updateCountdown = async () => {
      try {
        const response = await fetch('/api/calendar/countdown');
        const data = await response.json();
        
        // 轉換 API 數據結構為前端期望的格式
        const transformedData: CountdownData = {
          tasks: data.todoItems?.events || [],
          milestones: data.majorEvents?.events || [],
          stats: {
            totalTasks: data.todoItems?.stats?.total || 0,
            totalMilestones: data.majorEvents?.stats?.total || 0,
            urgentTasks: data.todoItems?.stats?.urgent || 0,
            urgentMilestones: data.majorEvents?.stats?.urgent || 0,
          }
        };
        
        setCountdownData(transformedData);
        setCurrentTime(new Date());
      } catch (error) {
        console.error('更新倒數計時失敗:', error);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // 每分鐘更新一次

    return () => clearInterval(interval);
  }, [loadEvents]);

  // 取得今日日期字串，避免 SSR / CSR 時區不一致造成 Hydration Mismatch
  const [todayStr, setTodayStr] = useState('');
  useEffect(() => {
    setTodayStr(
      new Date().toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      })
    );
  }, []);

  const stats = getCalendarStats();
  const upcomingEvents = getUpcomingEvents(3);
  const overdueEvents = getOverdueEvents();

  const formatCountdown = (event: any) => {
    const now = new Date();
    const targetDate = new Date(event.date_time);
    const timeDiff = targetDate.getTime() - now.getTime();
    
    if (timeDiff <= 0) {
      return '已逾期';
    }
    
    const daysLeft = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hoursLeft = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutesLeft = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (daysLeft > 0) {
      return `${daysLeft} 天 ${hoursLeft} 小時`;
    } else if (hoursLeft > 0) {
      return `${hoursLeft} 小時 ${minutesLeft} 分鐘`;
    } else {
      return `${minutesLeft} 分鐘`;
    }
  };


  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Apple-style Header */}
      <div className="material-thick sticky top-0 z-40 border-b border-opacity-20" style={{ borderColor: 'var(--separator)' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-title-1" style={{ color: 'var(--foreground)' }}>
                智能生活助手
              </h1>
              <p className="text-subheadline mt-1" style={{ color: 'var(--foreground-secondary)' }}>
                <span suppressHydrationWarning>{todayStr}</span>
              </p>
            </div>
            <Link
              href="/calendar"
              className="interactive-scale btn-primary"
              style={{
                background: 'var(--accent)',
                borderRadius: 'var(--radius-medium)',
                padding: '12px',
                minHeight: 'auto'
              }}
            >
              <PlusIcon className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-6xl mx-auto px-6 py-8 lg:px-8">
        {/* Desktop: 2-column grid, Mobile: 1-column */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards - Apple Card Style */}
            <div className="grid grid-cols-2 gap-4">
              <div className="card-primary p-6 animate-fade-in" suppressHydrationWarning>
                <div className="flex items-center space-x-4">
                  <div 
                    className="p-3 rounded-2xl"
                    style={{ 
                      background: 'rgba(0, 122, 255, 0.1)',
                      color: 'var(--accent)'
                    }}
                  >
                    <CalendarDaysIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-title-2" style={{ color: 'var(--foreground)' }} suppressHydrationWarning>
                      {stats.upcomingEvents}
                    </p>
                    <p className="text-footnote" style={{ color: 'var(--foreground-secondary)' }}>
                      即將到來
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="card-primary p-6 animate-fade-in" style={{ animationDelay: '0.1s' }} suppressHydrationWarning>
                <div className="flex items-center space-x-4">
                  <div 
                    className="p-3 rounded-2xl"
                    style={{ 
                      background: 'rgba(52, 199, 89, 0.1)',
                      color: 'var(--success)'
                    }}
                  >
                    <CheckCircleIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-title-2" style={{ color: 'var(--foreground)' }} suppressHydrationWarning>
                      {stats.completedTasks}
                    </p>
                    <p className="text-footnote" style={{ color: 'var(--foreground-secondary)' }}>
                      已完成
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions - Apple Style */}
            <div className="card-primary animate-fade-in" style={{ animationDelay: '0.2s' }} suppressHydrationWarning>
              <div className="p-6" style={{ borderBottom: '0.5px solid var(--separator)' }}>
                <h2 className="text-title-3" style={{ color: 'var(--foreground)' }}>
                  快速功能
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <Link
                    href="/calendar"
                    className="interactive-scale group p-6 rounded-2xl transition-all duration-200 hover:scale-105"
                    style={{ 
                      background: 'rgba(0, 122, 255, 0.08)',
                      border: '0.5px solid rgba(0, 122, 255, 0.2)'
                    }}
                  >
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div 
                        className="p-4 rounded-2xl"
                        style={{ 
                          background: 'var(--accent)',
                          color: 'white'
                        }}
                      >
                        <CalendarDaysIcon className="w-8 h-8" />
                      </div>
                      <span className="text-headline" style={{ color: 'var(--accent)' }}>
                        新增事件
                      </span>
                    </div>
                  </Link>
                  
                  <Link
                    href="/photos"
                    className="interactive-scale group p-6 rounded-2xl transition-all duration-200 hover:scale-105"
                    style={{ 
                      background: 'rgba(88, 86, 214, 0.08)',
                      border: '0.5px solid rgba(88, 86, 214, 0.2)'
                    }}
                  >
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div 
                        className="p-4 rounded-2xl"
                        style={{ 
                          background: 'var(--accent-secondary)',
                          color: 'white'
                        }}
                      >
                        <PhotoIcon className="w-8 h-8" />
                      </div>
                      <span className="text-headline" style={{ color: 'var(--accent-secondary)' }}>
                        查看相簿
                      </span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Task Countdown - Apple Style */}
            {countdownData.tasks.length > 0 && (
              <div className="card-primary animate-fade-in" style={{ animationDelay: '0.3s' }} suppressHydrationWarning>
                <div className="p-6" style={{ borderBottom: '0.5px solid var(--separator)' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CheckCircleIcon className="w-6 h-6" style={{ color: 'var(--accent)' }} />
                      <h2 className="text-title-3" style={{ color: 'var(--foreground)' }}>
                        代辦事項倒數
                      </h2>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-footnote" style={{ color: 'var(--foreground-secondary)' }}>
                        <span suppressHydrationWarning>{countdownData.stats.totalTasks}</span> 項任務
                      </span>
                      {countdownData.stats.urgentTasks > 0 && (
                        <span 
                          className="tag-destructive"
                          style={{ fontSize: '11px', padding: '4px 8px' }}
                        >
                          <span suppressHydrationWarning>{countdownData.stats.urgentTasks}</span> 項緊急
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {countdownData.tasks.slice(0, 3).map((task, index) => (
                    <div 
                      key={task.id} 
                      className="card-secondary p-4 animate-slide-in-right"
                      style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                      suppressHydrationWarning
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-headline mb-2" style={{ color: 'var(--foreground)' }}>
                            {task.title}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <span 
                              className={`tag ${task.priority === 'high' ? 'tag-destructive' : 
                                task.priority === 'medium' ? 'tag-warning' : 'tag-success'}`}
                              style={{ fontSize: '11px' }}
                            >
                              {task.priority === 'high' ? '高優先' : task.priority === 'medium' ? '中優先' : '低優先'}
                            </span>
                            {task.category && (
                              <span className="text-footnote" style={{ color: 'var(--foreground-tertiary)' }}>
                                {task.category}
                              </span>
                            )}
                            <span className="text-footnote" style={{ color: 'var(--foreground-tertiary)' }}>
                              <span suppressHydrationWarning>
                                {new Date(task.date_time).toLocaleDateString('zh-TW')}
                              </span>
                            </span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p 
                            className="text-title-3" 
                            style={{ color: 'var(--accent)' }} 
                            suppressHydrationWarning
                          >
                            {formatCountdown(task)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Sidebar Content */}
          <div className="lg:col-span-1 space-y-6">
            {/* Milestones */}
            {countdownData.milestones.length > 0 && (
              <div className="card-primary animate-fade-in" style={{ animationDelay: '0.4s' }} suppressHydrationWarning>
                <div className="p-4" style={{ borderBottom: '0.5px solid var(--separator)' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <ExclamationTriangleIcon 
                        className="w-5 h-5" 
                        style={{ color: 'var(--accent-secondary)' }} 
                      />
                      <h2 className="text-headline" style={{ color: 'var(--foreground)' }}>
                        重大事件
                      </h2>
                    </div>
                    <span className="text-caption-1" style={{ color: 'var(--foreground-tertiary)' }}>
                      <span suppressHydrationWarning>{countdownData.stats.totalMilestones}</span> 個事件
                    </span>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {countdownData.milestones.slice(0, 3).map((milestone, index) => (
                    <div 
                      key={milestone.id} 
                      className="card-secondary p-3 animate-slide-in-right"
                      style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                      suppressHydrationWarning
                    >
                      <h3 className="text-subheadline mb-2" style={{ color: 'var(--foreground)' }}>
                        {milestone.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="tag tag-accent" style={{ fontSize: '10px' }}>
                            重大事件
                          </span>
                          <span className="text-caption-2" style={{ color: 'var(--foreground-tertiary)' }}>
                            <span suppressHydrationWarning>
                              {new Date(milestone.date_time).toLocaleDateString('zh-TW')}
                            </span>
                          </span>
                        </div>
                        <p 
                          className="text-callout font-semibold" 
                          style={{ color: 'var(--accent-secondary)' }} 
                          suppressHydrationWarning
                        >
                          {formatCountdown(milestone)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Overdue Events */}
            {overdueEvents.length > 0 && (
              <div 
                className="card-primary animate-fade-in" 
                style={{ 
                  animationDelay: '0.5s',
                  borderColor: 'var(--destructive)',
                  background: 'rgba(255, 59, 48, 0.03)'
                }}
                suppressHydrationWarning
              >
                <div className="p-4" style={{ borderBottom: '0.5px solid var(--destructive)' }}>
                  <div className="flex items-center space-x-3">
                    <ExclamationTriangleIcon 
                      className="w-5 h-5" 
                      style={{ color: 'var(--destructive)' }} 
                    />
                    <h2 className="text-headline" style={{ color: 'var(--destructive)' }}>
                      逾期事項
                    </h2>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {overdueEvents.slice(0, 3).map((event) => (
                    <div 
                      key={event.id} 
                      className="card-secondary p-3"
                      style={{ 
                        background: 'rgba(255, 59, 48, 0.05)',
                        border: '0.5px solid rgba(255, 59, 48, 0.2)'
                      }}
                    >
                      <h3 className="text-subheadline mb-2" style={{ color: 'var(--destructive)' }}>
                        {event.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-caption-2" style={{ color: 'var(--destructive)' }}>
                          <span suppressHydrationWarning>
                            {event.date.toLocaleDateString('zh-TW')}
                          </span>
                        </span>
                        <span className="tag tag-destructive" style={{ fontSize: '10px' }}>
                          {event.priority === 'high' ? '高' : event.priority === 'medium' ? '中' : '低'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
              <div className="card-primary animate-fade-in" style={{ animationDelay: '0.6s' }} suppressHydrationWarning>
                <div className="p-4" style={{ borderBottom: '0.5px solid var(--separator)' }}>
                  <div className="flex items-center space-x-3">
                    <CalendarDaysIcon 
                      className="w-5 h-5" 
                      style={{ color: 'var(--foreground-secondary)' }} 
                    />
                    <h2 className="text-headline" style={{ color: 'var(--foreground)' }}>
                      即將到來
                    </h2>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {upcomingEvents.map((event, index) => (
                    <div 
                      key={event.id} 
                      className="card-secondary p-3 animate-slide-in-right"
                      style={{ animationDelay: `${0.7 + index * 0.1}s` }}
                      suppressHydrationWarning
                    >
                      <h3 className="text-subheadline mb-2" style={{ color: 'var(--foreground)' }}>
                        {event.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span 
                            className={`tag ${
                              event.type === 'milestone' ? 'tag-accent' : 
                              event.type === 'task' ? 'tag-success' : 'tag'
                            }`}
                            style={{ fontSize: '10px' }}
                          >
                            {event.type === 'milestone' ? '重大事件' : event.type === 'task' ? '任務' : '事件'}
                          </span>
                          <span className="text-caption-2" style={{ color: 'var(--foreground-tertiary)' }}>
                            <span suppressHydrationWarning>
                              {event.date.toLocaleDateString('zh-TW')}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Empty State - Apple Style */}
        {countdownData.tasks.length === 0 && countdownData.milestones.length === 0 && upcomingEvents.length === 0 && overdueEvents.length === 0 && (
          <div className="lg:col-span-3">
            <div className="card-primary p-12 text-center animate-spring-up">
              <div 
                className="w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center"
                style={{ background: 'rgba(0, 122, 255, 0.1)' }}
              >
                <CalendarDaysIcon className="w-12 h-12" style={{ color: 'var(--accent)' }} />
              </div>
              <h3 className="text-title-3 mb-3" style={{ color: 'var(--foreground)' }}>
                還沒有任何事件
              </h3>
              <p className="text-body mb-8" style={{ color: 'var(--foreground-secondary)' }}>
                開始建立您的第一個任務或事件
              </p>
              <Link
                href="/calendar"
                className="btn-primary interactive-scale"
              >
                <PlusIcon className="w-5 h-5" />
                新增事件
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
