# 🤝 Contributing to UBIT GPA Calculator & Results Hub

Thank you for your interest in improving the UBIT GPA Calculator & Results Hub!

---

## 🛠️ Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Asad101001/ubit-gpa-calculator.git
   cd ubit-gpa-calculator
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Start the local Vite dev server**:
   ```bash
   npm run dev
   ```

5. **Build and Test**:
   ```bash
   npm run build
   ```

---

## 📐 Code Guidelines

- **TypeScript**: Ensure all types and interfaces are strictly typed. Avoid using untyped `any` where possible.
- **Neo-Brutalist Styling**: Follow the established theme tokens:
  - Strong borders: `border-2 border-black`
  - High-contrast shadows: `shadow-[4px_4px_0px_0px_#000]`
  - Brand accents: Yellow `#FFD700` (`bg-brand-500` or `bg-yellow-400`)
- **Privacy Enforcement**: Never commit code that bypasses the privacy masking rules detailed in `docs/PRIVACY.md`.

---

## 🚀 Pull Request Process

1. Fork the repo and create your feature branch: `git checkout -b feature/your-feature-name`.
2. Commit your changes with conventional commit messages: `git commit -m "feat: description"`.
3. Push to your branch and submit a Pull Request to `main`.
