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

interface AugmentUserMessageDataViaNoSql {
  userEmail: string;
  historyLength: string;
  message: string;
}

interface AugmentUserMessageDataViaVector {
  userEmail: string;
  historyLength: string;
  embeddedMessage: any;
}

interface UpdateMetadataInVectorDb {
  userEmail: string;
  id: string;
  metadata: any;
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

const updateMessageMetadataInVector = async ({
  userEmail,
  id,
  metadata,
}: UpdateMetadataInVectorDb): Promise<any> => {
  try {
    const response = await fetch('/api/memory/update-metadata/vector', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userEmail,
        id,
        metadata,
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
}: AugmentUserMessageDataViaNoSql): Promise<any> => {
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
  userEmail,
  historyLength,
  embeddedMessage,
}: AugmentUserMessageDataViaVector): Promise<any> => {
  try {
    const response = await fetch('/api/memory/augment/vector', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userEmail,
        historyLength,
        embeddedMessage,
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
  updateMessageMetadataInVector,
};
