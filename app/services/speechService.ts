interface SpeechUpdateData {
  isSpeechEnabled: boolean;
  userEmail: string;
}

const updateSpeech = async ({
  isSpeechEnabled,
  userEmail,
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
      }),
    });
    return response.json();
  } catch (error) {
    console.error('Unexpected error:', error);
    throw error;
  }
};

export { updateSpeech };
