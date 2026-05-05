# swpark.me

Personal homepage of [Seung-won Park](https://swpark.me), built with [Next.js 15](https://nextjs.org/) and [Tailwind CSS](https://tailwindcss.com/). Deployed to GitHub Pages via GitHub Actions.

## Structure

```
app/          # Next.js App Router pages
components/   # Nav, Footer
lib/          # Markdown post reader
content/
  cv.md       # CV source — edit here
  blog/       # Blog posts (one .md file per post)
public/       # Static assets (images, PDFs, favicons)
```

## Local development

```bash
npm install
npm run dev   # http://localhost:3000
```

## Writing a blog post

Create a new file under `content/blog/`:

```markdown
---
title: Post title
date: "2026-01-01"
description: Optional one-line summary.
---

Post body in Markdown.
```

Push to `master` — GitHub Actions builds and deploys automatically.

## License

MIT
