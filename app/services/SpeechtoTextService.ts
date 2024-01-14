interface TextToSpeechData {
  blob: Blob;
}

const getAudioTranscript = async ({ blob }: TextToSpeechData): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append('file', blob);

    const response = await fetch('/api/speech/stt', {
      method: 'POST',
      body: formData,
    });

    return response.text();
  } catch (error) {
    console.error('Unexpected error:', error);
    throw error;
  }
};

export { getAudioTranscript };
