

 🚀 Smart Bookmark App

A full-stack bookmark management web app built with Next.js and Supabase.

 🌍 Live Demo

👉 https://your-vercel-url.vercel.app

---

 ✨ Features

- 🔐 Authentication (Supabase Auth)
- 🛡 Row Level Security (RLS)
- ⚡ Realtime updates
- ⭐ Favorites
- 🏷 Tagging system
- 📝 Notes for bookmarks
- 🔎 Smart search (title, URL, tags, notes)
- 🎨 Modern responsive UI
- 🚀 Deployed on Vercel

---

 🛠 Tech Stack

- Next.js 14+
- TypeScript
- Supabase
- PostgreSQL
- Tailwind CSS
- Vercel

---


---

## 🧠 Challenges & Solutions

### 1️⃣ Implementing Row Level Security (RLS)

**Problem:**  
Ensuring users could only access their own bookmarks.

**Solution:**  
Configured Supabase Row Level Security policies using `auth.uid()` to restrict access at the database level.  
This guarantees data isolation even if frontend logic fails.

---

### 2️⃣ Search Across Multiple Fields (Title, URL, Tags, Notes)

**Problem:**  
Creating a flexible search that works across different columns including array-based tags.

**Solution:**  
Used Supabase `or()` filtering to search across multiple fields and optimized tag storage structure for efficient querying.

---

### 3️⃣ Deployment Environment Variables

**Problem:**  
The app worked locally but failed after deployment.

**Solution:**  
Configured environment variables in Vercel and ensured `.env.local` was not committed to GitHub.

---

### 4️⃣ Git Line Ending Warnings (CRLF vs LF)

**Problem:**  
Git showed warnings when pushing from Windows.

**Solution:**  
Understood it was related to line endings and confirmed it doesn’t affect production deployment.




 📦 Installation (Local Setup)

1. Clone the repo:

git clone https://github.com/Balaji-888/Smart-Bookmark-App.git

2. Install dependencies:
npm install

3. Create .env.local:

NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

4.Run

npm run dev


---

 👨‍💻 Author

**Balaji M**  
Full-Stack Developer | Building Modern Web Applications  

🔗 GitHub: https://github.com/Balaji-888  
💼 LinkedIn: https://www.linkedin.com/in/balaji-m-b828a425a/
📧 Email: balajim26114@gmail.com

---

 🚀 About Me

I’m a passionate developer focused on building scalable, secure, and modern web applications using technologies like Next.js, Supabase, and TypeScript.  
Currently building projects to strengthen my full-stack development skills and prepare for real-world production environments.







