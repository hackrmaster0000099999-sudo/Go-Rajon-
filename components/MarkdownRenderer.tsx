import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="editorial-prose max-w-none text-stone-800 leading-relaxed font-sans">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ ...props }) => (
            <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 mt-8 mb-4 border-b border-stone-100 pb-2" {...props} />
          ),
          h2: ({ ...props }) => (
            <h2 className="font-serif text-2xl font-bold tracking-tight text-stone-900 mt-8 mb-3" {...props} />
          ),
          h3: ({ ...props }) => (
            <h3 className="font-serif text-xl font-semibold tracking-tight text-stone-900 mt-6 mb-2" {...props} />
          ),
          p: ({ ...props }) => (
            <p className="my-4 text-base sm:text-lg leading-relaxed text-stone-700" {...props} />
          ),
          ul: ({ ...props }) => (
            <ul className="my-4 list-disc pl-6 space-y-1.5 text-stone-700 text-base sm:text-lg" {...props} />
          ),
          ol: ({ ...props }) => (
            <ol className="my-4 list-decimal pl-6 space-y-1.5 text-stone-700 text-base sm:text-lg" {...props} />
          ),
          li: ({ ...props }) => (
            <li className="leading-relaxed" {...props} />
          ),
          blockquote: ({ ...props }) => (
            <blockquote
              className="my-6 border-l-4 border-stone-800 pl-4 py-1 font-serif italic text-stone-700 text-lg bg-stone-50/70 rounded-r"
              {...props}
            />
          ),
          code: ({ inline, className, children, ...props }: any) => {
            if (inline) {
              return (
                <code
                  className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-sm text-stone-800"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <div className="my-6 overflow-x-auto rounded-lg bg-stone-900 p-4 text-stone-100 font-mono text-sm leading-relaxed">
                <code className={className} {...props}>
                  {children}
                </code>
              </div>
            );
          },
          a: ({ href, children, ...props }) => (
            <a
              href={href}
              className="font-medium text-stone-900 underline underline-offset-4 decoration-stone-300 hover:decoration-stone-800 transition-colors"
              rel={href?.startsWith('http') ? 'noopener noreferrer nofollow' : undefined}
              target={href?.startsWith('http') ? '_blank' : undefined}
              {...props}
            >
              {children}
            </a>
          ),
          img: ({ src, alt, ...props }) => (
            <figure className="my-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt || 'Article visual content'}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full rounded-lg border border-stone-200 object-cover"
                {...props}
              />
              {alt && (
                <figcaption className="mt-2 text-center text-xs text-stone-500 italic">
                  {alt}
                </figcaption>
              )}
            </figure>
          ),
          hr: () => <hr className="my-8 border-stone-200" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
