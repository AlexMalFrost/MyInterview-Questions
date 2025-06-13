type WorkerMessage = {
  userCode: string;
  correctCode: string;
};

type CompareResult = {
  isCorrect: boolean;
  error: string | null;
};

self.onmessage = function (event: MessageEvent<WorkerMessage>) {
  try {
    const { userCode, correctCode } = event.data;
    const result = compareCodeStrings(userCode, correctCode);
    self.postMessage(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    self.postMessage({ isCorrect: false, error: errorMessage });
  }
};

function normalizeCode(code: string): string {
  return code.trim().replace(/\s+/g, ' ');
}

function compareCodeStrings(userCode: string, correctCode: string): CompareResult {
  // Проверка на пустой код
  if (!userCode || !correctCode) {
    return {
      isCorrect: false,
      error: 'One of the codes is empty',
    };
  }

  const normalizedUserCode = normalizeCode(userCode);
  const normalizedCorrectCode = normalizeCode(correctCode);

  const isCorrect = normalizedUserCode === normalizedCorrectCode;

  return {
    isCorrect,
    error: isCorrect ? null : 'Code does not match',
  };
}
