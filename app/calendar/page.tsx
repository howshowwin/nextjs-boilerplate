'use client';

import { useState, useEffect } from 'react';
import { useCalendarStore } from '@/lib/store/calendar';
import { CalendarEvent } from '@/lib/types/calendar';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  MapPinIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';

export default function CalendarPage() {
  const { 
    events, 
    loading,
    loadEvents,
    addEvent, 
    updateEvent, 
    deleteEvent, 
    toggleEventCompletion,
    getEventsByDate,
    getEventsByMonth,
    searchEvents,
    filter,
    setFilter
  } = useCalendarStore();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month');

  // 載入事件
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // 表單狀態
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    type: 'task' as CalendarEvent['type'],
    priority: 'medium' as CalendarEvent['priority'],
    category: '',
    location: '',
  });

  // 重置表單
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      startTime: '',
      endTime: '',
      type: 'task',
      priority: 'medium',
      category: '',
      location: '',
    });
    setEditingEvent(null);
  };

  // 開啟新增事件對話框
  const openAddEventModal = (date?: Date) => {
    resetForm();
    if (date) {
      setFormData(prev => ({ ...prev, date: date.toISOString().split('T')[0] }));
    }
    setShowEventModal(true);
  };

  // 開啟編輯事件對話框
  const openEditEventModal = (event: CalendarEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      date: event.date.toISOString().split('T')[0],
      startTime: event.startTime || '',
      endTime: event.endTime || '',
      type: event.type,
      priority: event.priority,
      category: event.category || '',
      location: event.location || '',
    });
    setShowEventModal(true);
  };

  // 儲存事件
  const handleSaveEvent = async () => {
    if (!formData.title.trim()) return;

    const eventData = {
      ...formData,
      date: new Date(formData.date),
      startTime: formData.startTime || undefined,
      endTime: formData.endTime || undefined,
      description: formData.description || undefined,
      category: formData.category || undefined,
      location: formData.location || undefined,
    };

    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, eventData);
      } else {
        await addEvent(eventData);
      }

      setShowEventModal(false);
      resetForm();
    } catch (error) {
      console.error('儲存事件失敗:', error);
      alert('儲存事件失敗，請重試');
    }
  };

  // 刪除事件
  const handleDeleteEvent = async (eventId: string) => {
    if (confirm('確定要刪除這個事件嗎？')) {
      try {
        await deleteEvent(eventId);
      } catch (error) {
        console.error('刪除事件失敗:', error);
        alert('刪除事件失敗，請重試');
      }
    }
  };

  // 取得月曆資料
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  // 取得當天的事件
  const getDayEvents = (date: Date) => {
    return getEventsByDate(date);
  };

  // 過濾事件
  const getFilteredEvents = () => {
    let filteredEvents = events;

    if (searchQuery) {
      filteredEvents = searchEvents(searchQuery);
    }

    // 應用篩選器
    filteredEvents = filteredEvents.filter(event => {
      const matchesType = filter.types.length === 0 || filter.types.includes(event.type);
      const matchesPriority = filter.priorities.length === 0 || filter.priorities.includes(event.priority);
      const matchesCompleted = filter.completed === undefined || event.completed === filter.completed;
      return matchesType && matchesPriority && matchesCompleted;
    });

    return filteredEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const calendarDays = getCalendarDays();
  const filteredEvents = getFilteredEvents();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'milestone': return <ExclamationTriangleIcon className="w-3 h-3" />;
      case 'event': return <CalendarDaysIcon className="w-3 h-3" />;
      case 'task': return <CheckCircleIcon className="w-3 h-3" />;
      default: return <CalendarDaysIcon className="w-3 h-3" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header */}
      <div className="bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">行事曆</h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <FunnelIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => openAddEventModal()}
                className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 搜尋欄 */}
          <div className="relative mb-4">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜尋事件..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            />
          </div>

          {/* 檢視模式切換 */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              月曆
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              列表
            </button>
          </div>
        </div>
      </div>

      {/* 篩選器 */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4">
          <div className="max-w-lg mx-auto space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">類型</label>
              <div className="flex flex-wrap gap-2">
                {['task', 'event', 'milestone'].map(type => (
                  <button
                    key={type}
                    onClick={() => {
                      const newTypes = filter.types.includes(type as any)
                        ? filter.types.filter(t => t !== type)
                        : [...filter.types, type as any];
                      setFilter({ types: newTypes });
                    }}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      filter.types.includes(type as any)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {type === 'task' ? '任務' : type === 'event' ? '事件' : '重大事件'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">優先順序</label>
              <div className="flex flex-wrap gap-2">
                {['high', 'medium', 'low'].map(priority => (
                  <button
                    key={priority}
                    onClick={() => {
                      const newPriorities = filter.priorities.includes(priority as any)
                        ? filter.priorities.filter(p => p !== priority)
                        : [...filter.priorities, priority as any];
                      setFilter({ priorities: newPriorities });
                    }}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      filter.priorities.includes(priority as any)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {priority === 'high' ? '高' : priority === 'medium' ? '中' : '低'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-lg mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : viewMode === 'month' ? (
          <>
            {/* 月曆導航 */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                className="p-2 rounded-lg bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <ChevronLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {currentDate.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' })}
              </h2>
              
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                className="p-2 rounded-lg bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <ChevronRightIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* 星期標題 */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* 月曆格子 */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                const dayEvents = getDayEvents(day);
                const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                const isToday = day.toDateString() === new Date().toDateString();
                const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString();
                
                return (
                  <div
                    key={index}
                    onClick={() => {
                      setSelectedDate(day);
                      if (dayEvents.length === 0) {
                        openAddEventModal(day);
                      }
                    }}
                    className={`
                      relative min-h-[60px] p-1 rounded-lg cursor-pointer transition-colors
                      ${isCurrentMonth ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}
                      ${isToday ? 'ring-2 ring-blue-500' : ''}
                      ${isSelected ? 'ring-2 ring-blue-300' : ''}
                      hover:bg-gray-50 dark:hover:bg-gray-800
                      border border-gray-200 dark:border-gray-700
                    `}
                  >
                    <div className={`text-sm font-medium ${
                      isCurrentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'
                    }`}>
                      {day.getDate()}
                    </div>
                    
                    {/* 事件指示器 */}
                    <div className="space-y-1 mt-1">
                      {dayEvents.slice(0, 2).map((event, eventIndex) => (
                        <div
                          key={eventIndex}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditEventModal(event);
                          }}
                          className={`
                            flex items-center space-x-1 px-1 py-0.5 rounded text-xs truncate
                            ${event.completed ? 'opacity-50 line-through' : ''}
                            ${event.type === 'milestone' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
                              event.type === 'event' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                              'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'}
                          `}
                        >
                          {getTypeIcon(event.type)}
                          <span className="truncate">{event.title}</span>
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(event.priority)}`} />
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 px-1">
                          +{dayEvents.length - 2} 更多
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          // 列表檢視
          <div className="space-y-4">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-8">
                <CalendarDaysIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">沒有找到符合條件的事件</p>
              </div>
            ) : (
              filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className={`
                    bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-800
                    ${event.completed ? 'opacity-75' : ''}
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <button
                          onClick={() => toggleEventCompletion(event.id)}
                          className={`
                            w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                            ${event.completed 
                              ? 'bg-green-500 border-green-500 text-white' 
                              : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
                            }
                          `}
                        >
                          {event.completed && <CheckCircleIconSolid className="w-3 h-3" />}
                        </button>
                        <h3 className={`font-medium text-gray-900 dark:text-white ${
                          event.completed ? 'line-through' : ''
                        }`}>
                          {event.title}
                        </h3>
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(event.priority)}`} />
                      </div>
                      
                      {event.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {event.description}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <CalendarDaysIcon className="w-4 h-4" />
                          <span>{event.date.toLocaleDateString('zh-TW')}</span>
                        </div>
                        
                        {event.startTime && (
                          <div className="flex items-center space-x-1">
                            <ClockIcon className="w-4 h-4" />
                            <span>{event.startTime}</span>
                          </div>
                        )}
                        
                        {event.location && (
                          <div className="flex items-center space-x-1">
                            <MapPinIcon className="w-4 h-4" />
                            <span>{event.location}</span>
                          </div>
                        )}
                        
                        {event.category && (
                          <div className="flex items-center space-x-1">
                            <TagIcon className="w-4 h-4" />
                            <span>{event.category}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`
                          px-2 py-1 rounded-full text-xs font-medium
                          ${event.type === 'milestone' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
                            event.type === 'event' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                            'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'}
                        `}>
                          {event.type === 'milestone' ? '重大事件' : event.type === 'event' ? '事件' : '任務'}
                        </span>
                        
                        <span className={`
                          px-2 py-1 rounded-full text-xs font-medium
                          ${event.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                            event.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                            'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'}
                        `}>
                          {event.priority === 'high' ? '高優先' : event.priority === 'medium' ? '中優先' : '低優先'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openEditEventModal(event)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                      >
                        編輯
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium"
                      >
                        刪除
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 事件編輯對話框 */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {editingEvent ? '編輯事件' : '新增事件'}
                </h3>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    標題 *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="輸入事件標題"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    描述
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    rows={3}
                    placeholder="輸入事件描述"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    日期 *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      開始時間
                    </label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      結束時間
                    </label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      類型
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="task">任務</option>
                      <option value="event">事件</option>
                      <option value="milestone">重大事件</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      優先順序
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="low">低</option>
                      <option value="medium">中</option>
                      <option value="high">高</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    分類
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="例如：工作、個人、學習"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    地點
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="輸入地點"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveEvent}
                  disabled={!formData.title.trim() || !formData.date}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {editingEvent ? '更新' : '新增'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 