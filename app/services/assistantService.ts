interface AssistantUpdateData {
  name: string;
  description: string;
  isAssistantEnabled: boolean;
  userEmail: string;
  files: { name: string; id: string; assistandId: string }[];
}
const updateAssistant = async ({
  name,
  description,
  isAssistantEnabled,
  userEmail,
  files,
}: AssistantUpdateData): Promise<any> => {
  try {
    const response = await fetch('/api/assistant/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        description,
        isAssistantEnabled,
        userEmail,
        files,
      }),
    });
    return response.json();
  } catch (error) {
    console.error('Unexpected error: ', error);
    throw error;
  }
};

const deleteAssistantFile = async ({
  file,
}: {
  file: string;
}): Promise<any> => {
  try {
    const response = await fetch('/api/assistant/delete-file', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ file }),
    });
    return response.json();
  } catch (error) {
    console.error('Unexpected error: ', error);
    throw error;
  }
};

const deleteAssistant = async ({
  userEmail,
}: {
  userEmail: string;
}): Promise<any> => {
  try {
    const response = await fetch('/api/assistant/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userEmail }),
    });
    return response.json();
  } catch (error) {
    console.error('Unexpected error: ', error);
    throw error;
  }
};

const uploadFile = async (
  file: File,
  userEmail: string
): Promise<Response | undefined> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userEmail', userEmail);

    const fileUploadResponse = await fetch('/api/assistant/upload', {
      method: 'POST',
      body: formData,
    });
    return fileUploadResponse;
  } catch (error) {
    console.error('Failed to upload file: ', error);
  }
};

export { updateAssistant, deleteAssistantFile, deleteAssistant, uploadFile };
