const parseDocument = async (
  file: RagFile,
  parsingStrategy: string
): Promise<any> => {
  try {
    const response = await fetch('/api/parse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ file, parsingStrategy }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const jsonResponse = await response.json();
    console.log(jsonResponse.message);
    return jsonResponse;
  } catch (error) {
    console.error('Unexpected error:', error);
    throw error;
  }
};

export { parseDocument };
