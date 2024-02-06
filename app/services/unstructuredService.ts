const parseDocument = async (file: RagFile): Promise<any> => {
  try {
    const response = await fetch('/api/parse/unstructured', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ file }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const jsonResponse = await response.json();
    console.log(jsonResponse.message);
    //console.log(jsonResponse.message, jsonResponse.file);
    return jsonResponse;
  } catch (error) {
    console.error('Unexpected error:', error);
    throw error;
  }
};

export { parseDocument };
