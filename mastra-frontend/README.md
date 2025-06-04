# Mastra Weather AI - Frontend

The frontend application for the Mastra Weather AI Assistant, built with Next.js 15, CopilotKit, and Tailwind CSS.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- Backend server running (see main README)

### Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables**

   Create a `.env.local` file:

   ```env
   NEXT_PUBLIC_COPILOTKIT_API_URL=http://localhost:4000/api/copilotkit
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/
│   ├── api/copilotkit/route.ts    # CopilotKit API integration
│   ├── copilotkit/                # Chat interface pages
│   ├── components/Weather.tsx     # Weather display component
│   ├── layout.tsx                 # Root layout with Header
│   ├── page.tsx                   # Landing page
│   └── globals.css               # Global styles
├── components/
│   ├── Header.tsx                # Reusable navigation header
│   └── Footer.tsx                # Reusable footer
└── lib/
    ├── types.ts                  # TypeScript definitions
    └── utils.ts                  # Utility functions
```

## 🎨 Key Features

- **Landing Page**: Beautiful hero section with feature highlights
- **Chat Interface**: CopilotKit-powered conversational UI
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **TypeScript**: Full type safety throughout the application
- **Modern UI**: Clean, accessible design with proper semantics

## 🛠️ Development

### Available Scripts

```bash
npm run dev      # Start development server with Turbopack
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Key Files to Customize

- **`src/app/page.tsx`** - Landing page content and layout
- **`src/app/copilotkit/page.tsx`** - Chat interface configuration
- **`src/components/Header.tsx`** - Navigation and branding
- **`tailwind.config.ts`** - Theme and design system
- **`src/app/globals.css`** - Global styles and CSS variables

### Styling

This project uses:

- **Tailwind CSS** for utility-first styling
- **Class Variance Authority (CVA)** for component variants
- **Tailwind Merge** for className optimization
- **Tailwind Animate** for smooth animations

### CopilotKit Integration

The chat interface is powered by CopilotKit:

- Chat components are in `src/app/copilotkit/`
- API route handles backend communication in `src/app/api/copilotkit/route.ts`
- Weather-specific UI in `src/app/components/Weather.tsx`

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on every push

### Other Platforms

1. Build the project: `npm run build`
2. Deploy the `.next` folder
3. Set environment variables
4. Configure server to serve the application

## 📚 Learn More

- [Next.js App Router](https://nextjs.org/docs/app)
- [CopilotKit Documentation](https://copilotkit.ai/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs)

---

For the complete project setup and backend configuration, see the [main README](../README.md).
