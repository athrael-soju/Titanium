interface VisionUpdateData {
  isTextToImageEnabled: boolean;
  userEmail: string;
}

interface TextToImageAddUrlData {
  userEmail: string;
  file: {
    id: string;
    textToImageId: string;
    name: string;
    type: string;
    url: string;
  };
}
const updateVision = async ({
  isTextToImageEnabled,
  userEmail,
}: VisionUpdateData): Promise<any> => {
  try {
    const response = await fetch('/api/vision/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        isTextToImageEnabled,
        userEmail,
      }),
    });
    return response.json();
  } catch (error) {
    console.error('Unexpected error: ', error);
    throw error;
  }
};

const deleteTextToImageFile = async (
  file: {
    id: string;
    textToImageId: string;
    name: string;
    type: string;
    url: string;
  },
  userEmail: string
): Promise<any> => {
  try {
    const response = await fetch('/api/vision/tti/delete-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ file, userEmail }),
    });
    return response.json();
  } catch (error) {
    console.error('Unexpected error: ', error);
    throw error;
  }
};

const addTextToImageUrl = async ({
  userEmail,
  file,
}: TextToImageAddUrlData): Promise<any> => {
  try {
    const response = await fetch('/api/vision/tti/add-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userEmail,
        file,
      }),
    });
    return response.json();
  } catch (error) {
    console.error('Failed to upload file: ', error);
  }
};

export { updateVision, deleteTextToImageFile, addTextToImageUrl };
