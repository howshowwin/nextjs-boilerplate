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

  // 避免 SSR/CSR 時區差異導致的 Hydration Mismatch
  const [todayDateString, setTodayDateString] = useState('');
  const [currentMonthStr, setCurrentMonthStr] = useState('');

  // 避免 SSR/CSR 事件資料差異，只在客戶端渲染事件
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const today = new Date();
    setTodayDateString(today.toDateString());
    setCurrentMonthStr(currentDate.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' }));
  }, [currentDate]);

  // 當模態框開啟時，鎖定捲動並隱藏底部導航
  useEffect(() => {
    if (showEventModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  }, [showEventModal]);

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

  // 將 Date 對象轉換為本地日期字串 (YYYY-MM-DD)
  const dateToLocalString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

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
      setFormData(prev => ({ ...prev, date: dateToLocalString(date) }));
    }
    setShowEventModal(true);
  };

  // 開啟編輯事件對話框
  const openEditEventModal = (event: CalendarEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      date: dateToLocalString(event.date),
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


  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'milestone': return <ExclamationTriangleIcon className="w-3 h-3" />;
      case 'event': return <CalendarDaysIcon className="w-3 h-3" />;
      case 'task': return <CheckCircleIcon className="w-3 h-3" />;
      default: return <CalendarDaysIcon className="w-3 h-3" />;
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Apple-style Header */}
      <div className="material-thick sticky top-0 z-40 border-b border-opacity-20" style={{ borderColor: 'var(--separator)' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-title-1" style={{ color: 'var(--foreground)' }}>
              行事曆
            </h1>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="interactive-scale p-3 rounded-2xl transition-all duration-200"
                style={{ 
                  background: showFilters ? 'var(--accent)' : 'var(--surface-secondary)',
                  color: showFilters ? 'white' : 'var(--foreground-secondary)'
                }}
              >
                <FunnelIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => openAddEventModal()}
                className="interactive-scale btn-primary"
                style={{ padding: '12px', minHeight: 'auto' }}
              >
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Apple Search Bar */}
          <div className="relative mb-4">
            <div 
              className="relative flex items-center rounded-2xl transition-all duration-200"
              style={{ 
                background: 'var(--surface-secondary)',
                border: '0.5px solid var(--separator)'
              }}
            >
              <MagnifyingGlassIcon 
                className="w-5 h-5 ml-4" 
                style={{ color: 'var(--foreground-tertiary)' }} 
              />
              <input
                type="text"
                placeholder="搜尋事件..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent px-3 py-3 text-body focus:outline-none"
                style={{ 
                  color: 'var(--foreground)',
                  fontFamily: 'var(--font-system)'
                }}
              />
            </div>
          </div>

          {/* Apple Segmented Control */}
          <div 
            className="flex rounded-2xl p-1"
            style={{ background: 'var(--surface-secondary)' }}
          >
            <button
              onClick={() => setViewMode('month')}
              className={`flex-1 px-4 py-2 rounded-xl text-subheadline font-medium transition-all duration-200 ${
                viewMode === 'month' ? 'interactive-scale' : ''
              }`}
              style={{
                background: viewMode === 'month' ? 'var(--surface)' : 'transparent',
                color: viewMode === 'month' ? 'var(--foreground)' : 'var(--foreground-secondary)',
                boxShadow: viewMode === 'month' ? 'var(--shadow-1)' : 'none'
              }}
            >
              月曆
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 px-4 py-2 rounded-xl text-subheadline font-medium transition-all duration-200 ${
                viewMode === 'list' ? 'interactive-scale' : ''
              }`}
              style={{
                background: viewMode === 'list' ? 'var(--surface)' : 'transparent',
                color: viewMode === 'list' ? 'var(--foreground)' : 'var(--foreground-secondary)',
                boxShadow: viewMode === 'list' ? 'var(--shadow-1)' : 'none'
              }}
            >
              列表
            </button>
          </div>
        </div>
      </div>

      {/* Apple-style Filters */}
      {showFilters && (
        <div 
          className="material-regular border-b border-opacity-20" 
          style={{ borderColor: 'var(--separator)' }}
        >
          <div className="max-w-6xl mx-auto px-6 py-6 lg:px-8">
            <div className="space-y-6">
              {/* 類型篩選 */}
              <div>
                <label className="text-headline mb-4 block" style={{ color: 'var(--foreground)' }}>
                  事件類型
                </label>
                <div className="flex flex-wrap gap-3">
                  {['task', 'event', 'milestone'].map(type => (
                    <button
                      key={type}
                      onClick={() => {
                        const newTypes = filter.types.includes(type as any)
                          ? filter.types.filter(t => t !== type)
                          : [...filter.types, type as any];
                        setFilter({ types: newTypes });
                      }}
                      className={`interactive-scale px-4 py-2 rounded-2xl text-callout font-medium transition-all duration-200 ${
                        filter.types.includes(type as any)
                          ? 'tag-accent'
                          : 'tag'
                      }`}
                    >
                      {type === 'task' ? '任務' : type === 'event' ? '事件' : '重大事件'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 優先順序篩選 */}
              <div>
                <label className="text-headline mb-4 block" style={{ color: 'var(--foreground)' }}>
                  優先順序
                </label>
                <div className="flex flex-wrap gap-3">
                  {['high', 'medium', 'low'].map(priority => (
                    <button
                      key={priority}
                      onClick={() => {
                        const newPriorities = filter.priorities.includes(priority as any)
                          ? filter.priorities.filter(p => p !== priority)
                          : [...filter.priorities, priority as any];
                        setFilter({ priorities: newPriorities });
                      }}
                      className={`interactive-scale px-4 py-2 rounded-2xl text-callout font-medium transition-all duration-200 ${
                        filter.priorities.includes(priority as any)
                          ? (priority === 'high' ? 'tag-destructive' : 
                             priority === 'medium' ? 'tag-warning' : 'tag-success')
                          : 'tag'
                      }`}
                    >
                      {priority === 'high' ? '高優先' : priority === 'medium' ? '中優先' : '低優先'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 完成狀態篩選 */}
              <div>
                <label className="text-headline mb-4 block" style={{ color: 'var(--foreground)' }}>
                  完成狀態
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setFilter({ completed: undefined })}
                    className={`interactive-scale px-4 py-2 rounded-2xl text-callout font-medium transition-all duration-200 ${
                      filter.completed === undefined ? 'tag-accent' : 'tag'
                    }`}
                  >
                    全部
                  </button>
                  <button
                    onClick={() => setFilter({ completed: false })}
                    className={`interactive-scale px-4 py-2 rounded-2xl text-callout font-medium transition-all duration-200 ${
                      filter.completed === false ? 'tag-warning' : 'tag'
                    }`}
                  >
                    未完成
                  </button>
                  <button
                    onClick={() => setFilter({ completed: true })}
                    className={`interactive-scale px-4 py-2 rounded-2xl text-callout font-medium transition-all duration-200 ${
                      filter.completed === true ? 'tag-success' : 'tag'
                    }`}
                  >
                    已完成
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <div className="max-w-6xl mx-auto px-6 py-8 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent" style={{ borderColor: 'var(--accent)' }}></div>
          </div>
        ) : viewMode === 'month' ? (
          <div className="card-primary p-6 animate-fade-in" suppressHydrationWarning>
            {/* Apple-style Month Navigation */}
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                className="interactive-scale p-3 rounded-2xl transition-all duration-200"
                style={{ 
                  background: 'var(--surface-secondary)',
                  color: 'var(--foreground-secondary)'
                }}
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </button>
              
              <h2 className="text-title-2" style={{ color: 'var(--foreground)' }}>
                <span suppressHydrationWarning>{currentMonthStr}</span>
              </h2>
              
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                className="interactive-scale p-3 rounded-2xl transition-all duration-200"
                style={{ 
                  background: 'var(--surface-secondary)',
                  color: 'var(--foreground-secondary)'
                }}
              >
                <ChevronRightIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Apple-style Weekday Headers */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                <div 
                  key={day} 
                  className="text-center text-footnote font-semibold py-3" 
                  style={{ color: 'var(--foreground-tertiary)' }}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Apple-style Calendar Grid */}
            <div className="grid grid-cols-7 gap-2" suppressHydrationWarning>
              {calendarDays.map((day, index) => {
                const dayEvents = getDayEvents(day);
                const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                const isToday = todayDateString && day.toDateString() === todayDateString;
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
                      relative min-h-[80px] p-3 rounded-2xl cursor-pointer transition-all duration-200
                      ${isCurrentMonth 
                        ? 'hover:scale-[1.02] interactive-scale' 
                        : 'opacity-50'
                      }
                      ${isSelected ? 'ring-2' : ''}
                    `}
                    style={{ 
                      background: isCurrentMonth 
                        ? (isToday ? 'rgba(0, 122, 255, 0.1)' : 'var(--surface-secondary)')
                        : 'transparent',
                      border: isToday ? '1px solid var(--accent)' : '0.5px solid var(--separator)',
                      '--tw-ring-color': isSelected ? 'var(--accent)' : 'transparent'
                    } as any}
                  >
                    <div 
                      className={`text-callout font-semibold mb-2 ${
                        isToday ? 'w-7 h-7 rounded-full flex items-center justify-center text-white' : ''
                      }`}
                      style={{ 
                        color: isCurrentMonth 
                          ? (isToday ? 'white' : 'var(--foreground)') 
                          : 'var(--foreground-tertiary)',
                        background: isToday ? 'var(--accent)' : 'transparent'
                      }}
                    >
                      {day.getDate()}
                    </div>
                    
                    {/* Apple-style Event Indicators */}
                    <div className="space-y-1">
                      {isMounted && dayEvents.slice(0, 2).map((event, eventIndex) => (
                        <div
                          key={eventIndex}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditEventModal(event);
                          }}
                          className={`
                            flex items-center space-x-2 px-2 py-1 rounded-lg text-caption-1 truncate transition-all duration-200
                            hover:scale-105 cursor-pointer
                            ${event.completed ? 'opacity-60 line-through' : ''}
                          `}
                          style={{
                            background: event.type === 'milestone' 
                              ? 'rgba(88, 86, 214, 0.1)' 
                              : event.type === 'event' 
                              ? 'rgba(0, 122, 255, 0.1)' 
                              : 'rgba(52, 199, 89, 0.1)',
                            color: event.type === 'milestone' 
                              ? 'var(--accent-secondary)' 
                              : event.type === 'event' 
                              ? 'var(--accent)' 
                              : 'var(--success)',
                            border: `0.5px solid ${
                              event.type === 'milestone' 
                                ? 'rgba(88, 86, 214, 0.3)' 
                                : event.type === 'event' 
                                ? 'rgba(0, 122, 255, 0.3)' 
                                : 'rgba(52, 199, 89, 0.3)'
                            }`
                          }}
                        >
                          <div className="flex items-center space-x-1 flex-1 min-w-0">
                            {getTypeIcon(event.type)}
                            <span className="truncate font-medium">{event.title}</span>
                          </div>
                          <div 
                            className="w-2 h-2 rounded-full flex-shrink-0" 
                            style={{
                              background: event.priority === 'high' 
                                ? 'var(--destructive)' 
                                : event.priority === 'medium' 
                                ? 'var(--warning)' 
                                : 'var(--success)'
                            }}
                          />
                        </div>
                      ))}
                      {isMounted && dayEvents.length > 2 && (
                        <div 
                          className="text-caption-2 px-2 py-1 rounded-lg" 
                          style={{ 
                            color: 'var(--foreground-tertiary)',
                            background: 'var(--surface-tertiary)'
                          }}
                        >
                          +{dayEvents.length - 2} 個事件
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          // Apple-style List View
          <div className="space-y-4 animate-fade-in" suppressHydrationWarning>
            {!isMounted ? (
              <div className="card-primary p-12 text-center animate-pulse">
                <div className="space-y-3">
                  <div 
                    className="h-4 rounded-2xl w-1/2 mx-auto" 
                    style={{ background: 'var(--surface-secondary)' }}
                  ></div>
                  <div 
                    className="h-3 rounded-2xl w-1/3 mx-auto" 
                    style={{ background: 'var(--surface-secondary)' }}
                  ></div>
                </div>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="card-primary p-12 text-center animate-spring-up">
                <div 
                  className="w-16 h-16 mx-auto mb-6 rounded-3xl flex items-center justify-center"
                  style={{ background: 'rgba(0, 122, 255, 0.1)' }}
                >
                  <CalendarDaysIcon className="w-8 h-8" style={{ color: 'var(--accent)' }} />
                </div>
                <h3 className="text-title-3 mb-2" style={{ color: 'var(--foreground)' }}>
                  沒有找到符合條件的事件
                </h3>
                <p className="text-body" style={{ color: 'var(--foreground-secondary)' }}>
                  嘗試調整篩選條件或新增事件
                </p>
              </div>
            ) : (
              isMounted && filteredEvents.map((event, index) => (
                <div
                  key={event.id}
                  className={`
                    card-primary p-6 animate-slide-in-right
                    ${event.completed ? 'opacity-75' : ''}
                  `}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  suppressHydrationWarning
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <button
                          onClick={() => toggleEventCompletion(event.id)}
                          className={`
                            w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 interactive-scale
                            ${event.completed 
                              ? 'border-none text-white' 
                              : 'hover:scale-110'
                            }
                          `}
                          style={{
                            background: event.completed ? 'var(--success)' : 'transparent',
                            borderColor: event.completed ? 'var(--success)' : 'var(--separator)'
                          }}
                        >
                          {event.completed && <CheckCircleIconSolid className="w-4 h-4" />}
                        </button>
                        <h3 className={`text-headline ${event.completed ? 'line-through' : ''}`}
                            style={{ color: 'var(--foreground)' }}>
                          {event.title}
                        </h3>
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{
                            background: event.priority === 'high' 
                              ? 'var(--destructive)' 
                              : event.priority === 'medium' 
                              ? 'var(--warning)' 
                              : 'var(--success)'
                          }}
                        />
                      </div>
                      
                      {event.description && (
                        <p className="text-subheadline mb-3" style={{ color: 'var(--foreground-secondary)' }}>
                          {event.description}
                        </p>
                      )}
                      
                      <div className="flex items-center flex-wrap gap-4 text-footnote mb-3" style={{ color: 'var(--foreground-tertiary)' }}>
                        <div className="flex items-center space-x-2">
                          <CalendarDaysIcon className="w-4 h-4" />
                          <span suppressHydrationWarning>{event.date.toLocaleDateString('zh-TW')}</span>
                        </div>
                        
                        {event.startTime && (
                          <div className="flex items-center space-x-2">
                            <ClockIcon className="w-4 h-4" />
                            <span>{event.startTime}</span>
                          </div>
                        )}
                        
                        {event.location && (
                          <div className="flex items-center space-x-2">
                            <MapPinIcon className="w-4 h-4" />
                            <span className="truncate max-w-32">{event.location}</span>
                          </div>
                        )}
                        
                        {event.category && (
                          <div className="flex items-center space-x-2">
                            <TagIcon className="w-4 h-4" />
                            <span>{event.category}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className={`
                          tag ${event.type === 'milestone' ? 'tag-accent' :
                                event.type === 'event' ? 'tag' :
                                'tag-success'}
                        `}>
                          {event.type === 'milestone' ? '重大事件' : event.type === 'event' ? '事件' : '任務'}
                        </span>
                        
                        <span className={`
                          tag ${event.priority === 'high' ? 'tag-destructive' :
                                event.priority === 'medium' ? 'tag-warning' :
                                'tag-success'}
                        `}>
                          {event.priority === 'high' ? '高優先' : event.priority === 'medium' ? '中優先' : '低優先'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 ml-4">
                      <button
                        onClick={() => openEditEventModal(event)}
                        className="interactive-scale px-4 py-2 rounded-2xl text-callout font-medium transition-all duration-200"
                        style={{ 
                          background: 'var(--accent)',
                          color: 'white'
                        }}
                      >
                        編輯
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="interactive-scale px-4 py-2 rounded-2xl text-callout font-medium transition-all duration-200"
                        style={{ 
                          background: 'var(--destructive)',
                          color: 'white'
                        }}
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

      {/* Apple-style Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-6">
          <div className="modal-content w-full max-w-lg animate-spring-up">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-title-2" style={{ color: 'var(--foreground)' }}>
                  {editingEvent ? '編輯事件' : '新增事件'}
                </h3>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="interactive-scale p-3 rounded-2xl transition-all duration-200"
                  style={{ 
                    background: 'var(--surface-secondary)',
                    color: 'var(--foreground-secondary)'
                  }}
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-headline mb-3 block" style={{ color: 'var(--foreground)' }}>
                    標題 *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="input-apple w-full"
                    placeholder="輸入事件標題"
                  />
                </div>

                <div>
                  <label className="text-headline mb-3 block" style={{ color: 'var(--foreground)' }}>
                    描述
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="input-apple w-full min-h-[100px] resize-none"
                    placeholder="輸入事件描述"
                  />
                </div>

                <div>
                  <label className="text-headline mb-3 block" style={{ color: 'var(--foreground)' }}>
                    日期 *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="input-apple w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-headline mb-3 block" style={{ color: 'var(--foreground)' }}>
                      開始時間
                    </label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                      className="input-apple w-full"
                    />
                  </div>
                  <div>
                    <label className="text-headline mb-3 block" style={{ color: 'var(--foreground)' }}>
                      結束時間
                    </label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                      className="input-apple w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-headline mb-3 block" style={{ color: 'var(--foreground)' }}>
                      類型
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                      className="input-apple w-full"
                    >
                      <option value="task">任務</option>
                      <option value="event">事件</option>
                      <option value="milestone">重大事件</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-headline mb-3 block" style={{ color: 'var(--foreground)' }}>
                      優先順序
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="input-apple w-full"
                    >
                      <option value="low">低優先</option>
                      <option value="medium">中優先</option>
                      <option value="high">高優先</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-headline mb-3 block" style={{ color: 'var(--foreground)' }}>
                    分類
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="input-apple w-full"
                    placeholder="例如：工作、個人、學習"
                  />
                </div>

                <div>
                  <label className="text-headline mb-3 block" style={{ color: 'var(--foreground)' }}>
                    地點
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="input-apple w-full"
                    placeholder="輸入地點"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4 mt-8">
                <button
                  onClick={() => setShowEventModal(false)}
                  className="btn-secondary interactive-scale"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveEvent}
                  disabled={!formData.title.trim() || !formData.date}
                  className="btn-primary interactive-scale disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingEvent ? '更新事件' : '新增事件'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 