import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/client';

interface Task {
  id: string;
  title: string;
  description: string | null;
  date: string;
  completed: boolean;
  userId: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

async function fetchTasks(completed?: boolean): Promise<Task[]> {
  const params = new URLSearchParams();
  if (completed !== undefined) {
    params.append('completed', String(completed));
  }
  const response = await fetch(`/api/tasks?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }
  const data = await response.json();
  return data.tasks || [];
}

async function createTask(taskData: { title: string; description?: string; date?: string }): Promise<Task> {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData),
  });
  if (!response.ok) {
    throw new Error('Failed to create task');
  }
  return response.json();
}

async function toggleTask(taskId: string): Promise<Task> {
  const response = await fetch(`/api/tasks/${taskId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed: true }),
  });
  if (!response.ok) {
    throw new Error('Failed to toggle task');
  }
  return response.json();
}

async function deleteTask(taskId: string): Promise<void> {
  const response = await fetch(`/api/tasks/${taskId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete task');
  }
}

export function useTasks(completed?: boolean) {
  return useQuery({
    queryKey: queryKeys.tasks.list({ completed }),
    queryFn: () => fetchTasks(completed),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // Keep for 5 minutes
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      // Invalidate all task queries
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });
}

export function useToggleTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });
}
