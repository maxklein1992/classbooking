import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BLOG_POSTS } from '../blog/posts'
import { formatDate } from '../lib/dates'
import { useSeo } from '../lib/seo'

export default function BlogPage() {
  const { t } = useTranslation()

  useSeo({
    title: t('blog.title'),
    description: t('blog.metaDescription'),
  })

  return (
    <div className="page blog-page">
      <div className="page-header">
        <div>
          <h1>{t('blog.title')}</h1>
          <p className="muted">{t('blog.subtitle')}</p>
        </div>
      </div>

      <div className="card-grid">
        {BLOG_POSTS.map((post) => (
          <article key={post.slug} className="card blog-card">
            <Link to={`/blog/${post.slug}`} className="blog-card-media">
              <img src={post.image.src} alt={post.image.alt} loading="lazy" />
            </Link>
            <div className="blog-card-body">
              <p className="blog-meta muted">
                <time dateTime={post.publishedAt}>
                  {formatDate(post.publishedAt)}
                </time>
                {' · '}
                {t('blog.readingTime', { minutes: post.readingMinutes })}
              </p>
              <h2 className="blog-card-title">
                <Link to={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              <p className="muted">{post.excerpt}</p>
              <Link to={`/blog/${post.slug}`} className="blog-readmore">
                {t('blog.readMore')} →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
