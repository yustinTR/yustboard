'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { FiPlus, FiCalendar, FiClock, FiEdit, FiTrash2, FiLoader, FiX, FiList, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { format, parseISO, addHours, startOfDay, endOfDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { Task } from '@/utils/google/google-calendar';

// Helper function to ensure a task has proper Date objects
function ensureTaskDates(task: { id: string; title: string; description?: string; date: Date | string; endDate?: Date | string; completed: boolean }): Task {
  return {
    ...task,
    date: task.date instanceof Date ? task.date : new Date(task.date),
    endDate: task.endDate ? (task.endDate instanceof Date ? task.endDate : new Date(task.endDate)) : undefined,
  };
}

// Calendar Grid Component
interface CalendarGridProps {
  currentMonth: Date;
  tasks: Task[];
  onDateClick: (date: Date) => void;
  onTaskClick: (task: Task) => void;
}

function CalendarGrid({ currentMonth, tasks, onDateClick, onTaskClick }: CalendarGridProps) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfDay(monthStart);
  const endDate = endOfDay(monthEnd);

  const dateFormat = "d";
  const rows: React.JSX.Element[] = [];

  let days: React.JSX.Element[] = [];

  // Create array of days in the month
  const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });
  
  // Add empty cells for days before the month starts
  const startDayOfWeek = getDay(startDate);
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(
      <div key={`empty-${i}`} className="p-2 h-32 bg-gray-50 dark:bg-gray-800"></div>
    );
  }

  // Add days of the month
  daysInMonth.forEach((day) => {
    const dayTasks = tasks.filter(task => 
      isSameDay(task.date, day)
    );
    
    const isToday = isSameDay(day, new Date());
    const isCurrentMonth = isSameMonth(day, monthStart);

    days.push(
      <div
        key={day.toString()}
        className={`p-2 h-32 border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
          !isCurrentMonth ? "bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-600" : ""
        } ${isToday ? "bg-blue-50" : ""}`}
        onClick={() => onDateClick(day)}
      >
        <div className={`text-sm font-medium ${isToday ? "text-blue-600" : ""}`}>
          {format(day, dateFormat)}
        </div>
        <div className="mt-1 space-y-1 overflow-y-auto max-h-20">
          {dayTasks.slice(0, 3).map((task) => (
            <div
              key={task.id}
              className="text-xs p-1 bg-blue-100 text-blue-800 rounded truncate hover:bg-blue-200 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onTaskClick(task);
              }}
            >
              {task.isAllDay ? (
                <span>{task.title}</span>
              ) : (
                <span>{format(task.date, 'HH:mm')} {task.title}</span>
              )}
            </div>
          ))}
          {dayTasks.length > 3 && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              +{dayTasks.length - 3} more
            </div>
          )}
        </div>
      </div>
    );

    // Start new row after Saturday
    if (getDay(day) === 6) {
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
  });

  // Add empty cells for days after the month ends
  if (days.length > 0) {
    for (let i = days.length; i < 7; i++) {
      days.push(
        <div key={`empty-end-${i}`} className="p-2 h-32 bg-gray-50"></div>
      );
    }
    rows.push(
      <div className="grid grid-cols-7" key="last-row">
        {days}
      </div>
    );
  }

  return (
    <div>
      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-700 dark:text-gray-300 py-2">
            {day}
          </div>
        ))}
      </div>
      {/* Calendar days */}
      <div className="border-t border-l border-gray-200">
        {rows}
      </div>
    </div>
  );
}

