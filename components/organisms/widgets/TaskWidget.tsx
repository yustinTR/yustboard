'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiCheck, FiRefreshCw, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';

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

const TaskWidget = React.memo(function TaskWidget() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
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
  };

  const toggleComplete = async (taskId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: !currentStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      // Refresh tasks after update
      fetchTasks();
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  // Get pending tasks only, sorted by date
  const pendingTasks = tasks
    .filter(t => !t.completed)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <div className="h-full backdrop-blur-xl bg-white/15 dark:bg-gray-900/15 border border-white/25 dark:border-gray-700/25 rounded-3xl shadow-2xl shadow-black/20 overflow-hidden flex flex-col">
        {/* Header with green gradient for tasks */}
        <div className="px-6 py-4 bg-gradient-to-r from-green-500/90 to-emerald-500/90 backdrop-blur-sm text-white">
          <h3 className="text-lg font-medium tracking-wide flex items-center gap-2">
            <FiClock className="h-5 w-5" />
            Tasks
          </h3>
        </div>

        {/* Loading Content */}
        <div className="flex-1 px-6 py-4 bg-white/5 dark:bg-gray-900/5 backdrop-blur-sm">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white/20 dark:bg-gray-800/20 rounded-2xl p-4 backdrop-blur-sm border border-white/30 dark:border-gray-600/30">
                <div className="h-4 bg-white/30 dark:bg-gray-700/30 rounded-lg w-3/4 mb-2"></div>
                <div className="h-3 bg-white/20 dark:bg-gray-700/20 rounded-lg w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full backdrop-blur-xl bg-white/15 dark:bg-gray-900/15 border border-white/25 dark:border-gray-700/25 rounded-3xl shadow-2xl shadow-black/20 overflow-hidden flex flex-col">
        {/* Header with green gradient for tasks */}
        <div className="px-6 py-4 bg-gradient-to-r from-green-500/90 to-emerald-500/90 backdrop-blur-sm text-white flex justify-between items-center">
          <h3 className="text-lg font-medium tracking-wide flex items-center gap-2">
            <FiClock className="h-5 w-5" />
            Tasks
          </h3>
          <button
            onClick={fetchTasks}
            disabled={loading}
            className="text-white/90 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all duration-300 disabled:opacity-50 cursor-pointer hover:scale-105"
          >
            <FiRefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Error Content */}
        <div className="flex-1 px-6 py-4 bg-white/5 dark:bg-gray-900/5 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-red-500/15 border border-red-400/30 text-red-600 dark:text-red-400 p-4 rounded-2xl backdrop-blur-sm">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full backdrop-blur-xl bg-white/15 dark:bg-gray-900/15 border border-white/25 dark:border-gray-700/25 rounded-3xl shadow-2xl shadow-black/20 overflow-hidden flex flex-col">
      {/* Header with green gradient for tasks */}
      <div className="px-6 py-4 bg-gradient-to-r from-green-500/90 to-emerald-500/90 backdrop-blur-sm text-white flex justify-between items-center">
        <h3 className="text-lg font-medium tracking-wide flex items-center gap-2">
          <FiClock className="h-5 w-5" />
          Tasks
        </h3>
        <button
          onClick={fetchTasks}
          disabled={loading}
          className="text-white/90 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all duration-300 disabled:opacity-50 cursor-pointer hover:scale-105"
        >
          <FiRefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 px-6 py-4 bg-white/5 dark:bg-gray-900/5 backdrop-blur-sm overflow-hidden flex flex-col">
        {pendingTasks.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3">
            <div className="bg-green-500/15 border border-green-400/30 text-green-600 dark:text-green-400 p-6 rounded-2xl backdrop-blur-sm">
              <FiCheck className="mx-auto mb-3 h-8 w-8" />
              <p className="font-medium mb-2">Geen openstaande taken</p>
              <p className="text-sm">Alle taken zijn afgerond!</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-3">
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white/20 dark:bg-gray-800/20 rounded-2xl p-4 backdrop-blur-sm border border-white/30 dark:border-gray-600/30 hover:bg-white/30 dark:hover:bg-gray-700/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer group"
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleComplete(task.id, task.completed)}
                      className="mt-0.5 w-5 h-5 rounded border-2 border-white/40 dark:border-gray-500/40 hover:border-green-400 dark:hover:border-green-400 transition-colors flex items-center justify-center flex-shrink-0"
                    >
                      {task.completed && <FiCheck className="text-green-500 text-sm" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors line-clamp-2 leading-snug mb-2">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2 leading-relaxed">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
                        <span className="flex items-center gap-1">
                          <FiClock className="h-3 w-3" />
                          {format(new Date(task.date), 'dd MMM yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer with Material button */}
      <div className="px-6 py-4 bg-white/10 dark:bg-gray-800/15 backdrop-blur-sm border-t border-white/20 dark:border-gray-600/20">
        <Link
          href="/dashboard/tasks"
          className="block w-full text-center bg-green-500/20 hover:bg-green-500/30 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm font-medium py-3 px-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] border border-green-400/30 backdrop-blur-sm"
        >
          Bekijk alle taken
        </Link>
      </div>
    </div>
  );
});

export default TaskWidget;
