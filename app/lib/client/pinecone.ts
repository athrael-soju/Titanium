import { Pinecone } from '@pinecone-database/pinecone';

const apiKey = process.env.PINECONE_API as string,
  host = process.env.PINECONE_HOST,
  region = process.env.PINECONE_REGION,
  indexName = process.env.PINECONE_INDEX as string;

const config = {
  apiKey,
  host,
  region,
};

const pineconeClient = new Pinecone(config);

const getClient = async () => {
  return pineconeClient;
};

const getIndex = async () => {
  const client = await getClient();
  return client.index(indexName);
};

const upsert = async (data: any, user: IUser) => {
  const index = await getIndex();
  const result = await index.namespace(user.ragId as string).upsert([
    {
      id: 'vec1',
      values: [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1],
      metadata: { genre: 'drama' },
    },
    {
      id: 'vec2',
      values: [0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2],
      metadata: { genre: 'action' },
    },
    {
      id: 'vec3',
      values: [0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3],
      metadata: { genre: 'drama' },
    },
    {
      id: 'vec4',
      values: [0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4],
      metadata: { genre: 'action' },
    },
  ]);
  console.log(result);
  return result;
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

const deleteMany = async (idList: string[], user: IUser) => {
  const index = await getIndex();
  const result = await index.deleteMany(idList);
  console.log(result);
  return result;
};

const deleteManyByMetadata = async (metadata: string[], user: IUser) => {
  const index = await getIndex();
  metadata.forEach(async (data) => {
    const result = await index.deleteMany({ data });
    console.log(result);
  });
};

const deleteAll = async (user: IUser) => {
  const index = await getIndex();
  const result = await index.namespace(user.ragId as string).deleteAll();
  console.log(result);
  return result;
};

const update = async (data: any, user: IUser) => {
  const index = await getIndex();
  const result = await index.update({
    id: '18593',
    metadata: { genre: 'romance' },
  });
  console.log(result);
  return result;
};

export {
  upsert,
  queryByRecordId,
  queryByNamespace,
  deleteOne,
  deleteMany,
  deleteManyByMetadata,
  deleteAll,
  update,
};
