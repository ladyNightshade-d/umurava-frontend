# 🚀 START HERE - HireWise Next.js

## Quick Start (3 Steps)

### 1️⃣ Open Terminal in Correct Directory
```bash
cd C:\Users\HP\Documents\projects\Hirewise2
```

**⚠️ IMPORTANT:** Make sure you're in `Hirewise2`, NOT `hirewise-nextjs`!

### 2️⃣ Run the Application

**Option A - Use the batch file (easiest):**
```bash
run-nextjs.bat
```

**Option B - Manual commands:**
```bash
npm run dev
```

### 3️⃣ Open Browser
Visit: **http://localhost:3000**

---

## ✅ What You Have

### Tech Stack (100% Umurava Compliant)
- ✅ **Next.js 16** with App Router
- ✅ **TypeScript** throughout
- ✅ **Redux Toolkit** for state management
- ✅ **Tailwind CSS** for styling
- ✅ **Gemini API** ready for AI screening

### All Features Working
- ✅ Recruiter Dashboard
- ✅ Job Creation & Management
- ✅ Candidate Upload (Manual + CSV)
- ✅ AI Screening with Gemini
- ✅ Results Visualization
- ✅ Bias Reduction Mode
- ✅ Protected Routes & Authentication

---

## 📁 Project Structure

```
Hirewise2/
├── app/                    # Next.js pages (App Router)
│   ├── layout.tsx          # Root layout with Redux
│   ├── page.tsx            # Landing page
│   ├── auth/page.tsx       # Authentication
│   ├── dashboard/page.tsx  # Dashboard
│   ├── jobs/new/page.tsx   # Create job
│   ├── candidates/page.tsx # Candidates
│   └── results/page.tsx    # AI results
├── src/
│   ├── components/         # UI components
│   ├── store/              # Redux slices
│   │   ├── jobsSlice.ts
│   │   ├── candidatesSlice.ts
│   │   └── resultsSlice.ts
│   └── views/              # Page components
├── next.config.mjs         # Next.js config
└── package.json            # Dependencies
```

---

## 🐛 Troubleshooting

### Port 3000 in use?
```bash
npx kill-port 3000
```

### Missing dependencies?
```bash
npm install
```

### Wrong directory?
Check with:
```bash
pwd  # or 'cd' on Windows
```
Should show: `C:\Users\HP\Documents\projects\Hirewise2`

---

## 📚 More Documentation

- **[README.md](./README.md)** - Full project overview
- **[COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md)** - Detailed setup guide
- **[REDUX_IMPLEMENTATION.md](./REDUX_IMPLEMENTATION.md)** - Redux documentation

---

## 🎯 For Hackathon Submission

**All Umurava Requirements Met:** ✅

**Tech Stack:** Next.js 16 + TypeScript + Redux Toolkit + Tailwind CSS

**Ready to Deploy:** ✅

---

**You're ready to go! Just run `npm run dev` and start testing.** 🚀
