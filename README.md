# HireWise - AI-Powered Recruitment Platform

> **Umurava AI Hackathon Submission** - An innovation challenge to build AI Products for Human Resources Industry

A modern, full-stack recruitment platform with AI-powered candidate screening built with **Next.js 16**, **TypeScript**, **Redux Toolkit**, and **Tailwind CSS**.

## ✨ Features

### Core Functionality
- **Recruiter Dashboard** - Comprehensive overview of jobs, candidates, and screening results
- **Candidate Portal** - Job browsing, applications, and AI-powered feedback
- **Job Management** - Create, edit, and manage job postings with custom scoring weights
- **Candidate Ingestion** - Support for manual entry and CSV bulk upload
- **AI Screening** - Intelligent candidate analysis powered by AI
- **Shortlist Visualization** - Ranked candidates with detailed scoring breakdowns
- **Bias Reduction Mode** - Hide identifying information to reduce unconscious bias
- **Interview Questions** - AI-generated interview questions for each candidate
- **Candidate Feedback** - Personalized AI feedback for job seekers

### Technical Highlights
- **Next.js 16** - App Router with server-side rendering capabilities
- **Redux Toolkit** - Centralized state management for jobs, candidates, and results
- **TypeScript** - Full type safety throughout the application
- **Tailwind CSS** - Modern, responsive UI design
- **Custom Backend API** - RESTful API with JWT authentication
- **AI Integration** - AI-powered candidate screening and feedback generation
- **shadcn/ui** - High-quality UI components

## 🏗️ Architecture

### Custom Backend Integration
This application uses a **custom backend API** (not Supabase). See [BACKEND_API_SPEC.md](./BACKEND_API_SPEC.md) for complete API documentation.

```
Frontend (Next.js + React)
    ↓
Redux Store (jobsSlice, candidatesSlice, resultsSlice)
    ↓
Custom Backend API (localhost:5000/api)
    ↓
Database + AI Service
```

### State Management (Redux Toolkit)
```
src/store/
├── index.ts              # Store configuration
├── jobsSlice.ts          # Jobs state
├── candidatesSlice.ts    # Candidates state
└── resultsSlice.ts       # Screening results state
```

See [REDUX_IMPLEMENTATION.md](./REDUX_IMPLEMENTATION.md) for detailed documentation.

