interface LongTermMemoryData {
  isLongTermMemoryEnabled: boolean;
  userEmail: string;
  memoryType: string;
  historyLength: string;
}

interface AppendMessageToConversationData {
  userEmail: string;
  message: IMessage;
  memoryType: string;
}

interface AugmentUserMessageData {
  message: string;
  userEmail: string;
  historyLength: string;
  memoryType: string;
}

const updateSettings = async ({
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

const appendMessageToConversation = async ({
  userEmail,
  message,
  memoryType,
}: AppendMessageToConversationData): Promise<any> => {
  try {
    const response = await fetch('/api/memory/append', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userEmail,
        message,
        memoryType,
      }),
    });
    return response.json();
  } catch (error) {
    console.error('Unexpected error: ', error);
    throw error;
  }
};

const augmentUserMessageWithHistory = async ({
  message,
  userEmail,
  historyLength,
  memoryType,
}: AugmentUserMessageData): Promise<any> => {
  try {
    const response = await fetch('/api/memory/augment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userEmail,
        message,
        historyLength,
        memoryType,
      }),
    });
    return response.json();
  } catch (error) {
    console.error('Unexpected error: ', error);
    throw error;
  }
};

export {
  updateSettings,
  appendMessageToConversation,
  augmentUserMessageWithHistory,
};
