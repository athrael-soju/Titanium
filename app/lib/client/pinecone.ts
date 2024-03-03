import { Pinecone } from '@pinecone-database/pinecone';

const apiKey = process.env.PINECONE_API as string,
  indexName = process.env.PINECONE_INDEX as string;

const config = {
  apiKey,
};

const pineconeClient = new Pinecone(config);

const getClient = async () => {
  return pineconeClient;
};

const getIndex = async () => {
  const client = await getClient();
  return client.index(indexName);
};

// Helper function to chunk the array into smaller arrays of a given size
function chunkArray(array: any[], chunkSize: number): any[][] {
  const result: any[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
}

const upsert = async (data: any[], user: IUser, chunkBatch: string) => {
  try {
    const index = await getIndex();
    const chunkedData = chunkArray(data, parseInt(chunkBatch));
    console.log('chunkedData', chunkedData[0][0]);
    for (const chunk of chunkedData) {
      await index.namespace(user.ragId as string).upsert(chunk);
    }
    return { success: true };
  } catch (error: any) {
    console.error('Error upserting in Pinecone: ', error);
    throw error;
  }
};

const upsertOne = async (vectorMessage: any[], nameSpace: string) => {
  try {
    const index = await getIndex();
    await index.namespace(nameSpace).upsert(vectorMessage);
    return { success: true };
  } catch (error: any) {
    console.error('Error upserting in Pinecone: ', error);
    throw error;
  }
};

const updateMetadata = async (id: string, metadata: any, nameSpace: string) => {
  try {
    const index = await getIndex();
    await index.namespace(nameSpace).update({ id, metadata });
    return { success: true };
  } catch (error: any) {
    console.error('Error updating in Pinecone: ', error);
    throw error;
  }
};

const queryByNamespace = async (
  namespace: string,
  topK: string,
  embeddedMessage: any
) => {
  const index = await getIndex();
  const result = await index.namespace(namespace).query({
    topK: parseInt(topK),
    vector: embeddedMessage.embeddings,
    includeValues: false,
    includeMetadata: true,
    //filter: { genre: { $eq: 'action' } },
  });
  return result;
};

const deleteOne = async (id: string, user: IUser) => {
  const index = await getIndex();
  const result = await index.namespace(user.ragId as string).deleteOne(id);
  console.log(result);
  return result;
};

const deleteMany = async (
  idList: string[],
  user: IUser,
  chunkBatch: string
) => {
  try {
    const index = await getIndex();
    const chunkedIdList = chunkArray(idList, parseInt(chunkBatch));
    for (const chunk of chunkedIdList) {
      await index.namespace(user.ragId as string).deleteMany(chunk);
    }
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting many in Pinecone: ', error);
    throw error;
  }
};

const deleteAll = async (user: IUser) => {
  const index = await getIndex();
  const result = await index.namespace(user.ragId as string).deleteAll();
  return result;
};

export const pinecone = {
  upsertOne,
  upsert,
  queryByNamespace,
  deleteOne,
  deleteMany,
  deleteAll,
  updateMetadata,
};
