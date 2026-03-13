/* global process */

import 'dotenv/config'
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 8787
const NEWS_PROVIDER = (process.env.NEWS_PROVIDER || 'gnews').toLowerCase()
const NEWS_API_KEY = process.env.NEWS_API_KEY
const GNEWS_API_KEY = process.env.GNEWS_API_KEY
const NEWS_COUNTRY = process.env.NEWS_COUNTRY || 'in'
const NEWS_LANGUAGE = process.env.NEWS_LANGUAGE || 'en'
const NEWS_MAX_RESULTS = process.env.NEWS_MAX_RESULTS || '20'

app.use(express.json())

app.get('/api/news', async (req, res) => {
  const category = req.query.category || 'general'

  const provider = req.query.provider ? String(req.query.provider).toLowerCase() : NEWS_PROVIDER

  const activeApiKey = provider === 'gnews' ? GNEWS_API_KEY || NEWS_API_KEY : NEWS_API_KEY

  if (!activeApiKey) {
    return res.status(500).json({
      message:
        provider === 'gnews'
          ? 'Missing GNEWS_API_KEY (or NEWS_API_KEY) in server environment.'
          : 'Missing NEWS_API_KEY in server environment.',
    })
  }

  try {
    const endpoint =
      provider === 'gnews'
        ? new URL('https://gnews.io/api/v4/top-headlines')
        : new URL('https://newsapi.org/v2/top-headlines')

    endpoint.searchParams.set('country', NEWS_COUNTRY)
    endpoint.searchParams.set('category', category)

    if (provider === 'gnews') {
      endpoint.searchParams.set('lang', NEWS_LANGUAGE)
      endpoint.searchParams.set('max', NEWS_MAX_RESULTS)
      endpoint.searchParams.set('apikey', activeApiKey)
    } else {
      endpoint.searchParams.set('apiKey', activeApiKey)
    }

    const response = await fetch(endpoint)
    const rawBody = await response.text()

    let data = {}
    if (rawBody) {
      try {
        data = JSON.parse(rawBody)
      } catch {
        return res.status(502).json({
          message: 'Upstream news provider returned non-JSON response.',
        })
      }
    }

    const gnewsOk = provider === 'gnews' ? !data.errors : true
    const newsApiOk = provider === 'newsapi' ? data.status === 'ok' : true

    if (!response.ok || !gnewsOk || !newsApiOk) {
      const providerError = Array.isArray(data.errors)
        ? data.errors.join(', ')
        : data.message || data.code

      return res.status(response.status || 500).json({
        message: providerError || `Failed to fetch headlines from ${provider}.`,
      })
    }

    const articles = (data.articles || []).map((article, index) => ({
      id: article.url || `${article.title}-${index}`,
      category,
      title: article.title,
      description: article.description || 'No description available for this article.',
      source: article.source?.name || 'Unknown Source',
      url: article.url,
      imageUrl: article.urlToImage || '',
      publishedAt: article.publishedAt,
    }))

    return res.json({ articles })
  } catch (error) {
    const details = error?.cause?.message || error?.message || 'Unexpected server error while fetching news.'
    return res.status(500).json({
      message: details,
    })
  }
})

const distPath = path.join(__dirname, 'dist')
app.use(express.static(distPath))

app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`News server running on http://localhost:${PORT}`)
})
