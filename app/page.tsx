'use client';

import { useEffect, useState } from 'react';
import { useCalendarStore } from '@/lib/store/calendar';
import { CountdownEvent } from '@/lib/types/calendar';
import { ClockIcon, CalendarDaysIcon, CheckCircleIcon, ExclamationTriangleIcon, PhotoIcon } from '@heroicons/react/24/outline';
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
  const [currentTime, setCurrentTime] = useState(new Date());

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header */}
      <div className="bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                智能生活助手
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {new Date().toLocaleDateString('zh-TW', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  weekday: 'long'
                })}
              </p>
            </div>
            <Link
              href="/calendar"
              className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <CalendarDaysIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.upcomingEvents}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">即將到來</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completedTasks}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">已完成</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">快速功能</h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/calendar"
                className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <CalendarDaysIcon className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">新增事件</span>
              </Link>
              <Link
                href="/photos"
                className="flex flex-col items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
              >
                <PhotoIcon className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2" />
                <span className="text-sm font-medium text-purple-900 dark:text-purple-100">查看相簿</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 代辦事項倒數 */}
        {countdownData.tasks.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">代辦事項倒數</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {countdownData.stats.totalTasks} 項任務
                  </span>
                  {countdownData.stats.urgentTasks > 0 && (
                    <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-full">
                      {countdownData.stats.urgentTasks} 項緊急
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {countdownData.tasks.slice(0, 3).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">{task.title}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority === 'high' ? '高優先' : task.priority === 'medium' ? '中優先' : '低優先'}
                      </span>
                      {task.category && (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {task.category}
                        </span>
                      )}
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(task.date_time).toLocaleDateString('zh-TW')}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {formatCountdown(task)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 重大事件倒數 */}
        {countdownData.milestones.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">重大事件倒數</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {countdownData.stats.totalMilestones} 個事件
                  </span>
                  {countdownData.stats.urgentMilestones > 0 && (
                    <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs rounded-full">
                      {countdownData.stats.urgentMilestones} 個緊急
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {countdownData.milestones.slice(0, 3).map((milestone) => (
                <div key={milestone.id} className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">{milestone.title}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(milestone.priority)}`}>
                        重大事件
                      </span>
                      {milestone.category && (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {milestone.category}
                        </span>
                      )}
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(milestone.date_time).toLocaleDateString('zh-TW')}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
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
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-red-200 dark:border-red-800">
            <div className="p-4 border-b border-red-200 dark:border-red-800">
              <div className="flex items-center space-x-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                <h2 className="text-lg font-semibold text-red-900 dark:text-red-100">逾期事項</h2>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {overdueEvents.slice(0, 3).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-red-900 dark:text-red-100">{event.title}</h3>
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {event.date.toLocaleDateString('zh-TW')}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(event.priority)}`}>
                    {event.priority === 'high' ? '高' : event.priority === 'medium' ? '中' : '低'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center space-x-2">
                <CalendarDaysIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">即將到來</h2>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">{event.title}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(event.priority)}`}>
                        {event.type === 'milestone' ? '重大事件' : event.type === 'task' ? '任務' : '事件'}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {event.date.toLocaleDateString('zh-TW')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {countdownData.tasks.length === 0 && countdownData.milestones.length === 0 && upcomingEvents.length === 0 && overdueEvents.length === 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-8 text-center">
            <CalendarDaysIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              還沒有任何事件
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              開始建立您的第一個任務或事件
            </p>
            <Link
              href="/calendar"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              新增事件
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
