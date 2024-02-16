interface LongTermMemoryData {
  isLongTermMemoryEnabled: boolean;
  userEmail: string;
  memoryType: string;
  historyLength: string;
}

const updateLongTermMemory = async ({
  isLongTermMemoryEnabled,
  userEmail,
  memoryType,
  historyLength,
}: LongTermMemoryData): Promise<any> => {
  try {
    const response = await fetch('/api/memory/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        isLongTermMemoryEnabled,
        userEmail,
        memoryType,
        historyLength,
      }),
    });
    return response.json();
  } catch (error) {
    console.error('Unexpected error: ', error);
    throw error;
  }
};

export { updateLongTermMemory };
