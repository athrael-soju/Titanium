interface LongTermMemoryData {
  isLongTermMemoryEnabled: boolean;
  userEmail: string;
  memoryType: string;
  historyLength: string;
}

interface AppendMessageToNoSql {
  userEmail: string;
  message: IMessage;
}

interface AppendMessageToVectorDb {
  userEmail: string;
  vectorMessage: any;
}

interface AugmentUserMessageData {
  userEmail: string;
  historyLength: string;
  message: string;
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

const appendMessageToNoSql = async ({
  message,
  userEmail,
}: AppendMessageToNoSql): Promise<any> => {
  try {
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
  } catch (error) {
    console.error('Unexpected error: ', error);
    throw error;
  }
};

const appendMessageToVector = async ({
  userEmail,
  vectorMessage,
}: AppendMessageToVectorDb): Promise<any> => {
  try {
    const response = await fetch('/api/memory/append/vector', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userEmail,
        vectorMessage,
      }),
    });
    return response.json();
  } catch (error) {
    console.error('Unexpected error: ', error);
    throw error;
  }
};

const augmentMessageViaNoSql = async ({
  message,
  userEmail,
  historyLength,
}: AugmentUserMessageData): Promise<any> => {
  try {
    const response = await fetch('/api/memory/augment/nosql', {
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

const augmentMessageViaVector = async ({
  message,
  userEmail,
  historyLength,
}: AugmentUserMessageData): Promise<any> => {
  try {
    const response = await fetch('/api/memory/augment/vector', {
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
  appendMessageToNoSql,
  augmentMessageViaNoSql,
  appendMessageToVector,
  augmentMessageViaVector,
};
