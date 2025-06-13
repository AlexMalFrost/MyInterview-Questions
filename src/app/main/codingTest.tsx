'use client';
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { codingTasks } from '@/app/lib/codingTasks';
import { useTaskCounter } from '@/app/lib/useTaskCounter';

interface WorkerMessage {
  userCode: string;
  correctCode: string;
}

interface WorkerResponse {
  isCorrect: boolean;
  error?: string;
}
type Feedback =
  | typeof correctAnswer
  | typeof incorrectAnswer
  | 'Worker not initialized'
  | 'No correct code available'
  | 'Error occured, please restart the test'
  | 'Code is empty'
  | '';

type TestState = {
  showTest: boolean;
  feedback: Feedback;
  userCode: string;
  isLoading: boolean;
};

const correctAnswer = 'Correct!' as const;
const incorrectAnswer = 'Incorrect!' as const;

export default function CodingTest() {
  const [testState, setTestState] = useState<TestState>({
    showTest: false,
    feedback: '',
    userCode: '',
    isLoading: false,
  });

  const {
    currentTaskIndex,
    isCompleted,
    nextTask,
    finishTask,
    resetTest,
    skipTask,
    completedTasks,
  } = useTaskCounter(codingTasks.length);

  const task = useMemo(() => codingTasks[currentTaskIndex], [currentTaskIndex]);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Инициализация воркера при монтировании
    const worker = new Worker(new URL('../workers/code-executor.ts', import.meta.url), {
      type: 'module',
    });

    workerRef.current = worker;

    // Обработчик сообщений от воркера
    const handleMessage = (e: MessageEvent<WorkerResponse>) => {
      if (e.data.error) {
        console.log(`Error: ${e.data.error}`);
        setTestState((prev) => ({
          ...prev,
          isLoading: false,
          feedback: incorrectAnswer,
        }));
      } else {
        setTestState((prev) => ({
          ...prev,
          isLoading: false,
          feedback: e.data.isCorrect ? correctAnswer : incorrectAnswer,
        }));
      }
    };

    // Обработчик ошибок воркера
    const handleError = (error: ErrorEvent) => {
      setTestState((prev) => ({
        ...prev,
        isLoading: false,
        feedback: 'Error occured, please restart the test',
      }));
      console.log(`Worker error: ${error.message}`);
    };

    worker.addEventListener('message', handleMessage);
    worker.addEventListener('error', handleError);

    return () => {
      worker.removeEventListener('message', handleMessage);
      worker.removeEventListener('error', handleError);
      worker.terminate();
    };
  }, []);

  const handleCheck = useCallback(() => {
    if (testState.feedback === correctAnswer) return;
    if (!testState.userCode || testState.userCode.trim() === '') {
      setTestState((prev) => ({ ...prev, feedback: 'Code is empty' }));
      return;
    }

    const worker = workerRef.current;
    if (!worker) {
      setTestState((prev) => ({ ...prev, feedback: 'Worker not initialized' }));
      return;
    }

    if (!task?.correctCode) {
      setTestState((prev) => ({ ...prev, feedback: 'No correct code available' }));
      return;
    }

    setTestState((prev) => ({ ...prev, isLoading: true, feedback: '' }));

    const message: WorkerMessage = {
      userCode: testState.userCode,
      correctCode: task.correctCode,
    };

    worker.postMessage(message);
  }, [task, testState.userCode, testState.feedback]);

  const startTest = useCallback(() => {
    setTestState({ showTest: true, feedback: '', userCode: '', isLoading: false });
  }, []);

  const tryAgain = useCallback(() => {
    resetTest();
    setTestState({ showTest: false, feedback: '', userCode: '', isLoading: false });
  }, [resetTest]);

  if (!testState.showTest) {
    return (
      <div className="flex justify-center items-center h-screen">
        <button
          onClick={startTest}
          className="bg-blue-500 hover:bg-blue-600 text-black font-[Dancing_Script] px-6 py-3 rounded-md text-xl transition-colors cursor-pointer">
          Pass the test
        </button>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-6 text-black font-[Dancing_Script]">Test passed</h1>
        <p className="text-lg text-black font-[Comic_Neue] mb-4">
          Questions answered:{' '}
          <span className="text-black font-[Comic_Neue]">
            {completedTasks} of {codingTasks.length}
          </span>
        </p>
        <button
          onClick={tryAgain}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md transition-colors cursor-pointer">
          Try again?
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-[Dancing_Script] mb-6 text-center text-black">
        Fix the Bug in the Code
      </h1>

      {/* Responsive layout */}
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        {/* Left: Code with error */}
        <pre className="font-[Comic_Neue] bg-gray-100 p-4 rounded-md w-full md:w-1/2 overflow-auto h-64 whitespace-pre-wrap text-sm text-black">
          {task.wrongCode}
        </pre>
        {/* Right: User input */}
        <textarea
          value={testState.userCode}
          onChange={(e) => setTestState((prev) => ({ ...prev, userCode: e.target.value }))}
          placeholder="Write your corrected code here..."
          className="w-full md:w-1/2 p-4 border border-gray-300 rounded-md resize-none h-64 font-[Comic_Neue] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
        />
      </div>

      <div className="text-center space-x-4 text-black font-[Comic_Neue] pb-6">
        Task {currentTaskIndex + 1} of 3
      </div>

      {/* Buttons */}
      <div className=" space-x-4 flex justify-center">
        <button
          onClick={handleCheck}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition-colors cursor-pointer font-[Dancing_Script]">
          Check
        </button>

        {testState.feedback === correctAnswer ? (
          <button
            onClick={() => {
              nextTask();
              setTestState((prev) => ({ ...prev, feedback: '', userCode: '' }));
            }}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md transition-colors cursor-pointer font-[Dancing_Script]">
            {currentTaskIndex === codingTasks.length - 1 ? 'Finish test' : 'Next Task'}
          </button>
        ) : (
          <button
            onClick={() => {
              skipTask();
              setTestState((prev) => ({ ...prev, feedback: '' }));
            }}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md transition-colors cursor-pointer font-[Dancing_Script]">
            Skip
          </button>
        )}
        {testState.feedback === correctAnswer &&
        currentTaskIndex === codingTasks.length - 1 ? null : (
          <button
            onClick={() => {
              finishTask();
              setTestState((prev) => ({ ...prev, feedback: '' }));
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md transition-colors cursor-pointer font-[Dancing_Script]">
            Finish
          </button>
        )}
      </div>
      {/* Feedback message */}
      {testState.feedback && (
        <p
          className={`mt-6 text-center text-lg font-medium ${
            testState.feedback === correctAnswer ? 'text-green-600' : 'text-red-600'
          }`}>
          {testState.feedback}
        </p>
      )}
    </div>
  );
}