export default function AgendaPage() {
  const { status } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [viewType, setViewType] = useState<'list' | 'calendar'>('list');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    endTime: '',
    location: '',
    isAllDay: false,
  });

  // Fetch tasks from Google Calendar
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const timeMin = startOfMonth(subMonths(currentMonth, 1)).toISOString();
      const timeMax = endOfMonth(addMonths(currentMonth, 1)).toISOString();
      
      const res = await fetch(`/api/calendar?timeMin=${timeMin}&timeMax=${timeMax}`);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch calendar events');
      }
      
      const data = await res.json();
      
      // Ensure all tasks have proper Date objects
      const tasksWithDates = data.map(ensureTaskDates);
      setTasks(tasksWithDates);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err instanceof Error ? err.message : 'Failed to load your calendar events');
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  // Create a new task
  const createTask = async () => {
    try {
      setError(null);
      
      let dateObj: Date;
      let endDateObj: Date | undefined;
      
      if (formData.isAllDay) {
        dateObj = new Date(formData.date);
        endDateObj = formData.endTime 
          ? new Date(`${formData.date}T${formData.endTime}`)
          : undefined;
      } else {
        dateObj = new Date(`${formData.date}T${formData.time || '00:00'}`);
        endDateObj = formData.endTime 
          ? new Date(`${formData.date}T${formData.endTime}`) 
          : addHours(dateObj, 1);
      }
      
      const newTask: Omit<Task, 'id'> = {
        title: formData.title,
        description: formData.description || undefined,
        date: dateObj,
        endDate: endDateObj,
        completed: false,
        location: formData.location || undefined,
        isAllDay: formData.isAllDay,
      };
      
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create event');
      }
      
      const createdTaskData = await res.json();
      const createdTask = ensureTaskDates(createdTaskData);
      
      setTasks([...tasks, createdTask]);
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      console.error('Error creating task:', err);
      setError(err instanceof Error ? err.message : 'Failed to create the event');
    }
  };

  // Update an existing task
  const updateTask = async () => {
    if (!currentTask) return;
    
    try {
      setError(null);
      
      let dateObj: Date;
      let endDateObj: Date | undefined;
      
      if (formData.isAllDay) {
        dateObj = new Date(formData.date);
        endDateObj = formData.endTime 
          ? new Date(`${formData.date}T${formData.endTime}`)
          : undefined;
      } else {
        dateObj = new Date(`${formData.date}T${formData.time || '00:00'}`);
        endDateObj = formData.endTime 
          ? new Date(`${formData.date}T${formData.endTime}`) 
          : addHours(dateObj, 1);
      }
      
      const updatedTask: Task = {
        ...currentTask,
        title: formData.title,
        description: formData.description || undefined,
        date: dateObj,
        endDate: endDateObj,
        location: formData.location || undefined,
        isAllDay: formData.isAllDay,
      };
      
      const res = await fetch('/api/calendar', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTask),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update event');
      }
      
      const updatedTaskData = await res.json();
      const updatedTaskWithDates = ensureTaskDates(updatedTaskData);
      
      setTasks(tasks.map(task => task.id === updatedTaskWithDates.id ? updatedTaskWithDates : task));
      setShowEditModal(false);
      setCurrentTask(null);
      resetForm();
    } catch (err) {
      console.error('Error updating task:', err);
      setError(err instanceof Error ? err.message : 'Failed to update the event');
    }
  };

  // Delete a task
  const deleteTask = async (id: string) => {
    try {
      setError(null);
      const res = await fetch(`/api/calendar?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete event');
      }
      
      setTasks(tasks.filter(task => task.id !== id));
    } catch (err) {
      console.error('Error deleting task:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete the event');
    }
  };

  // Load task data into form for editing
  const editTask = (task: Task) => {
    const date = format(task.date, 'yyyy-MM-dd');
    const time = task.isAllDay ? '' : format(task.date, 'HH:mm');
    const endTime = task.endDate && !task.isAllDay ? format(task.endDate, 'HH:mm') : '';
    
    setFormData({
      title: task.title,
      description: task.description || '',
      date,
      time,
      endTime,
      location: task.location || '',
      isAllDay: task.isAllDay || false,
    });
    
    setCurrentTask(task);
    setShowEditModal(true);
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: format(new Date(), 'HH:mm'),
      endTime: format(addHours(new Date(), 1), 'HH:mm'),
      location: '',
      isAllDay: false,
    });
  };

  // Initialize form with current date/time when opening add modal
  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Load tasks on component mount or when month changes
  useEffect(() => {
    if (status === 'authenticated') {
      fetchTasks();
    }
  }, [status, fetchTasks]);

  // Make sure all tasks have Date objects before sorting
  const tasksWithDates = tasks.map(task => ensureTaskDates(task));

  // Sort tasks by date
  const sortedTasks = [...tasksWithDates].sort((a, b) => {
    return a.date.getTime() - b.date.getTime();
  });

  // Group tasks by date
  const tasksByDate: Record<string, Task[]> = {};
  sortedTasks.forEach(task => {
    const dateKey = format(task.date, 'yyyy-MM-dd');
    if (!tasksByDate[dateKey]) {
      tasksByDate[dateKey] = [];
    }
    tasksByDate[dateKey].push(task);
  });

  // If not authenticated or still loading session, show loading
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-64">
        <FiLoader className="animate-spin h-8 w-8 text-blue-500" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading...</span>
      </div>
    );
  }

  // If there's a persistent error, show a retry button
  if (error && !loading && tasks.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Agenda</h1>
          <button
            onClick={openAddModal}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <FiPlus className="mr-2" />
            Add Event
          </button>
        </div>

        <div className="bg-red-50 text-red-700 rounded-lg p-8 text-center">
          <FiX className="mx-auto h-12 w-12 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Failed to load calendar events</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => fetchTasks()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Agenda</h1>
        <button 
          onClick={openAddModal}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <FiPlus className="mr-2" />
          Add Event
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
          <FiX className="mr-2 flex-shrink-0" />
          <p>{error}</p>
          <button onClick={() => setError(null)} className="ml-auto">
            <FiX />
          </button>
        </div>
      )}

      {/* View Type Tabs */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setViewType('list')}
            className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center transition-colors ${
              viewType === 'list'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <FiList className="mr-2" />
            List View
          </button>
          <button
            onClick={() => setViewType('calendar')}
            className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center transition-colors ${
              viewType === 'calendar'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <FiCalendar className="mr-2" />
            Calendar View
          </button>
        </div>
      </div>

      {/* List View */}
      {viewType === 'list' && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Upcoming Events</h2>
          </div>
          <div>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <FiLoader className="animate-spin h-6 w-6 text-blue-500 mr-2" />
              <span>Loading events...</span>
            </div>
          ) : sortedTasks.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No events found. Add your first event!</p>
          ) : (
            <div>
              {Object.entries(tasksByDate).map(([dateKey, dateTasks]) => (
                <div key={dateKey} className="border-b border-gray-100 last:border-b-0">
                  <div className="px-4 py-2 bg-gray-50">
                    <h3 className="font-medium text-gray-700 dark:text-gray-300">
                      {format(parseISO(dateKey), "EEEE, MMMM d, yyyy")}
                    </h3>
                  </div>
                  <ul className="divide-y divide-gray-100">
                    {dateTasks.map((task) => (
                      <li key={task.id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-start">
                          <div className="mt-1 mr-4 text-gray-300 dark:text-gray-600">
                            <FiCalendar size={20} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                {task.title}
                                {task.isAllDay && (
                                  <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                                    All day
                                  </span>
                                )}
                              </h3>
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => editTask(task)}
                                  className="p-1 text-gray-500 dark:text-gray-400 hover:text-blue-500"
                                >
                                  <FiEdit size={16} />
                                </button>
                                <button 
                                  onClick={() => deleteTask(task.id)}
                                  className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-500"
                                >
                                  <FiTrash2 size={16} />
                                </button>
                              </div>
                            </div>
                            {task.description && (
                              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
                            )}
                            <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                              {!task.isAllDay && (
                                <>
                                  <FiClock className="mr-1" />
                                  <span className="mr-4">
                                    {format(task.date, 'h:mm a')} 
                                    {task.endDate && ` - ${format(task.endDate, 'h:mm a')}`}
                                  </span>
                                </>
                              )}
                              {task.location && (
                                <span className="text-sm text-gray-500 dark:text-gray-400">📍 {task.location}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      )}

      {/* Calendar View */}
      {viewType === 'calendar' && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Calendar Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiChevronLeft />
                </button>
                <button
                  onClick={() => setCurrentMonth(new Date())}
                  className="px-3 py-1 text-sm hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiChevronRight />
                </button>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-4">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <FiLoader className="animate-spin h-6 w-6 text-blue-500 mr-2" />
                <span>Loading calendar...</span>
              </div>
            ) : (
              <CalendarGrid
                currentMonth={currentMonth}
                tasks={tasks}
                onDateClick={(date) => {
                  setFormData({
                    ...formData,
                    date: format(date, 'yyyy-MM-dd'),
                  });
                  setShowAddModal(true);
                }}
                onTaskClick={editTask}
              />
            )}
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full border border-gray-200 dark:border-gray-700 animate-in slide-in-from-bottom-4 duration-300 max-h-[90vh] flex flex-col">
            <div className="relative p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-xl mr-4">
                  <FiPlus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Event</h3>
                  <p className="text-gray-600 dark:text-gray-400">Create a new calendar event</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="absolute top-6 right-6 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors group"
              >
                <FiX className="w-6 h-6 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={(e) => { e.preventDefault(); createTask(); }} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Event Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all"
                    placeholder="Enter event title..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 resize-none transition-all"
                    placeholder="Add event description..."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all"
                    required
                  />
                </div>
                <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <input
                    id="all-day"
                    type="checkbox"
                    name="isAllDay"
                    checked={formData.isAllDay}
                    onChange={handleChange}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded transition-colors"
                  />
                  <label htmlFor="all-day" className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                    All day event
                  </label>
                </div>
                {!formData.isAllDay && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Start Time</label>
                      <input
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all"
                        required={!formData.isAllDay}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">End Time</label>
                      <input
                        type="time"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all"
                      />
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all"
                    placeholder="Add event location..."
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center"
                  >
                    <FiPlus className="mr-2 w-4 h-4" />
                    Add Event
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full border border-gray-200 dark:border-gray-700 animate-in slide-in-from-bottom-4 duration-300 max-h-[90vh] flex flex-col">
            <div className="relative p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-xl mr-4">
                  <FiEdit className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Event</h3>
                  <p className="text-gray-600 dark:text-gray-400">Update your calendar event</p>
                </div>
              </div>
              <button 
                onClick={() => setShowEditModal(false)} 
                className="absolute top-6 right-6 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors group"
              >
                <FiX className="w-6 h-6 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={(e) => { e.preventDefault(); updateTask(); }} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Event Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all"
                    placeholder="Enter event title..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 resize-none transition-all"
                    placeholder="Add event description..."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all"
                    required
                  />
                </div>
                <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <input
                    id="edit-all-day"
                    type="checkbox"
                    name="isAllDay"
                    checked={formData.isAllDay}
                    onChange={handleChange}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded transition-colors"
                  />
                  <label htmlFor="edit-all-day" className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                    All day event
                  </label>
                </div>
                {!formData.isAllDay && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Start Time</label>
                      <input
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all"
                        required={!formData.isAllDay}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">End Time</label>
                      <input
                        type="time"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all"
                      />
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all"
                    placeholder="Add event location..."
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center"
                  >
                    <FiEdit className="mr-2 w-4 h-4" />
                    Update Event
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}