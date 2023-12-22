import axios from 'axios';

interface VisionRetrieveData {
  userEmail: string;
}

const retrieveVision = async ({
  userEmail,
}: VisionRetrieveData): Promise<any> => {
  try {
    const response = await axios.get(`/api/vision/retrieve/`, {
      headers: { userEmail: userEmail },
    });

    return response.data;
  } catch (error) {
    console.error('Unexpected error:', error);
    throw error;
  }
};

const deleteVisionFile = async ({ file }: { file: string }): Promise<any> => {
  try {
    const response = await axios.post('/api/vision/delete-file', {
      file,
    });
    return response.data;
  } catch (error) {
    console.error('Unexpected error:', error);
    throw error;
  }
};

const uploadVisionFile = async (
  file: File,
  userEmail: string
): Promise<Response | undefined> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userEmail', userEmail);

    const fileUploadResponse = await fetch('/api/vision/upload', {
      method: 'POST',
      body: formData,
    });
    return fileUploadResponse;
  } catch (error) {
    console.error('Failed to upload file:', error);
  }
};

export { retrieveVision, deleteVisionFile, uploadVisionFile };
