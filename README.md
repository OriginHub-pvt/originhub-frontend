# 🧭 OriginHub Frontend

The OriginHub Frontend is a modern web application built with Next.js and React, providing the user-facing interface for the OriginHub ecosystem — a platform that transforms real-world problems into validated startup opportunities using AI and MLOps-driven insights.

---

## 🚀 Overview

OriginHub enables innovators, students, and developers to:

- **Chat with AI** to transform problems into startup ideas
- **Submit structured problem statements** through an intuitive interface
- **Browse the marketplace** of validated startup ideas
- **Collaborate in idea threads** and discussions
- **Generate validated AI-driven startup roadmaps**
- **Showcase completed projects** and startups

This frontend application powers the user experience — from problem submission to roadmap visualization — and connects seamlessly with the backend APIs and ML services.

---

## 🏗️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16, React 19 |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 |
| **Icons** | SVG Icons (Heroicons) |
| **State Management** | React Hooks (useState, useMemo) |
| **API Integration** | Axios with backend (FastAPI/Django) |
| **Deployment** | Vercel, AWS Amplify, or Kubernetes |
| **Containerization** | Docker |
| **Monitoring** | Sentry, Prometheus (via backend integration) |

---

## 📂 Folder Structure

```
originhub-frontend/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Landing page
│   ├── globals.css         # Global styles and theme
│   ├── chat/               # AI chat interface for ideation
│   │   └── page.tsx
│   ├── marketplace/        # Idea marketplace with search
│   │   └── page.tsx
│   ├── explore/            # Problem discovery feed (future)
│   ├── thread/[id]/        # Discussion threads (future)
│   ├── roadmap/[id]/       # AI-generated roadmaps (future)
│   ├── showcase/           # Completed startup showcase (future)
│   ├── dashboard/          # User dashboard (future)
│   └── admin/              # Moderator panel (future)
├── components/
│   ├── Navigation.tsx      # Main navigation component
│   ├── IdeaCard.tsx        # Idea card component
│   └── PostIdeaModal.tsx   # Modal for posting new ideas
├── public/                 # Static assets
├── styles/                 # Global styles (in app/globals.css)
├── package.json
├── tsconfig.json
└── README.md
```

---

## ⚙️ Environment Setup

### Prerequisites

- Node.js ≥ 18
- npm or yarn
- Docker (optional, for containerized runs)

### Installation

```bash
# Clone the repository
git clone https://github.com/OriginHub-pvt/originhub-frontend.git
cd originhub-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to access the app.

### Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

---

## 🌐 API Integration

The frontend communicates with the backend API (originhub-backend) for:

- Problem submissions
- AI validation feedback
- Idea thread discussions
- Roadmap retrieval and updates
- User authentication and profiles

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=https://api.originhub.io
```

---

## 🧱 Key Pages & Features

### ✅ Implemented Pages

| Page | Description | Status |
|------|-------------|--------|
| **Landing** | Overview of the platform with CTA to start chatting | ✅ Complete |
| **Chat** | AI-powered chat interface for transforming problems into startup ideas | ✅ Complete |
| **Marketplace** | Browse, search, and filter startup ideas with card-based layout | ✅ Complete |

### 🚧 Future Pages

| Page | Description | Status |
|------|-------------|--------|
| **Explore** | Problem feed with filters and search | 🚧 Planned |
| **Thread** | Discussion view with nested comments and AI summarization | 🚧 Planned |
| **Roadmap** | Timeline visualization of AI-generated startup plan | 🚧 Planned |
| **Showcase** | Gallery of successful startups/projects | 🚧 Planned |
| **Dashboard** | Personalized view for users' submissions and collaborations | 🚧 Planned |
| **Admin Panel** | Moderation and monitoring tools for platform maintainers | 🚧 Planned |

---

## 🎨 Design System

### Color Scheme

- **Primary Blue**: `#0e3a5f` - Deep blue for primary actions
- **Accent Teal**: `#14b8a6` - Teal for accents and highlights
- **Neutral Grays**: Slate color palette for text and backgrounds

