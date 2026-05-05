import { getAllPosts, getPost } from '@/lib/posts'
import Link from 'next/link'
import type { Metadata } from 'next'

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  return { title: `${post.title} — Seung-won Park` }
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPost(slug)
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link href="/blog/" className="text-sm text-gray-400 hover:text-gray-700 mb-8 inline-block">
        ← Blog
      </Link>
      <header className="mb-10">
        <time className="text-sm text-gray-400 tabular-nums">{post.date}</time>
        <h1 className="text-2xl font-semibold mt-2">{post.title}</h1>
        {post.description && <p className="text-gray-500 mt-2">{post.description}</p>}
      </header>
      <article
        className="prose prose-gray max-w-none"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />
    </div>
  )
}
