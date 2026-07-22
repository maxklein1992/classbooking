import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getPostBySlug } from '../blog/posts'
import type { BlogBlock } from '../blog/posts'
import { formatDate } from '../lib/dates'
import { useSeo } from '../lib/seo'

function renderBlock(block: BlogBlock, index: number) {
  switch (block.type) {
    case 'h2':
      return <h2 key={index}>{block.text}</h2>
    case 'h3':
      return <h3 key={index}>{block.text}</h3>
    case 'ul':
      return (
        <ul key={index}>
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )
    case 'p':
    default:
      return <p key={index}>{block.text}</p>
  }
}

export default function BlogPostPage() {
  const { t } = useTranslation()
  const { slug } = useParams<{ slug: string }>()
  const post = slug ? getPostBySlug(slug) : undefined

  // Titel/description hangen af van of de blog bestaat; hook wordt altijd
  // aangeroepen (geen conditionele hook) om de React-regels te respecteren.
  useSeo({
    title: post ? post.title : t('blog.notFoundTitle'),
    description: post?.metaDescription,
  })

  if (!post) {
    return (
      <div className="page">
        <p className="text-danger">{t('blog.notFound')}</p>
        <Link to="/blog" className="btn btn-ghost">
          {t('blog.backToOverview')}
        </Link>
      </div>
    )
  }

  return (
    <div className="page blog-post">
      <Link to="/blog" className="blog-back">
        {t('blog.backToOverview')}
      </Link>

      <article className="blog-article">
        <header className="blog-article-header">
          {/* Eén h1 per pagina: de blogtitel. */}
          <h1>{post.title}</h1>
          <p className="blog-meta muted">
            {t('blog.byAuthor', { author: post.author })}
            {' · '}
            <time dateTime={post.publishedAt}>
              {formatDate(post.publishedAt)}
            </time>
            {' · '}
            {t('blog.readingTime', { minutes: post.readingMinutes })}
          </p>
        </header>

        <img
          className="blog-article-image"
          src={post.image.src}
          alt={post.image.alt}
        />

        <div className="blog-content">
          {post.body.map((block, i) => renderBlock(block, i))}
        </div>

        {post.internalLink && (
          <div className="blog-cta">
            <Link to={post.internalLink.to} className="btn btn-primary">
              {post.internalLink.label}
            </Link>
          </div>
        )}
      </article>
    </div>
  )
}
