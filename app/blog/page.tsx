import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Blog — Seung-won Park' }

export default function BlogIndex() {
  const posts = getAllPosts()
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-semibold mb-10">Blog</h1>
      {posts.length === 0 ? (
        <p className="text-gray-400">No posts yet.</p>
      ) : (
        <ul className="space-y-8">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link href={`/blog/${post.slug}/`} className="group">
                <time className="text-sm text-gray-400 tabular-nums">{post.date}</time>
                <h2 className="text-lg font-medium text-gray-900 group-hover:underline mt-1">
                  {post.title}
                </h2>
                {post.description && (
                  <p className="text-gray-500 text-sm mt-1">{post.description}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
