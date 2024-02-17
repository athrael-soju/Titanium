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
    switch (memoryType) {
      case 'NoSQL': {
        const response = await fetch('/api/memory/append/nosql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userEmail,
            message,
          }),
        });
        return response.json();
      }
      case 'vector': {
        console.warn('Vector memory type not yet implemented');
      }
    }
  } catch (error) {
    console.error('Unexpected error: ', error);
    throw error;
  }
};

const augmentUserMessageWithHistory = async ({
  message,
  userEmail,
  historyLength,
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
