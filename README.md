# What is Titanium?

Titanium is a modern web application built with Next.js, leveraging the latest OpenAI APIs to offer an advanced Generative and Conversational AI experience. It's still pretty much a prototype, but I think it's a good start. Here's a list of some of the features:

- Multi-user Authentication using next-auth, including a custom CredentialProvider for guest accounts.✅
- Customizable, Multipurpose Assistants with File Upload support. Also supports complete deletion of all Assistant related data.✅
- Vision via 'gpt-4-vision-preview'. Currently supports Image Analysis for multiple urls. File uploads may come later, but not a priority.✅
- Text to Speech (TTS), Supporting tts-1, tts-1-hd and all available voice models.✅
- Speech to Text (STT), available via button toggle in the input chat box.✅
- Retrieval Augmented Generation (RAG), Using advanced document parsing by Unstructured.io API, ada-003 Embeddings by OpenAI and Pinecone Serverless for fast and efficient indexing & retrieval.✅

Some of the features I'm working on include:

- Persistent multi-user memory.🚧
  - NoSQL Based.✅
  - Vector Based.🚧
- Image Generation via DALLE-3.🚧
- Video (TTV) - As per latest reveal from OpenAI's latest Diffusion Model, called [Sora](https://openai.com/sora).🚧

And the obligatory:

- Bug fixes and performance improvements.🐛
- Refactor the spaghetti.🍝

# Libraries

