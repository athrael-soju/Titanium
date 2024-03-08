interface ImageToTextUpdateData {
  isImageToTextEnabled: boolean;
  userEmail: string;
}

interface ImageToTextAddUrlData {
  userEmail: string;
  file: {
    id: string;
    imageId: string;
    name: string;
    type: string;
    url: string;
  };
}
const updateImageToText = async ({
  isImageToTextEnabled,
  userEmail,
}: ImageToTextUpdateData): Promise<any> => {
  try {
    const response = await fetch('/api/vision/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        isImageToTextEnabled,
        userEmail,
      }),
    });
    return response.json();
  } catch (error) {
    console.error('Unexpected error: ', error);
    throw error;
  }
};

const deleteImageFile = async (
  file: {
    id: string;
    imageId: string;
    name: string;
    type: string;
    url: string;
  },
  userEmail: string
): Promise<any> => {
  try {
    const response = await fetch('/api/vision/itt/delete-url', {
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

const addImageToTextUrl = async ({
  userEmail,
  file,
}: ImageToTextAddUrlData): Promise<any> => {
  try {
    const response = await fetch('/api/vision/itt/add-url', {
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

export { updateImageToText, deleteImageFile, addImageToTextUrl };
