# What is Titanium?

Titanium is a modern web application built with Next.js, leveraging the latest OpenAI API to offer an advanced Generative and Conversational AI experience. It's still in very early stages, but I aim to add implementations for the latest OpenAI API's, including:

- Multi-user Authentication using next-auth ✅ (Including a custom CredentialProvider for guest accounts)
- Customizable, Multipurpose Assistants with File Upload support. ✅ (Also supports complete deletion of all Assistant related data)
- Code Interpretation/Generation. ✅ (Supported as part of Assistants implementation)
- Query/Discussion of uploaded documents. ✅ (Supported as part of Assistants implementation)
- Vision via 'gpt-4-vision-preview'. ✅ (Currently supports Image Analysis for multiple urls. File uploads may come later, but not a priority)
- Speech (TTS) ✅ (Supports tts-1 and tts-1-hd and all available voice models)
- Speech (STT) ✅ (Available via button toggle in the input chat box)
- RAG - ✅ (Uses advanced document parsing by Unstructured.io API, ada-003 Embeddings by OpenAIand Pinecone Serverless)
- Update documentation to include corrections and new features - 🚧 (In progress)
- Refactoring the spaghetti - 📌 (In progress)
- Persistent multi-user memory - 📌 (todo)
- Image Generation via DALLE-3 - 📌 (todo)

# Libraries

- Next.js Framework: Utilizes the latest features of Next.js for server-side rendering and static site generation.
- Next-auth + mongodb adapter for authentication
- OpenAI Integration: Includes integration with [OpenAI's API](https://platform.openai.com/docs/api-reference).
- Markdown Rendering: Supports rendering of Markdown content with react-markdown.
- Syntax Highlighting: Implements syntax highlighting in code snippets using react-syntax-highlighter.
- Material UI: Styled with Material-UI components for a responsive and modern UI/UX.

# Setting Up Your Development Environment

## OpenAI

1. Go to [OpenAI](https://beta.openai.com/signup/) and create a new account or sign in to your existing account.
2. Navigate to the API section.
3. You'll see a key listed under "API Keys". This is your OpenAI API key.
4. Add this key to your `.env.local` file:

```env
OPENAI_API_KEY=<your-openai-api-key>
OPENAI_API_MODEL="gpt-4-1106-preview" // This model is required for using the latest beta features, such as assistants.
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
3. For "Authorization callback URL", enter `http://localhost:3000/api/auth/callback/github` (replace `http://localhost:3000` with your deployment URL if you're deploying your app).
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

## Other Credentials

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<your-nextauth-secret> // Generate a secret using `openssl rand -base64 32`
NODE_ENV='development'
```

# Running and Using the App

## Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

![image](https://github.com/athrael-soju/Titanium/assets/25455658/7ec9bd34-3aec-4a48-8584-aeee0fd34a15)

## Logging in

- If you set up credentials for GitHub and/or Google, you can use those to log in. If you didn't set up credentials, you can use the Custom Credential Provider to log in with a guest account. This can be done by clicking on the avatar icon on the top right corner of the screen.
- Keep in mind that upon logout from a guest account, you will lose access to your assistant and all related data.

![image-1](https://github.com/athrael-soju/Titanium/assets/25455658/1dedc1e1-6250-4302-b9f3-aca27e88a206)

## Using the standard chat

- The standard chat is a simple chat that uses the OpenAI API to generate responses. It doesn't use any of the assistant features, but it's pretty fast, since it uses streaming to generate responses.

![image-2](https://github.com/athrael-soju/Titanium/assets/25455658/242710b4-9da9-4cde-afcd-a441f12464bf)

## Using the assistant

### Select the assistant option

![image-3](https://github.com/athrael-soju/Titanium/assets/25455658/74066948-c08a-42c7-be53-4a461c5c0adc)

### Provide a name and description for your assistant. Enable it from the switch on the bottom right corner and click "ACCEPT".

![image-4](https://github.com/athrael-soju/Titanium/assets/25455658/1a759412-b71e-423d-84d1-1ca1c6d65d38)

### Upload a file the assistant will use to generate responses. (Optional)

![image-5](https://github.com/athrael-soju/Titanium/assets/25455658/23535de6-ccad-4e40-8b7d-8f5be8eb8eca)

### Chat with your Assistant. Responses may take a while to generate, as streaming is not yet supported.

![image-6](https://github.com/athrael-soju/Titanium/assets/25455658/336c8ee8-9df7-49da-a43f-f28264ff1a92)

### General Notes

- You'll need to click "ACCEPT" to save any assistant related changes.
- The "RESET" button will simply clear the mandatory input fields.
- You can delete your Assistant and all associated files by pressing "DELETE" and confirming in a followup dialog. This is non reversible.
- You can also delete independent uploaded files for the assistant by clicking the delete button for the corresponding file in the "Attached Files" List.
- If the assistant is disabled, chat will revert to Standard (Streaming) and any uploaded files will not be available to the assistant.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## That's all folks!

Do you want to collaborate, or have suggestions for improvement?

Happy coding!
