# DocAnalyze (Next.js Version)

AI-powered document analysis tool built with Next.js, React, and TailwindCSS.

## Features

- PDF document analysis using Google's Gemini AI
- Google OAuth authentication
- Document history tracking
- Multi-file comparison
- Modern, responsive UI with Tailwind CSS
- Server-side rendering with Next.js
- TypeScript support

## Getting Started

### Prerequisites

- Node.js 18+ 
- Google OAuth credentials
- Google Gemini API key

### Installation

1. Clone the repository and install dependencies:
```bash
git clone <repository-url>
cd docanalyze
npm install
```

2. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```
DATABASE_URL="file:./dev.db"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GEMINI_API_KEY="your-gemini-api-key"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"
```

3. Initialize the database:
```bash
npx prisma db push
npx prisma generate
```

4. Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Migrating from Flask Version

If you're migrating from the Flask version:

1. Copy your existing environment variables:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GEMINI_API_KEY`

2. Generate a new `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

3. Update your Google OAuth configuration to include the new callback URL:
   - Add `http://localhost:3000/api/auth/callback/google` to your authorized redirect URIs

Your existing PDF files and analysis data will need to be manually migrated to the new system.

## Architecture

- `src/app/` - Next.js application routes and API endpoints
- `src/components/` - React components
- `src/utils/` - Utility functions
- `prisma/` - Database schema and migrations
- `public/` - Static assets

## API Routes

- `POST /api/analyze` - Analyze PDF documents
- `GET /api/history` - Get user's analysis history
- `GET /api/analysis/[id]` - Get specific analysis details

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
