# What is Titanium?

Titanium is a modern web application built with Next.js, using MaterialUI for the UI and leveraging the latest OpenAI API to offer an advanced Generative and Conversational AI experience. It's still in very early stages, but I aim to add implementations for the latest OpenAI API's, including:

- Multi-user Authentication using next-auth ✅ (Including a custom CredentialProvider for guest accounts)
- Customizable, Multipurpose Assistants with File Upload. ✅ (Also supports complete deletion of all Assistant related data)
- Code Interpretation/Generation. ✅ (Supported as part of Assistants implementation)
- Query/Discussion of uploaded documents. ✅ (Supported as part of Assistants implementation)
- Image Analysis/Generation.
- Traditional RAG, using Vector DB's.
- Persistent multi-user memory.

# Libraries

- Next.js Framework: Utilizes the latest features of Next.js for server-side rendering and static site generation.
- Next-auth + mongodb adapter for authentication
- OpenAI Integration: Includes integration with [OpenAI's API](https://platform.openai.com/docs/api-reference).
- Markdown Rendering: Supports rendering of Markdown content with react-markdown.
- Syntax Highlighting: Implements syntax highlighting in code snippets using react-syntax-highlighter.
- Material UI: Styled with Material-UI components for a responsive and modern UI/UX.

## Getting Started

First, create a new file in the root folder and name it `.env.local`. I tshould look something like this:

```
# Created by Vercel CLI
OPENAI_API_KEY=""
OPENAI_API_MODEL="gpt-4-1106-preview" // This model is required for using the latest beta features, such as assistants.
# next-auth - Optional. You can just use a guest account, but keep in mind that once you logout, logging back it will create a new guest account.
GITHUB_ID= 
GITHUB_SECRET=
GOOGLE_ID=
GOOGLE_SECRET=
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=
# mongodb
NODE_ENV='development'
MONGODB_URI= // Needed to store sessions and Assistant related data. I would Suggest Mongodb Atlas, as it's easy to set up.

```

Or copy `.env.example` and rename it to `.env.local` and provide your variables.

```bash
cp .env.example .env.local
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Notes

You'll notice a popup on the landing page asking you to create your new assistant. This is a mockup and not yet implemented, so just enter anytithing in the fields.

Happy coding!