### Project Structure
```
HireWise_Core/
├── app/                 # Next.js App Router pages
│   ├── layout.tsx       # Root layout with providers
│   ├── page.tsx         # Landing page
│   ├── auth/            # Recruiter authentication
│   ├── dashboard/       # Recruiter dashboard
│   ├── jobs/new/        # Create job
│   ├── candidates/      # Candidates management
│   ├── results/         # AI screening results
│   └── candidate/       # Candidate portal
│       ├── page.tsx     # Candidate landing
│       ├── auth/        # Candidate auth
│       ├── jobs/        # Job board
│       ├── applications/# My applications
│       ├── feedback/    # AI feedback
│       └── profile/     # Profile settings
├── src/
│   ├── components/      # Reusable UI components
│   ├── contexts/        # React contexts (Auth)
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions
│   ├── store/           # Redux store and slices
│   └── views/           # Page view components
│       └── candidates/  # Candidate portal views
├── next.config.mjs      # Next.js configuration
└── package.json         # Dependencies
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Custom backend API running (see [BACKEND_API_SPEC.md](./BACKEND_API_SPEC.md))

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd HireWise_Core
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

4. Start your backend API
```bash
# In your backend directory
npm start
```

5. Run the development server
```bash
npm run dev
```

Or use the quick start script:
```bash
run-nextjs.bat
```

6. Open your browser
- **Recruiter Portal:** http://localhost:3000
- **Candidate Portal:** http://localhost:3000/candidate

7. Build for production
```bash
npm run build
npm start
```

## 📚 Documentation

### Getting Started
- **[START_HERE.md](./START_HERE.md)** - Quick start guide
- **[COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md)** - Comprehensive setup instructions

### Architecture & Implementation
- **[OPTION_A_COMPLETE.md](./OPTION_A_COMPLETE.md)** - ✅ Migration to custom backend complete
- **[MIGRATION_TO_CUSTOM_BACKEND.md](./MIGRATION_TO_CUSTOM_BACKEND.md)** - Migration details
- **[BACKEND_API_SPEC.md](./BACKEND_API_SPEC.md)** - Complete API specification
- **[REDUX_IMPLEMENTATION.md](./REDUX_IMPLEMENTATION.md)** - Redux state management details
- **[REDUX_QUICK_REFERENCE.md](./REDUX_QUICK_REFERENCE.md)** - Redux quick reference

### Legacy Documentation
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Implementation overview
- **[BUILD_SUCCESS_SUMMARY.md](./BUILD_SUCCESS_SUMMARY.md)** - Build notes

## 🎭 Two Portals

### Recruiter Portal (`/`)
- Sign up / Sign in at `/auth`
- Dashboard at `/dashboard`
- Create jobs at `/jobs/new`
- Manage candidates at `/candidates`
- View AI screening results at `/results`

### Candidate Portal (`/candidate`)
- Landing page at `/candidate`
- Sign up / Sign in at `/candidate/auth`
- Browse jobs at `/candidate/jobs`
- Apply to jobs
- Track applications at `/candidate/applications`
- View AI feedback at `/candidate/feedback`
- Manage profile at `/candidate/profile`

## 📋 Requirements Checklist

### Frontend Requirements (100% Complete)

✅ **1. Recruiter Dashboard**
- View all jobs created
- Select and manage jobs
- View applicants and AI results
- Statistics and activity feed

✅ **2. Job Creation & Editing UI**
- Multi-step form with validation
- Job title, requirements, skills, experience level
- Cultural DNA profile definition
- Custom scoring weights (skills, experience, culture)

✅ **3. Applicant Ingestion**
- **Structured Profiles**: Manual form input
- **External Applicants**: CSV file upload
- Clean display of uploaded data

✅ **4. Trigger AI Screening**
- "Screen with AI" button
- Loading state with spinner
- Comprehensive error handling

✅ **5. Shortlist Visualization**
- Ranked candidates (Top 10-20)
- Score rings (0-100)
- Clean card layout with breakdown bars
- Skill tags and gap previews

✅ **6. AI Explanation Display**
- Strengths list
- Gaps/risks identification
- Culture fit assessment
- Interview question suggestions
- Detailed candidate dialog

✅ **7. Candidate Portal**
- Job browsing and search
- Application submission
- Application tracking
- AI feedback viewing
- Profile management

✅ **8. UX for Complex Workflow**
- Smooth navigation flow
- Job selector persistence
- Clear user guidance
- No confusion points

✅ **9. API Integration**
- Custom backend API integration
- JWT authentication
- Proper data fetching and rendering
- Error handling

✅ **10. State Management - Redux Toolkit**
- Jobs state management
- Candidates state management
- Results state management
- Loading/error states
- Typed hooks (useAppDispatch, useAppSelector)

✅ **11. Responsive & Clean UI**
- Tailwind CSS throughout
- Professional design
- Mobile-responsive
- shadcn/ui components

## 🛠️ Tech Stack (Umurava Hackathon Compliant)

| Category | Technology | Status |
|----------|-----------|--------|
| **Frontend Framework** | Next.js 16 (App Router) | ✅ Required |
| **Language** | TypeScript | ✅ Required |
| **State Management** | Redux Toolkit | ✅ Required |
| **Styling** | Tailwind CSS | ✅ Required |
| **UI Components** | shadcn/ui (Radix UI) | ✅ |
| **Backend** | Custom REST API | ✅ |
| **Authentication** | JWT | ✅ |
| **AI/LLM** | AI Service Integration | ✅ Required |
| **Database** | MongoDB/PostgreSQL | ✅ |
| **Data Fetching** | Redux Thunks | ✅ |
| **Forms** | React Hook Form + Zod | ✅ |
| **Icons** | Lucide React | ✅ |

## 📦 Key Dependencies

```json
{
  "next": "^16.2.4",
  "@reduxjs/toolkit": "^2.11.2",
  "react-redux": "^9.2.0",
  "react": "^19.2.5",
  "react-dom": "^19.2.5",
  "typescript": "^5.8.3",
  "tailwindcss": "^3.4.17",
  "@tanstack/react-query": "^5.83.0"
}
```

## 🚢 Deployment

### Vercel (Recommended)
```bash
npm i -g vercel
vercel
```

Set environment variable:
```
NEXT_PUBLIC_API_URL=https://your-backend-api.com/api
```

### Railway
1. Connect GitHub repository
2. Railway auto-detects Next.js
3. Add environment variables
4. Deploys automatically

### Render
- **Build Command:** `npm run build`
- **Start Command:** `npm start`
- **Environment Variables:** `NEXT_PUBLIC_API_URL`

## 🎯 Usage

### Recruiter Flow

#### Creating a Job
1. Navigate to Dashboard
2. Click "Create Job"
3. Fill in job details (3-step form)
4. Define cultural DNA profile
5. Set scoring weights
6. Submit

#### Adding Candidates
1. Select a job
2. Add candidates manually or upload CSV
3. CSV format: `name,email,skills,resume_text`

#### Running AI Screening
1. Navigate to Results page
2. Select job with candidates
3. Adjust scoring weights if needed
4. Click "Screen with AI"
5. View ranked results

#### Reviewing Results
- View ranked candidates with scores
- Toggle bias reduction mode
- Sort by score or culture fit
- Click "Details" for full candidate analysis
- Review AI-generated interview questions

### Candidate Flow

#### Browsing Jobs
1. Visit `/candidate`
2. Sign up or sign in
3. Browse available jobs
4. Search by title, department, or skills

#### Applying to Jobs
1. Click "Apply Now" on a job
2. Paste resume or experience summary
3. Add your skills
4. Submit application

#### Tracking Applications
1. Go to "My Applications"
2. View application status
3. Click "View Feedback" when available

#### Viewing AI Feedback
1. Go to "AI Feedback"
2. See your scores and rankings
3. Review strengths and gaps
4. Read improvement tips
5. Understand why you were/weren't selected

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch
```

## 🏆 Hackathon Submission

### Team Composition
- Front-End Engineer: Next.js + React + TypeScript
- Back-End Engineer: Node.js + Custom API
- AI Software Engineer: AI Integration + Prompt Engineering

### Key Features for Judges
1. **Next.js 16 App Router** - Modern, production-ready architecture
2. **Redux Toolkit** - Predictable state management
3. **Dual Portal System** - Separate experiences for recruiters and candidates
4. **AI-Powered Screening** - AI integration with explainable results
5. **Candidate Feedback** - Transparent AI feedback for job seekers
6. **Bias Reduction Mode** - Hide identifying information during review
7. **Comprehensive UI** - Clean, responsive, professional interface

### Live Demo
- **Recruiter Portal:** [To be deployed]
- **Candidate Portal:** [To be deployed]/candidate
- **Test Accounts:** [Provided at submission]

## 📝 License

This project is part of the Umurava AI Hackathon submission.

## 🤝 Contact

For questions about this submission, please contact the team via the hackathon platform.

---

**Built for Umurava AI Hackathon with ❤️**  
**Tech Stack:** Next.js 16 + TypeScript + Redux Toolkit + Tailwind CSS + Custom Backend API
