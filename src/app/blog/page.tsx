import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Blog — Lottery Math, Strategy & Insights',
  description:
    'Deep dives into lottery expected value, odds comparison, wheeling systems, and smart strategies. No hype — just math.',
  openGraph: {
    title: 'Blog — Luck Maker 3000',
    description:
      'Deep dives into lottery expected value, odds comparison, wheeling systems, and smart strategies.',
  },
};

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <main className="min-h-screen py-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-black text-[rgba(255,255,255,0.95)] mb-3">
            The <span className="text-neon">Smart</span> Lottery Blog
          </h1>
          <p className="text-[rgba(255,255,255,0.55)] text-lg leading-relaxed max-w-xl">
            No hype, no miracle systems. Just honest math, probability, and
            insights for anyone who plays the lottery.
          </p>
        </div>

        {/* Post list */}
        {posts.length === 0 ? (
          <p className="text-[rgba(255,255,255,0.4)]">No posts yet. Check back soon.</p>
        ) : (
          <div className="flex flex-col gap-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="glass-card group block hover:bg-[rgba(255,255,255,0.04)] transition-colors"
              >
                <div className="flex flex-wrap items-center gap-3 mb-2 text-xs text-[rgba(255,255,255,0.4)]">
                  <time dateTime={post.date}>
                    {new Date(post.date + 'T00:00:00').toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                  <span>·</span>
                  <span>{post.readTime} min read</span>
                  {post.tags.length > 0 && (
                    <>
                      <span>·</span>
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full bg-[rgba(255,215,0,0.08)] text-[rgba(255,215,0,0.6)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </>
                  )}
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-[rgba(255,255,255,0.9)] group-hover:text-neon transition-colors mb-1">
                  {post.title}
                </h2>
                <p className="text-sm text-[rgba(255,255,255,0.5)] leading-relaxed">
                  {post.description}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
