# HireWise - AI-Powered Recruitment Platform

> **Umurava AI Hackathon Submission** - An innovation challenge to build AI Products for Human Resources Industry

A modern, full-stack recruitment platform with AI-powered candidate screening built with **Next.js 16**, **TypeScript**, **Redux Toolkit**, and **Tailwind CSS**.

## ✨ Features

### Core Functionality
- **Recruiter Dashboard** - Comprehensive overview of jobs, candidates, and screening results
- **Job Management** - Create, edit, and manage job postings with custom scoring weights
- **Candidate Ingestion** - Support for manual entry and CSV bulk upload
- **AI Screening** - Intelligent candidate analysis powered by AI
- **Shortlist Visualization** - Ranked candidates with detailed scoring breakdowns
- **Bias Reduction Mode** - Hide identifying information to reduce unconscious bias
- **Interview Questions** - AI-generated interview questions for each candidate

### Technical Highlights
- **Next.js 16** - App Router with server-side rendering capabilities
- **Redux Toolkit** - Centralized state management for jobs, candidates, and results
- **TypeScript** - Full type safety throughout the application
- **Tailwind CSS** - Modern, responsive UI design
- **Supabase** - Backend database and authentication
- **Gemini API** - AI-powered candidate screening and ranking
- **shadcn/ui** - High-quality UI components

## 🏗️ Architecture

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
Hirewise2/
├── app/                 # Next.js App Router pages
│   ├── layout.tsx       # Root layout with providers
│   ├── page.tsx         # Landing page
│   ├── auth/            # Authentication
│   ├── dashboard/       # Dashboard
│   ├── jobs/new/        # Create job
│   ├── candidates/      # Candidates management
│   └── results/         # AI screening results
├── src/
│   ├── components/      # Reusable UI components
│   ├── contexts/        # React contexts (Auth)
│   ├── hooks/           # Custom React hooks
│   ├── integrations/    # API integrations
│   ├── lib/             # Utility functions
│   ├── store/           # Redux store and slices
│   └── views/           # Page view components
├── supabase/            # Supabase functions & migrations
├── next.config.mjs      # Next.js configuration
└── package.json         # Dependencies
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd Hirewise2
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env.local` file with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server
```bash
npm run dev
```

Or use the quick start script:
```bash
run-nextjs.bat
```

5. Open your browser
Visit **http://localhost:3000**

6. Build for production
```bash
npm run build
npm start
```

## 📚 Documentation

- **[START_HERE.md](./START_HERE.md)** - Quick start guide
- **[COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md)** - Comprehensive setup instructions
- **[REDUX_IMPLEMENTATION.md](./REDUX_IMPLEMENTATION.md)** - Redux state management details
- **[REDUX_QUICK_REFERENCE.md](./REDUX_QUICK_REFERENCE.md)** - Redux quick reference
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Implementation overview

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

✅ **7. UX for Complex Workflow**
- Smooth navigation flow
- Job selector persistence
- Clear user guidance
- No confusion points

✅ **8. API Integration**
- Supabase client configured
- Backend edge functions integration
- Proper data fetching and rendering

✅ **9. State Management - Redux Toolkit**
- Jobs state management
- Candidates state management
- Results state management
- Loading/error states
- Typed hooks (useAppDispatch, useAppSelector)

✅ **10. Responsive & Clean UI**
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
| **Backend** | Supabase | ✅ |
| **AI/LLM** | Gemini API | ✅ Required |
| **Database** | MongoDB/Supabase | ✅ |
| **Data Fetching** | React Query + Redux Thunks | ✅ |
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
  "@tailwindcss/postcss": "^4.2.4",
  "@supabase/supabase-js": "^2.101.1",
  "@tanstack/react-query": "^5.83.0"
}
```

## 🚢 Deployment

### Vercel (Recommended)
```bash
npm i -g vercel
vercel
```

### Railway
1. Connect GitHub repository
2. Railway auto-detects Next.js
3. Deploys automatically

### Render
- **Build Command:** `npm run build`
- **Start Command:** `npm start`

## 🎯 Umurava AI Hackathon Requirements

### ✅ All Requirements Met

**Functional Requirements:**
- ✅ Recruiter-facing interface
- ✅ Job creation and editing
- ✅ Applicant ingestion (profiles + uploads)
- ✅ AI-based screening trigger
- ✅ Ranked shortlists (Top 10-20)
- ✅ AI-generated reasoning per candidate

**Technical Requirements:**
- ✅ Next.js (App Router)
- ✅ TypeScript throughout
- ✅ Redux Toolkit for state management
- ✅ Tailwind CSS for styling
- ✅ Gemini API integration (ready)
- ✅ MongoDB/Supabase database
- ✅ Deployed online (ready)

**AI Capabilities:**
- ✅ Multi-candidate evaluation
- ✅ Weighted scoring (skills, experience, culture)
- ✅ Natural-language explanations
- ✅ Strengths and gaps analysis
- ✅ Interview question generation

## 🎯 Usage

### Creating a Job
1. Navigate to Dashboard
2. Click "Create Job"
3. Fill in job details (3-step form)
4. Define cultural DNA profile
5. Set scoring weights
6. Submit

### Adding Candidates
1. Select a job
2. Add candidates manually or upload CSV
3. CSV format: `name,email,skills,resume_text`

### Running AI Screening
1. Navigate to Results page
2. Select job with candidates
3. Adjust scoring weights if needed
4. Click "Screen with AI"
5. View ranked results

### Reviewing Results
- View ranked candidates with scores
- Toggle bias reduction mode
- Sort by score or culture fit
- Click "Details" for full candidate analysis
- Review AI-generated interview questions

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
- Back-End Engineer: Node.js + Supabase
- AI Software Engineer: Gemini API + Prompt Engineering

### Key Features for Judges
1. **Next.js 16 App Router** - Modern, production-ready architecture
2. **Redux Toolkit** - Predictable state management
3. **AI-Powered Screening** - Gemini API integration with explainable results
4. **Bias Reduction Mode** - Hide identifying information during review
5. **Comprehensive UI** - Clean, responsive, professional interface

### Live Demo
- **URL:** [To be deployed]
- **Test Account:** [Provided at submission]

## 📝 License

This project is part of the Umurava AI Hackathon submission.

## 🤝 Contact

For questions about this submission, please contact the team via the hackathon platform.

---

**Built for Umurava AI Hackathon with ❤️**  
**Tech Stack:** Next.js 16 + TypeScript + Redux Toolkit + Tailwind CSS + Gemini API
#   u m u r a v a - f r o n t e n d  
 