- Next.js is a React framework that allows you to build server-rendered applications. It is a complete full-stack solution that includes a variety of features, such as server-side rendering, static site generation, and API routes.
- Next-auth + mongodb adapter for authentication
- OpenAI API to leverage the latest Generative and Conversational capabilities of OpenAI's GPT-4. [OpenAI's API](https://platform.openai.com/docs/api-reference).
- Material UI for the UI components.
- MongoDB Atlas for user data and state management.
- Unstructured.io API for advanced document parsing.
- Pinecone Serverless for advanced Semantic Search.
- Vercel for deployment.

# Setting Up Your Development Environment

## OpenAI

1. Go to [OpenAI](https://beta.openai.com/signup/) and create a new account or sign in to your existing account.
2. Navigate to the API section.
3. You'll see a key listed under "API Keys". This is your OpenAI API key.
4. Add this key to your `.env.local` file:

```env
OPENAI_API_KEY=<your-openai-api-key>
OPENAI_API_MODEL="gpt-4-turbo-preview" // This model is required for using the latest beta features, such as assistants.
```

## MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account or sign in to your existing account.
2. Click on "Create a New Cluster". Select the free tier and choose the options that best suit your needs.
3. Wait for the cluster to be created. This can take a few minutes.
4. Once the cluster is created, click on "CONNECT".
5. Add a new database user. Remember the username and password, you will need them to connect to the database.
6. Add your IP address to the IP Whitelist. If you're not sure what your IP address is, you can select "Allow Access from Anywhere", but be aware that this is less secure.
7. Choose "Connect your application". Select "Node.js" as your driver and copy the connection string.
8. Replace `<password>` in the connection string with the password of the database user you created earlier. Also replace `<dbname>` with the name of the database you want to connect to.
9. In your `.env.local` file, set `MONGODB_URI` to the connection string you just created:

## GitHub and Google Credentials for NextAuth

NextAuth requires credentials for the authentication providers you want to use. You can find instructions on how to set up credentials for each provider below. If you wish to skip this step you can use the Custom Credential Provider to login with guest account, but keep in mind that upon logout, you will lose access to your assistant and all related data.

### GitHub

1. Go to [GitHub Developer Settings](https://github.com/settings/developers) and click on "New OAuth App".
2. Fill in the "Application name", "Homepage URL" and "Application description" as you see fit.
3. For the "Authorization callback URL", enter `http://localhost:3000/api/auth/callback/github` (replace `http://localhost:3000` with your deployment URL if you're deploying your app).
4. Click on "Register application".
5. You'll now see a "Client ID" and a "Client Secret". Add these to your `.env.local` file:

```env
GITHUB_ID=<your-github-client-id>
GITHUB_SECRET=<your-github-client-secret>
```

### Google

1. Go to [Google Cloud Console](https://console.cloud.google.com/) and create a new project.
2. Search for "OAuth consent screen" and fill in the required fields.
3. Go to "Credentials", click on "Create Credentials" and choose "OAuth client ID".
4. Choose "Web application", enter a name for your credentials and under "Authorized redirect URIs" enter `http://localhost:3000/api/auth/callback/google` (replace `http://localhost:3000` with your deployment URL if you're deploying your app).
5. Click on "Create".
6. You'll now see a "Client ID" and a "Client Secret". Add these to your `.env.local` file:

```env
GOOGLE_ID=<your-google-client-id>
GOOGLE_SECRET=<your-google-client-secret>

```

## Unstructured.io

Go to `https://unstructured.io/api-key-free` and sign up for a free account. You will receive an API key in your email. Add this key to your `.env.local` file:

```env
UNSTRUCTURED_API=<your-unstructured-api-key>
```

## Pinecone Serverless

Go to `https://www.pinecone.io/` and sign up for a free account. You will receive an API key in your email. When creating your index, make sure to select the Serverless Option and the "ada-002" template. Add this key to your `.env.local` file:

```env
PINECONE_API='your-pinecone-api-key'
PINECONE_INDEX='your-pinecone-index-name'
PINECONE_DISABLE_RUNTIME_VALIDATIONS='false'
```

## Other Credentials

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<your-nextauth-secret> // Generate a secret using `openssl rand -base64 32`
NODE_ENV='development'
```

# Running the App locally

Start the development server with the following command:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Then, open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
![image](https://github.com/athrael-soju/Titanium/assets/25455658/7ec9bd34-3aec-4a48-8584-aeee0fd34a15)

# Logging in

If you set up credentials for GitHub and/or Google, you can use those to log in. If you didn't set up credentials, you can use the Custom Credential Provider to log in with a guest account. This can be done by clicking on the avatar icon on the top right corner of the screen.

Keep in mind that upon logout from a guest account, you will lose access to your assistant and all related data.
![image-1](https://github.com/athrael-soju/Titanium/assets/25455658/1dedc1e1-6250-4302-b9f3-aca27e88a206)

# Features

To access the features, you can click the humburger icon at the left of the inpupt box. A menu will pop up, allowing you to make a selection. Available features are:

- R.A.G. (Retrieval Augmented Generation)
- Assistant
- Vision
- Speech

## Streaming Chat

![image](https://github.com/athrael-soju/Titanium/assets/25455658/541e228a-d1ec-4a85-b55c-202f55f24a80)

Streaming Chat is the default mode of chat. It's a simple chat interface that allows you to chat with the AI in a seamless manner. All you have to do is type your message and press enter. The AI will respond with a message of its own.

## R.A.G. (Retrieval Augmented Generation)

![image](https://github.com/athrael-soju/Titanium/assets/25455658/2337ea2c-083b-4d1d-85dd-e1edca25f9aa)

R.A.G, or Retrieval Augmented Generation, is an advanced feature that allows you to query the AI with a document. The AI will then use the information in the document to generate a response. To use R.A.G, you can click the "R.A.G" button at the left of the input box. A menu will pop up showing:

- Top K: The number of documents to return using semantic search. More documents will give the AI more information to work with, but it will also take longer to process.
- Batch Size: The number of documents to process at once. Due to limitations on how much data can be upserted to the Vector Index at once, a large number of documents maybe rejected, so a default of 250 can be used as a default.
- Parsing Strategy: The strategy to use for parsing the document. Each of the options has its own strengths and weaknesses, so you may need to experiment to find the best one for your use case. If you care more for the quality of the parsed data, you can use the "Hi Res" option. If you care more for the speed of the parsing, you can use the "Fast" option. Otherwise, "auto" will work fine.

## Assistant

![image](https://github.com/athrael-soju/Titanium/assets/25455658/6909c5a9-115b-436e-85ea-8434d35a92e8)

The Assistant is an OpenAI feature that allows you to create and manage your own AI assistant.
You can:

- Specify a Name,
- Set a description, which the Assistant will abide to.
- Upload files, which the AI will use to generate responses.
- Delete the assistant and all associated files by pressing "DELETE" and confirming in a followup dialog. This is non reversible.

The Assistant is a handy tool, which comes with R.A.G. and Long term memory, as well as capabilities to interpret and generate code. However, it does not yet support streaming chat and costs more to use.

## Vision

![image](https://github.com/athrael-soju/Titanium/assets/25455658/e295197b-53d8-4225-9145-5b94b7079fb4)

Vision will allow a user to add a URL to an image and the AI will analyze the image and provide a response. The response will include a description of the image, as well as any other relevant information, including numerical data. At this point, the feature does not support file uploads, but this may be added in the future.

## Speech

![image](https://github.com/athrael-soju/Titanium/assets/25455658/c67a8fa4-f0d4-42ef-8707-773f24028d06)

Speech comes in two parts: Text to Speech (TTS) and Speech to Text (STT). TTS will allow the AI to generate speech from text, while STT will allow the AI to transcribe speech to text. To use TTS, you can select a model and voice from the dropdown menu. To use STT, you can click the microphone icon at the very left of the input box to record a message. Once done, you can click the microphone icon again to stop recording. The AI will then transcribe the message and you can send it to the AI by pressing enter.

# Feature Combinations

Some features can play really well together. For example:

- All features, except the Assistant are used in conjunction with the Streaming Chat feature. This means that you can use R.A.G., Vision, and Speech in the chat, allowing you to query the AI with documents, images, and speech, respectively and receive a response in real time.
- Speech can be used in conjunction with any other feature, allowing you to speak to the AI instead of typing. This can be especially useful if you're on the go or if you have a disability that makes typing difficult.
- Vision, combined with Text to Speech, as well as Speech to Text, can be a great tool when accessibility is a concern. For example, you can use Vision to analyze an image, verbally ask the AI a question about the image, and then have the AI respond with a verbal answer, as well.

# Feature Limitations

Since some features have contradicting functionalities, when one is enabled, others will be disabled. So, enabling either the Assistant, R.A.G., or Vision will disable the others. This is because each of these features involve uploading files, which they use to draw information from.

# General Notes

- Disabling all features will revert chat to the default streaming chat, without any context or memory.
- When making changes to the features, you'll need to click "UPDATE" to save any changes. These changes will persist even after you log out, for your respective account.
- When deleting files with R.A.G. they will also be deleted from the Pinecone Index. This is to support data privacy and security. The same applies to the Assistant, where all files will be deleted from the OpenAI server.

# Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

# That's all folks!

Do you want to collaborate, or have suggestions for improvement? You can reach me on:

- [LinkedIn](https://www.linkedin.com/in/athosg/)
- [Professional Website](https://athosgeorgiou.com/)
- [Tech Blog](https://athrael.net/)

### Happy coding!
