interface VisionUpdateData {
  isVisionEnabled: boolean;
  userEmail: string;
}

interface VisionAddUrlData {
  userEmail: string;
  file: {
    id: string;
    visionId: string;
    name: string;
    type: string;
    url: string;
  };
}
const updateVision = async ({
  isVisionEnabled,
  userEmail,
}: VisionUpdateData): Promise<any> => {
  try {
    const response = await fetch('/api/vision/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        isVisionEnabled,
        userEmail,
      }),
    });
    return response.json();
  } catch (error) {
    console.error('Unexpected error: ', error);
    throw error;
  }
};

const deleteVisionFile = async (
  file: {
    id: string;
    visionId: string;
    name: string;
    type: string;
    url: string;
  },
  userEmail: string
): Promise<any> => {
  try {
    const response = await fetch('/api/vision/delete-url/', {
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

const addVisionUrl = async ({
  userEmail,
  file,
}: VisionAddUrlData): Promise<any> => {
  try {
    const response = await fetch('/api/vision/add-url', {
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

export { updateVision, deleteVisionFile, addVisionUrl };
