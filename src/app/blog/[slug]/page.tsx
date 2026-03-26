import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllPostSlugs, getPostBySlug } from '@/lib/blog';

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPost({ params }: Props) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  return (
    <main className="min-h-screen py-16 px-4">
      <article className="max-w-[680px] mx-auto">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-[rgba(255,215,0,0.7)] hover:text-neon transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          All Posts
        </Link>

        {/* Header */}
        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-3 text-xs text-[rgba(255,255,255,0.4)]">
            <time dateTime={post.date}>
              {new Date(post.date + 'T00:00:00').toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
            <span>·</span>
            <span>{post.readTime} min read</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[rgba(255,255,255,0.95)] leading-tight mb-3">
            {post.title}
          </h1>
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 rounded-full text-xs bg-[rgba(255,215,0,0.08)] text-[rgba(255,215,0,0.6)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Body */}
        <div
          className="blog-prose"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* CTA footer */}
        <div className="mt-16 pt-8 border-t border-[rgba(255,255,255,0.06)]">
          <h3 className="text-lg font-bold text-[rgba(255,255,255,0.9)] mb-4">
            Put the math to work
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href="/games"
              className="glass-card text-center text-sm font-semibold text-[rgba(255,255,255,0.75)] hover:text-neon transition-colors !py-4"
            >
              📊 EV Rankings
            </Link>
            <Link
              href="/generator"
              className="glass-card text-center text-sm font-semibold text-[rgba(255,255,255,0.75)] hover:text-neon transition-colors !py-4"
            >
              🎲 Number Generator
            </Link>
            <Link
              href="/calculator"
              className="glass-card text-center text-sm font-semibold text-[rgba(255,255,255,0.75)] hover:text-neon transition-colors !py-4"
            >
              💰 What-If Calculator
            </Link>
          </div>
        </div>

        {/* Back to blog */}
        <div className="mt-10 text-center">
          <Link
            href="/blog"
            className="text-sm text-[rgba(255,215,0,0.6)] hover:text-neon transition-colors"
          >
            ← Back to all posts
          </Link>
        </div>
      </article>
    </main>
  );
}