### Typography

- **Font Family**: Geist Sans (via Next.js font optimization)
- **Font Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Components

All components follow a consistent design system with:
- Rounded corners (`rounded-xl`, `rounded-2xl`)
- Smooth transitions and hover effects
- Responsive design (mobile-first approach)
- Accessibility considerations (ARIA labels, keyboard navigation)

---

## 🧩 Reusable Components

### Current Components

- **Navigation** - Sticky navigation bar with responsive mobile menu
- **IdeaCard** - Card component for displaying startup ideas
- **PostIdeaModal** - Modal form for submitting new ideas

### Component Features

- **Navigation**: Logo, menu items, mobile hamburger menu, active state indicators
- **IdeaCard**: Title, description, problem preview, tags, status badges, upvotes, views
- **PostIdeaModal**: Form validation, tag management, responsive design, keyboard shortcuts

---

## 🔍 Key Features

### Chat Interface
- Real-time AI chat for ideation
- Message history
- Loading states and animations
- Responsive input area

### Marketplace
- Search functionality (searches titles, descriptions, problems, tags)
- Tag filtering
- Sort options (newest, most popular, most upvoted)
- Post new ideas with validation
- Responsive grid layout (1-3 columns based on screen size)

### Idea Management
- Create new ideas with comprehensive form
- View ideas in card format
- Filter and search through ideas
- Tag-based organization

---

## 🧪 Testing

### Unit Testing

```bash
# Run unit tests (when configured)
npm run test
```

### End-to-End Testing

```bash
# Run E2E tests (when configured)
npm run test:e2e
```

### Linting

```bash
# Run ESLint
npm run lint
```

---

## 🐳 Docker Support

### Build Docker Image

```bash
# Build Docker image
docker build -t originhub-frontend .
```

### Run Container

```bash
# Run container
docker run -p 3000:3000 originhub-frontend
```

### Dockerfile (Example)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 📈 Deployment

### Vercel Deployment

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import your repository in Vercel
3. Vercel will automatically detect Next.js and deploy

### Kubernetes Deployment

For Kubernetes deployment:

1. Build Docker image
2. Push to container registry
3. Deploy using Kubernetes manifests
4. Configure ingress and services

### CI/CD

CI/CD is configured via GitHub Actions to automate:

- Linting & build checks
- Deployment to staging/production
- Integration testing

---

## 🧠 Contributing

1. **Fork the repository**
2. **Create a new branch** (`git checkout -b feature/awesome-feature`)
3. **Commit changes** with clear messages (`git commit -m 'Add awesome feature'`)
4. **Push to branch** (`git push origin feature/awesome-feature`)
5. **Create a Pull Request**

Please follow the organization's code of conduct and contribution guidelines defined in `.github/CONTRIBUTING.md`.

### Code Style

- Use TypeScript for type safety
- Follow ESLint rules
- Use Tailwind CSS for styling
- Write reusable components
- Add comments for complex logic

---

## 🚧 Future Enhancements

- [ ] Dark mode support
- [ ] Multilingual problem submissions
- [ ] Personalized startup recommendations
- [ ] Gamified badges for contributors
- [ ] Real-time collaboration features
- [ ] Advanced analytics and insights
- [ ] Integration with external APIs (LinkedIn, GitHub)
- [ ] Mobile app version
- [ ] Advanced search with filters
- [ ] Idea comparison feature
- [ ] Export roadmaps as PDF
- [ ] Social sharing features

---

## 📝 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

---

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**: Change the port in `package.json` or kill the process using port 3000
2. **Module not found**: Run `npm install` to install dependencies
3. **Build errors**: Check Node.js version (requires ≥ 18)
4. **TypeScript errors**: Run `npm run build` to see detailed error messages

---

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

---

## 🪪 License

This project is licensed under the MIT License.

---

## 👥 Team

OriginHub Development Team

---

## 📧 Contact

For questions or support, please open an issue on GitHub or contact the team.

---

**Built with ❤️ by the OriginHub Team**
