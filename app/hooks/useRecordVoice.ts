import { useEffect, useState, useRef } from 'react';

export const useRecordVoice = () => {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );

  const [recording, setRecording] = useState(false);

  const chunks = useRef<Blob[]>([]);

  const startRecording = () => {
    if (mediaRecorder) {
      setRecording(true);
      mediaRecorder.start();
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorder) {
      throw new Error('MediaRecorder not initialized');
    }

    return new Promise<Blob>((resolve, reject) => {
      mediaRecorder.ondataavailable = (event) => {
        setRecording(false);
        resolve(event.data);
      };

      mediaRecorder.onerror = (error) => {
        reject(error);
      };
      mediaRecorder.stop();
    });
  };

  const initialMediaRecorder = (stream: MediaStream) => {
    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.onstart = () => {
      chunks.current = [];
    };

    mediaRecorder.ondataavailable = (ev) => {
      chunks.current.push(ev.data);
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(chunks.current, { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);
      return { audioUrl, audioBlob };
    };

    setMediaRecorder(mediaRecorder);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(initialMediaRecorder);
    }
  }, []);

  return { recording, startRecording, stopRecording };
};
