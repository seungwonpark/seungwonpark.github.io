import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Notes & Talks — Seung-won Park' }

const talks: { year: number; items: { title: string; href: string; note?: string }[] }[] = [
  {
    year: 2023,
    items: [
      { title: 'ML Calibration', href: '/notes/230422_ML_Calibration.pdf', note: 'Deepest Hosting' },
    ],
  },
  {
    year: 2022,
    items: [
      {
        title: 'BERT: Self-supervised learning meets Transformer',
        href: '/notes/220111_BERT_Self-supervised_learning_meets_Transformer.pdf',
        note: 'MARG Self-supervised learning study group',
      },
    ],
  },
  {
    year: 2020,
    items: [
      {
        title: 'Generating Novel Glyph without Human Data by Learning to Communicate',
        href: 'https://slideslive.com/38941000',
        note: 'NeurIPS 2020 Workshop on ML for Creativity and Design — Slides & Video',
      },
      {
        title: 'Cotatron: Transcription-Guided Speech Encoder for Any-to-Many Voice Conversion',
        href: '/notes/swpark-Cotatron-interspeech2020.pdf',
        note: 'Interspeech 2020',
      },
    ],
  },
  {
    year: 2019,
    items: [
      {
        title: 'History of Neural Vocoders for TTS (as of 2019.10)',
        href: '/notes/swpark-DeepestS6-hosting.pdf',
        note: 'Deepest Hosting',
      },
      {
        title: 'Speaker Embedding Network & Applications',
        href: '/notes/swpark-DeepCon2.pdf',
        note: '2nd Deep Con',
      },
    ],
  },
  {
    year: 2018,
    items: [
      {
        title: '원근감을 살린 TeX Graphics',
        href: '/notes/2018KTUGconf-perspectiveTikZ.pdf',
        note: '2018 KTS conf. (Korean)',
      },
    ],
  },
  {
    year: 2017,
    items: [
      {
        title: 'TikZ 기초',
        href: '/notes/2017KNUworkshop-tikz-intro.pdf',
        note: '2017 KTUG workshop (Korean)',
      },
      {
        title: 'Graphing/Drawing Tools for Physics Research',
        href: '/notes/2017SKPjoint-SNU-Graphing%2CDrawing%20Tools%20for%20Physics%20Research.pdf',
        note: '2017 SNU+KAIST+POSTECH joint undergrad physics seminar',
      },
    ],
  },
]

const notes: { year: number; items: { title: string; href: string; note?: string }[] }[] = [
  {
    year: 2021,
    items: [
      {
        title: 'Position Encoding의 종류와 분석',
        href: 'https://blog-deepest.medium.com/position-encoding%EC%9D%98-%EC%A2%85%EB%A5%98%EC%99%80-%EB%B6%84%EC%84%9D-ab1816b0f62a',
        note: 'Korean',
      },
    ],
  },
  {
    year: 2017,
    items: [
      { title: 'Physics Writing Guide for Olympiad', href: '/notes/For-KPhO-Newbies-compressed.pdf', note: 'Korean' },
    ],
  },
  {
    year: 2016,
    items: [
      { title: '상대성 이론 (고급물리학 2 발표자료)', href: '/notes/2016AdvPhys2_Relativity.pdf', note: 'Korean' },
    ],
  },
]

function Section({
  title,
  groups,
}: {
  title: string
  groups: { year: number; items: { title: string; href: string; note?: string }[] }[]
}) {
  return (
    <section className="mb-12">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-6">{title}</h2>
      <ul className="space-y-5">
        {groups.map(({ year, items }) =>
          items.map(({ title, href, note }) => (
            <li key={title} className="flex items-baseline gap-4">
              <span className="text-sm text-gray-400 tabular-nums shrink-0 w-10">{year}</span>
              <div>
                <a
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="text-gray-800 hover:underline"
                >
                  {title}
                </a>
                {note && <span className="text-gray-400 text-sm ml-2">— {note}</span>}
              </div>
            </li>
          ))
        )}
      </ul>
    </section>
  )
}

export default function NotesPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-semibold mb-10">Notes & Talks</h1>
      <Section title="Talks" groups={talks} />
      <Section title="Notes" groups={notes} />
    </div>
  )
}
