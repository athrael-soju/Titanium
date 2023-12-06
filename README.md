# What is Titanium?

Titanium is a modern web application built with Next.js, leveraging Typescript for dynamic user interfaces and integrating with OpenAI's API. It's still in very early stages, but I aim to add implementations for all new OpenAI API's, including:

- Multipurpose Assistants.
- Code Interpretation/Generation.
- Query/Discussion of uploaded documents.
- Image Analysis/Generation.
- Traditional RAG, using Vector DB's.
- Persistent multi-user memory.

# Libraries

- Next.js Framework: Utilizes the latest features of Next.js for server-side rendering and static site generation.
- OpenAI Integration: Includes integration with [OpenAI's API](https://platform.openai.com/docs/api-reference).
- Markdown Rendering: Supports rendering of Markdown content with react-markdown.
- Syntax Highlighting: Implements syntax highlighting in code snippets using react-syntax-highlighter.
- Material UI: Styled with Material-UI components for a responsive and modern UI/UX.

## Getting Started

First, create a new file in the root folder and name it `.env.local` provide your openAI API key. I tshould look something like this:

```
OPENAI_API_MODEL="gpt-3.5-turbo"
OPENAI_API_KEY="YOUR_API_KEY"
```

Or copy `.env.example` and rename it to `.env.local` and provide your API key.

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

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

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
