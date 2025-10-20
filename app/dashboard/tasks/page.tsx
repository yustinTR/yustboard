'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { FiPlus, FiTrash2, FiCheck, FiLoader, FiEdit2 } from 'react-icons/fi';

interface Task {
  id: string;
  title: string;
  description: string | null;
  date: string;
  completed: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

export default function TasksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tasks');

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.user) {
      router.push('/dashboard');
      return;
    }

    fetchTasks();
  }, [session, status, router, fetchTasks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('Please enter a task title');
      return;
    }

    try {
      const url = editingTask ? `/api/tasks/${editingTask.id}` : '/api/tasks';
      const method = editingTask ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${editingTask ? 'update' : 'create'} task`);
      }

      setFormData({ title: '', description: '', date: new Date().toISOString().split('T')[0] });
      setShowNewTaskForm(false);
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      console.error('Error saving task:', err);
      alert(err instanceof Error ? err.message : 'Failed to save task');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      setDeletingId(id);
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {
      console.error('Error deleting task:', err);
      alert('Failed to delete task');
    } finally {
      setDeletingId(null);
    }
  };

  const toggleComplete = async (task: Task) => {
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: !task.completed,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      fetchTasks();
    } catch (err) {
      console.error('Error updating task:', err);
      alert('Failed to update task');
    }
  };

  const startEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      date: task.date.split('T')[0]
    });
    setShowNewTaskForm(true);
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setFormData({ title: '', description: '', date: new Date().toISOString().split('T')[0] });
    setShowNewTaskForm(false);
  };

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-5xl">
        <div className="flex justify-center items-center h-64">
          <FiLoader className="animate-spin h-8 w-8 text-blue-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your team&apos;s tasks and to-dos
          </p>
        </div>
        <button
          onClick={() => setShowNewTaskForm(!showNewTaskForm)}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <FiPlus className="mr-2" />
          New Task
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {/* New/Edit Task Form */}
      {showNewTaskForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">{editingTask ? 'Edit Task' : 'New Task'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter task title"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter task description (optional)"
              />
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                id="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                {editingTask ? 'Update Task' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Pending Tasks */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Pending Tasks ({pendingTasks.length})</h2>
        <div className="space-y-3">
          {pendingTasks.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">No pending tasks. Great job!</p>
            </div>
          ) : (
            pendingTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-4 flex-1">
                  <button
                    onClick={() => toggleComplete(task)}
                    className="mt-1 w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-500 transition-colors flex items-center justify-center"
                  >
                    {task.completed && <FiCheck className="text-green-500" />}
                  </button>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{task.title}</h3>
                    {task.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{task.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-500">
                      <span>Due: {format(new Date(task.date), 'MMM d, yyyy')}</span>
                      <span>By: {task.user.name || task.user.email}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => startEdit(task)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title="Edit"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    disabled={deletingId === task.id}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50 transition-colors"
                    title="Delete"
                  >
                    {deletingId === task.id ? (
                      <FiLoader className="animate-spin" />
                    ) : (
                      <FiTrash2 />
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-600 dark:text-gray-400">
            Completed Tasks ({completedTasks.length})
          </h2>
          <div className="space-y-3">
            {completedTasks.map((task) => (
              <div
                key={task.id}
                className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-sm p-4 flex items-center justify-between opacity-75"
              >
                <div className="flex items-start space-x-4 flex-1">
                  <button
                    onClick={() => toggleComplete(task)}
                    className="mt-1 w-5 h-5 rounded border-2 border-green-500 bg-green-500 transition-colors flex items-center justify-center"
                  >
                    <FiCheck className="text-white" />
                  </button>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-600 dark:text-gray-400 line-through">{task.title}</h3>
                    {task.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1 line-through">{task.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-600">
                      <span>Completed: {format(new Date(task.date), 'MMM d, yyyy')}</span>
                      <span>By: {task.user.name || task.user.email}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDelete(task.id)}
                    disabled={deletingId === task.id}
                    className="p-2 text-gray-500 dark:text-gray-600 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50 transition-colors"
                    title="Delete"
                  >
                    {deletingId === task.id ? (
                      <FiLoader className="animate-spin" />
                    ) : (
                      <FiTrash2 />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
