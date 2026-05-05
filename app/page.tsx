import Image from 'next/image'
import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'

const socialLinks = [
  { label: 'GitHub', href: 'https://github.com/seungwonpark' },
  { label: 'Scholar', href: 'https://scholar.google.com/citations?user=jVZCUkMAAAAJ' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/veydpz' },
  { label: 'Email', href: 'mailto:sw.park.ai@gmail.com' },
]

export default function Home() {
  const recentPosts = getAllPosts().slice(0, 3)

  return (
    <div className="max-w-3xl mx-auto px-6">
      {/* Hero */}
      <section className="py-16 flex flex-col sm:flex-row items-start sm:items-center gap-10">
        <div className="flex-1">
          <h1 className="text-3xl font-semibold tracking-tight mb-1">
            Seung-won Park <span className="text-gray-400 font-normal text-2xl">(박승원)</span>
          </h1>
          <p className="text-gray-500 text-lg mb-6">
            Machine Learning Engineer at{' '}
            <a href="https://moloco.com" className="text-gray-700 hover:underline">
              Moloco
            </a>
          </p>
          <div className="flex flex-wrap gap-4">
            {socialLinks.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                target={href.startsWith('mailto') ? undefined : '_blank'}
                rel="noopener noreferrer"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
        <div className="shrink-0">
          <Image
            src="/img/profile.jpg"
            alt="Seung-won Park"
            width={120}
            height={120}
            className="rounded-full object-cover"
            priority
          />
        </div>
      </section>

      {/* About */}
      <section className="border-t border-gray-100 py-12">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
          About
        </h2>
        <p className="text-gray-700 leading-relaxed">
          I&apos;m a Machine Learning Engineer at{' '}
          <a href="https://moloco.com" className="underline hover:text-gray-900">
            Moloco, Inc.
          </a>{' '}
          Previously, I worked on speech synthesis at{' '}
          <a href="https://supertone.ai" className="underline hover:text-gray-900">
            Supertone
          </a>{' '}
          and{' '}
          <a href="https://mindslab.ai" className="underline hover:text-gray-900">
            MINDsLab
          </a>{' '}
          for about three years. I majored in Physics &amp; CS at{' '}
          <a href="https://en.snu.ac.kr" className="underline hover:text-gray-900">
            Seoul National University
          </a>
          .
        </p>
      </section>

      {/* Recent Posts */}
      <section className="border-t border-gray-100 py-12">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-6">
          Recent Posts
        </h2>
        {recentPosts.length === 0 ? (
          <p className="text-gray-400 text-sm">No posts yet.</p>
        ) : (
          <ul className="space-y-5">
            {recentPosts.map((post) => (
              <li key={post.slug} className="flex items-baseline gap-4">
                <time className="text-sm text-gray-400 shrink-0 tabular-nums">{post.date}</time>
                <Link
                  href={`/blog/${post.slug}/`}
                  className="text-gray-800 hover:text-gray-900 hover:underline"
                >
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-6">
          <Link href="/blog/" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">
            All posts →
          </Link>
        </div>
      </section>
    </div>
  )
}
