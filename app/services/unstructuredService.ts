const parseDocument = async (fileName: string): Promise<any> => {
  try {
    const response = await fetch('/api/parse/unstructured', {
      method: 'GET',
      headers: { fileName: fileName },
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
