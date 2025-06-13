import { useState, useCallback, useMemo } from 'react';

interface TaskCounterResult {
  currentTaskIndex: number;
  isCompleted: boolean;
  completedTasks: number;
  nextTask: () => void;
  skipTask: () => void;
  resetTest: () => void;
  finishTask: () => void;
}

/**
 * useTaskCounter - хук для отслеживания номера текущей задачи, общего количества
 * задач, количества выполненных задач, и для управления тестом.
 *
 * @param {number} totalTasks - общее количество задач
 * @returns {TaskCounterResult} объект с информацией о номере текущей задачи,
 * количестве выполненных задач, количестве задач, функциями для
 * перехода к следующей задаче, сброса теста, досрочного завершения теста,
 * пропуска задачи.
 */
export function useTaskCounter(totalTasks: number): TaskCounterResult {
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [completedTasks, setСompletedTasks] = useState(0);
  const [doesCompleted, setDoesCompleted] = useState(false);

  const isCompleted = useMemo(
    () => doesCompleted || currentTaskIndex >= totalTasks,
    [doesCompleted, currentTaskIndex, totalTasks],
  );

  const finishTask = useCallback(() => {
    if (!isCompleted) {
      setDoesCompleted(true);
    }
  }, [isCompleted]); // досрочно завершён

  const advanceTask = useCallback(
    (shouldCountAsCompleted: boolean) => {
      if (currentTaskIndex < totalTasks - 1) {
        setCurrentTaskIndex((prev) => prev + 1);
        if (shouldCountAsCompleted) {
          setСompletedTasks((prev) => prev + 1);
        }
      } else {
        setCurrentTaskIndex(totalTasks);
        if (shouldCountAsCompleted) {
          setСompletedTasks((prev) => prev + 1);
        }
      }
    },
    [currentTaskIndex, totalTasks],
  );

  const nextTask = useCallback(() => advanceTask(true), [advanceTask]); // завершён
  const skipTask = useCallback(() => advanceTask(false), [advanceTask]); // пропустить задачу

  const resetTest = useCallback(() => {
    setCurrentTaskIndex(0);
    setСompletedTasks(0);
    setDoesCompleted(false);
  }, []);

  return {
    currentTaskIndex,
    isCompleted,
    nextTask,
    resetTest,
    finishTask,
    skipTask,
    completedTasks,
  };
}
