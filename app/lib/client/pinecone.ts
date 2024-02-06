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

const upsert = async (data: any[], user: IUser) => {
  try {
    const index = await getIndex();
    // TODO: Make this configurable. Chunking the data into arrays of 100 objects each.
    const chunkedData = chunkArray(data, 100);
    for (const chunk of chunkedData) {
      await index.namespace(user.ragId as string).upsert(chunk);
    }
    return { success: 'true' };
  } catch (error: any) {
    console.error('Error upserting in Pinecone:', error);
    throw error;
  }
};

const queryByRecordId = async (data: any, user: IUser) => {
  const index = await getIndex();
  const result = await index.query({ topK: 10, id: '1' });
  console.log(result);
  return result;
};

const queryByNamespace = async (data: any, user: IUser) => {
  const index = await getIndex();
  const result = await index.namespace(user.ragId as string).query({
    topK: 2,
    vector: [0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3],
    includeValues: true,
    includeMetadata: true,
    filter: { genre: { $eq: 'action' } },
  });
  console.log(result);
  return result;
};

const deleteOne = async (id: string, user: IUser) => {
  const index = await getIndex();
  const result = await index.deleteOne(id);
  console.log(result);
  return result;
};

const deleteMany = async (idList: string[]) => {
  const index = await getIndex();
  const result = await index.deleteMany(idList);
  return result;
};

const deleteAll = async (user: IUser) => {
  const index = await getIndex();
  const result = await index.namespace(user.ragId as string).deleteAll();
  console.log(result);
  return result;
};

const update = async (data: any, user: IUser) => {
  const index = await getIndex();
  // const result = await index.update({
  //   id: '18593',
  //   metadata: { genre: 'romance' },
  // });
  // console.log(result);
  // return result;
};

export const pinecone = {
  upsert,
  queryByRecordId,
  queryByNamespace,
  deleteOne,
  deleteMany,
  deleteAll,
  update,
};