let isPlaying = false;
let audioQueue: Blob[] = [];

const retrieveAIResponse = async (
  userMessage: string,
  userEmail: string,
  isAssistantEnabled: boolean,
  isVisionEnabled: boolean
): Promise<Response | ReadableStreamDefaultReader<Uint8Array> | undefined> => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userMessage, userEmail }),
    });
    if (isAssistantEnabled) {
      return response;
    } else if (isVisionEnabled) {
      return response.body?.getReader();
    } else {
      return response.body?.getReader();
    }
  } catch (error) {
    console.error('Failed to fetch AI response:', error);
    return undefined;
  }
};

const retrieveTextFromSpeech = async (text: string) => {
  const response = await fetch('/api/speech/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) {
    throw new Error('Failed to convert text to speech');
  }
  const blob = await response.blob();
  audioQueue.push(blob);
  playNextInQueue();
};

const playNextInQueue = () => {
  if (isPlaying || audioQueue.length === 0) {
    return;
  }

  isPlaying = true;
  const audioBlob = audioQueue.shift();
  if (!audioBlob) {
    return;
  }
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);

  audio.onended = () => {
    isPlaying = false;
    playNextInQueue();
  };
  audio.play();
};

export { retrieveAIResponse, retrieveTextFromSpeech };
