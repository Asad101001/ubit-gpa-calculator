# UBIT GPA Calculator (Batch '28)

**Live Demo:** [https://ubit-gpa-calculator-28.vercel.app/](https://ubit-gpa-calculator-28.vercel.app/)

A high-performance, mobile-first web application designed specifically for the students of the Department of Computer Science (UBIT), University of Karachi. Built with a premium "Liquid Neo-Brutalist" aesthetic, this tool calculates semester GPAs and cumulative CGPAs according to the official UOK grading policy.

## Features
- **Accurate Grading Logic**: Fully implements the UOK grading scale (e.g., 50-52 = 1.0, <50 = fail).
- **Mobile-First Design**: Optimized for compact, stutter-free performance on mobile browsers with a polished UI.
- **Persistent Storage**: Automatically saves your inputted grades locally using `localStorage`.
- **Advanced Analytics & Insights**: Visualizes your performance with responsive charts and calculates your dynamic global batch percentile.
- **Global Leaderboard**: Secure, real-time leaderboard powered by Supabase with IP-based rate limiting to prevent spam.
- **Shareable "Wrapped" Snapshot**: Generate beautiful, exportable PNG snapshots of your academic performance to share on social media.
- **JSON Transcript Export**: Download a structured JSON transcript of your grades.

## Tech Stack
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS (customized "Liquid Neo-Brutalist" design)
- **Animations**: Framer Motion
- **Data Visualization**: Recharts
- **Backend & DB**: Supabase (PostgreSQL)

## Deployment Instructions (Vercel)
This project is configured to be deployed easily on Vercel.

1. Connect this repository to your Vercel account.
2. Under "Environment Variables", add the following two keys:
   - `VITE_SUPABASE_URL` = Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = Your Supabase anon key
3. Deploy! (Build Command: `npm run build`, Output Directory: `dist`)

## Local Development
1. Clone the repository.
2. Run `npm install`.
3. Create a `.env` file in the root directory with the Supabase variables (see above).
4. Run `npm run dev` to start the local development server.

## Developer
Developed by AI + Asad (Batch '28)
