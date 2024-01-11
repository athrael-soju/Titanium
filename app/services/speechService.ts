interface SpeechUpdateData {
  isSpeechEnabled: boolean;
  userEmail: string;
  model: string;
  voice: string;
}

const updateSpeech = async ({
  isSpeechEnabled,
  userEmail,
  model,
  voice,
}: SpeechUpdateData): Promise<any> => {
  try {
    const response = await fetch('/api/speech/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        isSpeechEnabled,
        userEmail,
        model,
        voice,
      }),
    });
    return response.json();
  } catch (error) {
    console.error('Unexpected error:', error);
    throw error;
  }
};

export { updateSpeech };
