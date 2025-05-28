'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FiPlus, FiCalendar, FiClock, FiEdit, FiTrash2, FiLoader, FiX } from 'react-icons/fi';
import { format, parseISO, addHours, startOfDay, endOfDay, addDays } from 'date-fns';
import { Task } from '@/utils/google-calendar';

// Helper function to ensure a task has proper Date objects
function ensureTaskDates(task: { id: string; title: string; description?: string; date: Date | string; endDate?: Date | string; completed: boolean }): Task {
  return {
    ...task,
    date: task.date instanceof Date ? task.date : new Date(task.date),
    endDate: task.endDate ? (task.endDate instanceof Date ? task.endDate : new Date(task.endDate)) : undefined,
  };
}

export default function AgendaPage() {
  const { status } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
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
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const timeMin = startOfDay(new Date()).toISOString();
      const timeMax = endOfDay(addDays(new Date(), 30)).toISOString();
      
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
  };

  // Create a new task
  const createTask = async () => {
    try {
      setError(null);
      
      let dateObj: Date;
      let endDateObj: Date | undefined;
      
      if (formData.isAllDay) {
        // For all-day events, just use the date without time
        dateObj = new Date(formData.date);
        
        // If no end time is provided, the event is single-day
        endDateObj = formData.endTime 
          ? new Date(`${formData.date}T${formData.endTime}`)
          : undefined;
      } else {
        // For regular events, combine date and time
        dateObj = new Date(`${formData.date}T${formData.time || '00:00'}`);
        
        // If no end time is provided, default to 1 hour later
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
        // For all-day events, just use the date without time
        dateObj = new Date(formData.date);
        
        // If no end time is provided, the event is single-day
        endDateObj = formData.endTime 
          ? new Date(`${formData.date}T${formData.endTime}`)
          : undefined;
      } else {
        // For regular events, combine date and time
        dateObj = new Date(`${formData.date}T${formData.time || '00:00'}`);
        
        // If no end time is provided, default to 1 hour later
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
    const { name, value, type } = e.target as HTMLInputElement; // Cast to HTMLInputElement to access checked
    const checked = (e.target as HTMLInputElement).checked;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Load tasks on component mount
  useEffect(() => {
    if (status === 'authenticated') {
      fetchTasks();
    }
  }, [status]);

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
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  // If there's a persistent error, show a retry button
  if (error && !loading && tasks.length === 0) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Agenda</h1>
          <button
            onClick={openAddModal}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
          >
            <FiPlus className="mr-2" />
            Add Event
          </button>
        </div>

        <div className="bg-red-50 text-red-700 rounded-md p-8 text-center">
          <FiX className="mx-auto h-12 w-12 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Failed to load calendar events</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => fetchTasks()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Agenda</h1>
        <button 
          onClick={openAddModal}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
        >
          <FiPlus className="mr-2" />
          Add Event
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md flex items-center">
          <FiX className="mr-2 flex-shrink-0" />
          <p>{error}</p>
          <button onClick={() => setError(null)} className="ml-auto">
            <FiX />
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Your Calendar</h2>
        </div>
        <div>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <FiLoader className="animate-spin h-6 w-6 text-blue-500 mr-2" />
              <span>Loading events...</span>
            </div>
          ) : sortedTasks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No events found. Add your first event!</p>
          ) : (
            <div>
              {Object.entries(tasksByDate).map(([dateKey, dateTasks]) => (
                <div key={dateKey} className="border-b border-gray-100 last:border-b-0">
                  <div className="px-4 py-2 bg-gray-50">
                    <h3 className="font-medium text-gray-700">
                      {format(parseISO(dateKey), "EEEE, MMMM d, yyyy")}
                    </h3>
                  </div>
                  <ul className="divide-y divide-gray-100">
                    {dateTasks.map((task) => (
                      <li key={task.id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-start">
                          <div className="mt-1 mr-4 text-gray-300">
                            <FiCalendar size={20} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium text-gray-900">
                                {task.title}
                                {task.isAllDay && (
                                  <span className="ml-2 text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                    All day
                                  </span>
                                )}
                              </h3>
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => editTask(task)}
                                  className="p-1 text-gray-500 hover:text-blue-500"
                                >
                                  <FiEdit size={16} />
                                </button>
                                <button 
                                  onClick={() => deleteTask(task.id)}
                                  className="p-1 text-gray-500 hover:text-red-500"
                                >
                                  <FiTrash2 size={16} />
                                </button>
                              </div>
                            </div>
                            {task.description && (
                              <p className="mt-1 text-sm text-gray-600">{task.description}</p>
                            )}
                            <div className="mt-2 flex items-center text-sm text-gray-500">
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
                                <span className="text-sm text-gray-500">📍 {task.location}</span>
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

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Add New Event</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); createTask(); }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div className="flex items-center mb-2">
                  <input
                    id="all-day"
                    type="checkbox"
                    name="isAllDay"
                    checked={formData.isAllDay}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="all-day" className="ml-2 block text-sm text-gray-700">
                    All day event
                  </label>
                </div>
                {!formData.isAllDay && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                      <input
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required={!formData.isAllDay}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                      <input
                        type="time"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Add Event
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Edit Event</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700">
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); updateTask(); }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div className="flex items-center mb-2">
                  <input
                    id="edit-all-day"
                    type="checkbox"
                    name="isAllDay"
                    checked={formData.isAllDay}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="edit-all-day" className="ml-2 block text-sm text-gray-700">
                    All day event
                  </label>
                </div>
                {!formData.isAllDay && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                      <input
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required={!formData.isAllDay}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                      <input
                        type="time"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Update Event
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}