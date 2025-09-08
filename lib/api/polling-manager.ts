type PollingCallback = () => void | Promise<void>;

interface PollingTask {
  id: string;
  callback: PollingCallback;
  interval: number;
  lastRun: number;
  priority: 'high' | 'medium' | 'low';
}

class PollingManager {
  private tasks: Map<string, PollingTask> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private isRunning: boolean = false;
  private batchSize: number = 3; // Max concurrent polling tasks
  private minInterval: number = 5000; // Minimum 5 seconds between same task

  register(
    id: string,
    callback: PollingCallback,
    interval: number,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ) {
    // Ensure interval is not too aggressive
    const safeInterval = Math.max(interval, this.minInterval);
    
    this.tasks.set(id, {
      id,
      callback,
      interval: safeInterval,
      lastRun: 0,
      priority,
    });

    if (this.isRunning) {
      this.scheduleTask(id);
    }
  }

  unregister(id: string) {
    this.tasks.delete(id);
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.tasks.forEach((_, id) => this.scheduleTask(id));
  }

  stop() {
    this.isRunning = false;
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
  }

  private scheduleTask(id: string) {
    const task = this.tasks.get(id);
    if (!task || !this.isRunning) return;

    const now = Date.now();
    const timeSinceLastRun = now - task.lastRun;
    const delay = Math.max(0, task.interval - timeSinceLastRun);

    const timer = setTimeout(async () => {
      if (!this.isRunning) return;

      // Check if we're under the batch limit
      const runningTasks = Array.from(this.tasks.values()).filter(
        t => now - t.lastRun < 1000 // Tasks running in the last second
      ).length;

      if (runningTasks >= this.batchSize) {
        // Delay this task
        this.scheduleTask(id);
        return;
      }

      // Run the task
      const currentTask = this.tasks.get(id);
      if (currentTask) {
        currentTask.lastRun = Date.now();
        try {
          await currentTask.callback();
        } catch (error) {
          console.error(`Polling task ${id} failed:`, error);
        }
      }

      // Reschedule
      this.scheduleTask(id);
    }, delay);

    this.timers.set(id, timer);
  }

  // Manually trigger a task (useful for refresh buttons)
  async runNow(id: string) {
    const task = this.tasks.get(id);
    if (!task) return;

    task.lastRun = Date.now();
    try {
      await task.callback();
    } catch (error) {
      console.error(`Polling task ${id} failed:`, error);
    }

    // Reschedule with full interval
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
    }
    this.scheduleTask(id);
  }

  // Get task status
  getTaskStatus(id: string) {
    const task = this.tasks.get(id);
    if (!task) return null;

    return {
      lastRun: task.lastRun,
      nextRun: task.lastRun + task.interval,
      isOverdue: Date.now() > task.lastRun + task.interval,
    };
  }
}

// Singleton instance
export const pollingManager = new PollingManager();

// React hook for easy integration
import { useEffect, useCallback } from 'react';

export function usePolling(
  id: string,
  callback: PollingCallback,
  interval: number,
  options?: {
    enabled?: boolean;
    priority?: 'high' | 'medium' | 'low';
    runImmediately?: boolean;
  }
) {
  const { enabled = true, priority = 'medium', runImmediately = true } = options || {};

  const stableCallback = useCallback(callback, []);

  useEffect(() => {
    if (!enabled) return;

    pollingManager.register(id, stableCallback, interval, priority);
    
    if (runImmediately) {
      stableCallback();
    }

    return () => {
      pollingManager.unregister(id);
    };
  }, [id, stableCallback, interval, priority, enabled, runImmediately]);

  const refresh = useCallback(() => {
    return pollingManager.runNow(id);
  }, [id]);

  return { refresh };
}