import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'CV — Seung-won Park' }

async function getCvHtml() {
  const src = fs.readFileSync(path.join(process.cwd(), 'content/cv.md'), 'utf8')
  const { content } = matter(src)
  const { remark } = await import('remark')
  const remarkHtml = (await import('remark-html')).default
  const processed = await remark().use(remarkHtml).process(content)
  return processed.toString()
}

export default async function CvPage() {
  const html = await getCvHtml()
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-2xl font-semibold">CV</h1>
        <a
          href="/cv.pdf"
          download
          className="text-sm text-gray-500 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded hover:border-gray-400 transition-colors"
        >
          Download PDF
        </a>
      </div>
      <article
        className="prose prose-gray max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
