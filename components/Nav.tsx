import Link from 'next/link'

const links = [
  { href: '/cv/', label: 'CV' },
  { href: '/blog/', label: 'Blog' },
  { href: '/notes/', label: 'Notes' },
]

export default function Nav() {
  return (
    <header className="border-b border-gray-100">
      <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-semibold text-gray-900 hover:text-gray-600 transition-colors">
          swpark.me
        </Link>
        <nav className="flex gap-6">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
