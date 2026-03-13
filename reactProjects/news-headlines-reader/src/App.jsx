import { useEffect, useMemo, useState } from 'react'
import {
  CheckCircle2,
  ChevronRight,
  Flame,
  Globe2,
  Moon,
  Newspaper,
  Sun,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

const CATEGORY_OPTIONS = [
  { label: 'General', value: 'general' },
  { label: 'Business', value: 'business' },
  { label: 'Technology', value: 'technology' },
  { label: 'Sports', value: 'sports' },
  { label: 'Health', value: 'health' },
  { label: 'Science', value: 'science' },
  { label: 'Entertainment', value: 'entertainment' },
]

async function fetchNews(selectedCategory) {
  const response = await fetch(`/api/news?category=${selectedCategory}`)

  const rawBody = await response.text()
  let data = {}

  if (rawBody) {
    try {
      data = JSON.parse(rawBody)
    } catch {
      throw new Error('Backend returned an invalid response. Ensure both client and server are running.')
    }
  }

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch headlines.')
  }

  if (!Array.isArray(data.articles)) {
    throw new Error('Unexpected response format from backend API.')
  }

  return data.articles || []
}

function App() {
  const [articles, setArticles] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('general')
  const [readArticleIds, setReadArticleIds] = useState([])
  const [expandedArticleId, setExpandedArticleId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('news-theme')

    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  const readCount = readArticleIds.length
  const selectedCategoryLabel =
    CATEGORY_OPTIONS.find((category) => category.value === selectedCategory)?.label || 'General'

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('news-theme', theme)
  }, [theme])

  useEffect(() => {
    let mounted = true

    async function loadHeadlines() {
      setLoading(true)
      setError('')

      try {
        const nextArticles = await fetchNews(selectedCategory)

        if (!mounted) {
          return
        }

        setArticles(nextArticles)
        setExpandedArticleId(null)
      } catch (fetchError) {
        if (mounted) {
          setArticles([])
          setError(fetchError.message || 'Unable to fetch headlines.')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadHeadlines()

    return () => {
      mounted = false
    }
  }, [selectedCategory])

  const sortedArticles = useMemo(() => {
    return [...articles].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
  }, [articles])

  const handleToggleRead = (articleId) => {
    setReadArticleIds((currentReadIds) => {
      if (currentReadIds.includes(articleId)) {
        return currentReadIds.filter((id) => id !== articleId)
      }

      return [...currentReadIds, articleId]
    })
  }

  const handleExpandArticle = (articleId) => {
    setExpandedArticleId((currentId) => (currentId === articleId ? null : articleId))
  }

  const handleToggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
  }

  return (
    <main className='min-h-screen bg-background text-foreground'>
      <div className='relative overflow-hidden'>
        <div className='absolute inset-x-0 top-0 -z-10 h-[420px] bg-gradient-to-br from-primary/10 via-background to-blue-500/10' />
        <div className='absolute left-[-80px] top-16 -z-10 h-56 w-56 rounded-full bg-primary/10 blur-3xl' />
        <div className='absolute right-[-70px] top-28 -z-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl' />

        <div className='mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8'>
          <header className='mb-8 flex flex-col gap-4 rounded-2xl border bg-background/80 p-4 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm'>
                <Newspaper className='h-5 w-5' />
              </div>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>React Mini Project</p>
                <h1 className='text-lg font-semibold sm:text-xl'>News Headlines Reader</h1>
              </div>
            </div>

            <div className='flex flex-wrap items-center gap-2'>
              <Badge variant='secondary'>Live NewsAPI Feed</Badge>
              <Button variant='outline' onClick={handleToggleTheme}>
                {theme === 'dark' ? (
                  <>
                    <Sun className='h-4 w-4' />
                    Light Mode
                  </>
                ) : (
                  <>
                    <Moon className='h-4 w-4' />
                    Dark Mode
                  </>
                )}
              </Button>
            </div>
          </header>

          <section className='mb-8 grid gap-6 lg:grid-cols-[1.3fr_0.9fr] lg:items-stretch'>
            <Card className='overflow-hidden border-primary/10 bg-background/85 shadow-lg backdrop-blur'>
              <CardHeader className='space-y-5'>
                <Badge className='w-fit gap-1 bg-primary/10 text-primary hover:bg-primary/10'>
                  <Flame className='h-3.5 w-3.5' />
                  Trending Headlines
                </Badge>

                <div className='space-y-3'>
                  <CardTitle className='text-3xl leading-tight sm:text-4xl'>
                    Stay updated with category-wise headlines in one clean dashboard.
                  </CardTitle>
                  <CardDescription className='max-w-2xl text-sm leading-6 sm:text-base'>
                    Explore curated articles, expand summaries, and keep track of what you have
                    already read with a polished light and dark interface.
                  </CardDescription>
                </div>

                <div className='flex flex-wrap items-center gap-3'>
                  <Button className='shadow-sm' asChild>
                    <a href='#headlines'>Browse Headlines <ChevronRight className='h-4 w-4' /></a>
                  </Button>
                  <Badge variant='outline' className='px-3 py-1 text-sm'>
                    Active Category: {selectedCategoryLabel}
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            <div className='grid gap-4 sm:grid-cols-3 lg:grid-cols-1'>
              <Card className='border-primary/10 bg-background/85 shadow-md backdrop-blur'>
                <CardContent className='flex items-center gap-3 p-5'>
                  <div className='rounded-xl bg-primary/10 p-3 text-primary'>
                    <Newspaper className='h-5 w-5' />
                  </div>
                  <div>
                    <p className='text-2xl font-semibold'>{sortedArticles.length}</p>
                    <p className='text-sm text-muted-foreground'>Visible headlines</p>
                  </div>
                </CardContent>
              </Card>

              <Card className='border-primary/10 bg-background/85 shadow-md backdrop-blur'>
                <CardContent className='flex items-center gap-3 p-5'>
                  <div className='rounded-xl bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-400'>
                    <CheckCircle2 className='h-5 w-5' />
                  </div>
                  <div>
                    <p className='text-2xl font-semibold'>{readCount}</p>
                    <p className='text-sm text-muted-foreground'>Articles marked read</p>
                  </div>
                </CardContent>
              </Card>

              <Card className='border-primary/10 bg-background/85 shadow-md backdrop-blur'>
                <CardContent className='flex items-center gap-3 p-5'>
                  <div className='rounded-xl bg-blue-500/10 p-3 text-blue-600 dark:text-blue-400'>
                    <Globe2 className='h-5 w-5' />
                  </div>
                  <div>
                    <p className='text-sm font-semibold'>Live Source</p>
                    <p className='text-sm text-muted-foreground'>Powered by NewsAPI</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <Card className='mb-6 border-primary/10 bg-background/90 shadow-md backdrop-blur'>
            <CardHeader className='space-y-4'>
              <div className='flex flex-wrap items-center justify-between gap-3'>
                <div>
                  <CardTitle className='text-xl'>Filter your feed</CardTitle>
                  <CardDescription>
                    Choose a news category and explore the latest headlines.
                  </CardDescription>
                </div>
                <Badge variant='secondary'>Read Count: {readCount}</Badge>
              </div>

              <div className='grid gap-3 sm:grid-cols-[240px_1fr] sm:items-center'>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className='w-full bg-background'>
                    <SelectValue placeholder='Select category' />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <p className='text-sm text-muted-foreground'>
                  Live headlines loaded from NewsAPI for the <span className='font-medium'>{selectedCategoryLabel}</span> category.
                </p>
              </div>
            </CardHeader>
          </Card>

          <section id='headlines'>
            {loading && (
              <div className='grid gap-4 md:grid-cols-2'>
                <Skeleton className='h-56 w-full rounded-2xl' />
                <Skeleton className='h-56 w-full rounded-2xl' />
                <Skeleton className='h-56 w-full rounded-2xl' />
                <Skeleton className='h-56 w-full rounded-2xl' />
              </div>
            )}

            {!loading && error && (
              <Card className='border-destructive/50 shadow-sm'>
                <CardContent className='pt-6'>
                  <p className='text-sm text-destructive'>{error}</p>
                </CardContent>
              </Card>
            )}

            {!loading && !error && sortedArticles.length === 0 && (
              <Card className='shadow-sm'>
                <CardContent className='pt-6'>
                  <p className='text-sm text-muted-foreground'>No headlines found for this category.</p>
                </CardContent>
              </Card>
            )}

            {!loading && !error && sortedArticles.length > 0 && (
              <div className='grid gap-5 md:grid-cols-2'>
                {sortedArticles.map((article, index) => {
                  const isRead = readArticleIds.includes(article.id)
                  const isExpanded = expandedArticleId === article.id

                  return (
                    <Card
                      key={article.id}
                      className='news-card border-primary/10 bg-background/95 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl'
                      style={{ animationDelay: `${index * 70}ms` }}
                    >
                      <CardHeader className='space-y-3'>
                        <div className='flex items-start justify-between gap-3'>
                          <Badge variant='outline' className='shrink-0'>
                            {selectedCategoryLabel}
                          </Badge>
                          {isRead && <CheckCircle2 className='mt-0.5 h-5 w-5 shrink-0 text-primary' />}
                        </div>

                        <CardTitle
                          className={`text-lg leading-snug sm:text-xl ${
                            isRead ? 'line-through opacity-70' : ''
                          }`}
                        >
                          {article.title}
                        </CardTitle>

                        <CardDescription className='text-xs sm:text-sm'>
                          {article.source} · {new Date(article.publishedAt).toLocaleString()}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className='space-y-4'>
                        <p className='text-sm leading-6 text-muted-foreground'>
                          {isExpanded
                            ? article.description
                            : `${article.description.slice(0, 96)}${article.description.length > 96 ? '...' : ''}`}
                        </p>

                        <div className='flex flex-wrap items-center gap-2'>
                          <Button variant='outline' onClick={() => handleExpandArticle(article.id)}>
                            {isExpanded ? 'Hide Description' : 'Expand Description'}
                          </Button>

                          <Button
                            onClick={() => handleToggleRead(article.id)}
                            variant={isRead ? 'secondary' : 'default'}
                          >
                            {isRead ? 'Mark as Unread' : 'Mark as Read'}
                          </Button>

                          <Button variant='ghost' asChild>
                            <a href={article.url} target='_blank' rel='noreferrer'>
                              Source
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </section>

          <footer className='mt-10 rounded-2xl border bg-background/80 px-5 py-4 text-sm text-muted-foreground shadow-sm backdrop-blur'>
            <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
              <p>Built with React, Vite, Tailwind CSS, and shadcn/ui.</p>
              <p>Data source: NewsAPI live feed</p>
            </div>
          </footer>
        </div>
      </div>
    </main>
  )
}

export default App
