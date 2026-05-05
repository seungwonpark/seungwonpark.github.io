import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDir = path.join(process.cwd(), 'content/blog')

export interface PostMeta {
  slug: string
  title: string
  date: string
  description?: string
}

export interface Post extends PostMeta {
  contentHtml: string
}

export function getAllPosts(): PostMeta[] {
  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith('.md'))
  return files
    .map((f) => {
      const slug = f.replace(/\.md$/, '')
      const { data } = matter(fs.readFileSync(path.join(postsDir, f), 'utf8'))
      return {
        slug,
        title: data.title as string,
        date: data.date as string,
        description: data.description as string | undefined,
      }
    })
    .sort((a, b) => (a.date > b.date ? -1 : 1))
}

export async function getPost(slug: string): Promise<Post> {
  const src = fs.readFileSync(path.join(postsDir, `${slug}.md`), 'utf8')
  const { data, content } = matter(src)
  const { remark } = await import('remark')
  const remarkHtml = (await import('remark-html')).default
  const processed = await remark().use(remarkHtml).process(content)
  return {
    slug,
    title: data.title as string,
    date: data.date as string,
    description: data.description as string | undefined,
    contentHtml: processed.toString(),
  }
}
