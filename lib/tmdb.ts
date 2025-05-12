import axios from 'axios'
import type { Movie, TMDbSearchResponse, Credit, MovieImages, PosterUrls } from "./types"

const TMDB_API_KEY = process.env.TMDB_API_KEY

// 创建 axios 实例
const api = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  timeout: 30000, // 30 秒超时
  headers: {
    'Authorization': `Bearer ${TMDB_API_KEY}`,
    'Content-Type': 'application/json',
  },
  // 在服务器端运行时使用代理
  ...(typeof window === 'undefined' && {
    proxy: {
      host: '127.0.0.1',
      port: 7890,
      protocol: 'http'
    }
  })
})

async function getMovieImages(movieId: number): Promise<PosterUrls | null> {
  try {
    const response = await api.get<MovieImages>(`/movie/${movieId}/images`)
    const posters = response.data.posters

    if (!posters || posters.length === 0) {
      return null
    }

    // 优先选择无语言标记且评分最高的海报
    const neutralPosters = posters.filter(poster => poster.iso_639_1 === null)
    let bestPoster: typeof posters[0] | null = null

    if (neutralPosters.length > 0) {
      bestPoster = neutralPosters.reduce((prev, current) =>
        current.vote_average > prev.vote_average ? current : prev
      )
    } else {
      // 如果没有无语言标记的海报，选择评分最高的
      bestPoster = posters.reduce((prev, current) =>
        current.vote_average > prev.vote_average ? current : prev
      )
    }

    if (!bestPoster) {
      return null
    }

    return {
      thumbnail: `https://image.tmdb.org/t/p/w500${bestPoster.file_path}`,
      full: `https://image.tmdb.org/t/p/original${bestPoster.file_path}`
    }
  } catch (error) {
    console.error(`获取电影 ${movieId} 图片失败:`, error)
    return null
  }
}

async function getMovieDetails(movieId: number): Promise<Partial<Movie>> {
  try {
    const [details, credits, alternativeTitles, bestPosterPath] = await Promise.all([
      api.get(`/movie/${movieId}`, {
        params: {
          language: 'zh-CN',
        }
      }),
      api.get(`/movie/${movieId}/credits`, {
        params: {
          language: 'zh-CN',
        }
      }),
      api.get(`/movie/${movieId}/alternative_titles`),
      getMovieImages(movieId)
    ])

    const directors: Credit[] = credits.data.crew
      .filter((person: any) => person.job === 'Director')
      .map((person: any) => ({
        name: person.name,
        job: person.job
      }))

    const writers: Credit[] = credits.data.crew
      .filter((person: any) => ['Screenplay', 'Writer', 'Story'].includes(person.job))
      .map((person: any) => ({
        name: person.name,
        job: person.job
      }))

    const cast: Credit[] = credits.data.cast
      .slice(0, 4)
      .map((person: any) => ({
        name: person.name,
        character: person.character
      }))

    const chineseAltTitles = alternativeTitles.data.titles
      .filter((title: any) => title.iso_3166_1 === 'CN' || title.iso_3166_1 === 'TW' || title.iso_3166_1 === 'HK')
      .map((title: any) => ({
        title: title.title,
        type: title.type
      }))

    return {
      ...details.data,
      directors,
      writers,
      cast,
      alternative_titles: chineseAltTitles,
      best_poster_path: bestPosterPath
    }
  } catch (error) {
    console.error(`获取电影 ${movieId} 详情失败:`, error)
    throw error
  }
}

interface MovieSearchOptions {
  title: string
  year?: number // 可选的年份
  region?: string // 可选的地区
}

function parseMovieTitle(input: string): MovieSearchOptions {
  // 只支持 "电影名 (2024)" 格式，避免误解析电影名中的年份
  const yearPattern = /\((\d{4})\)$/
  const match = input.match(yearPattern)

  if (match) {
    const year = parseInt(match[1])
    const title = input.replace(yearPattern, '').trim()
    return { title, year }
  }

  return { title: input }
}

function calculateMovieScore(movie: Movie, searchOptions: MovieSearchOptions): number {
  let score = 0

  // 1. 标题完全匹配加分（区分大小写）
  if (movie.title === searchOptions.title) {
    score += 10
  }

  // 2. 标题包含搜索词加分（不区分大小写）
  if (movie.title.toLowerCase().includes(searchOptions.title.toLowerCase())) {
    score += 5
  }

  // 3. 年份匹配加分
  if (searchOptions.year) {
    const movieYear = new Date(movie.release_date).getFullYear()
    if (movieYear === searchOptions.year) {
      score += 8
    } else if (Math.abs(movieYear - searchOptions.year) === 1) {
      // 年份相差一年也给一定分数
      score += 4
    }
  }

  // 4. 评分高的电影加分
  score += movie.vote_average / 2 // 最高10分，这里最多加5分

  return score
}

export async function searchMovies(titles: string[]): Promise<Movie[]> {
  try {
    const moviePromises = titles.map(async (input) => {
      try {
        const searchOptions = parseMovieTitle(input)
        console.log(`正在搜索电影: ${searchOptions.title}${searchOptions.year ? ` (${searchOptions.year})` : ''}`)

        const response = await api.get<TMDbSearchResponse>('/search/movie', {
          params: {
            query: searchOptions.title,
            language: 'zh-CN',
            ...(searchOptions.year && { year: searchOptions.year }) // 如果有年份，添加年份参数
          }
        })

        if (response.data.results.length === 0) {
          console.log(`未找到电影: ${input}`)
          return null
        }

        // 对搜索结果进行评分和排序
        const scoredResults = await Promise.all(
          response.data.results.slice(0, 5).map(async (movie) => {
            const details = await getMovieDetails(movie.id)
            const fullMovie = { ...movie, ...details } as Movie
            const score = calculateMovieScore(fullMovie, searchOptions)
            return { movie: fullMovie, score }
          })
        )

        // 按分数排序并选择最佳匹配
        const bestMatch = scoredResults.sort((a, b) => b.score - a.score)[0]

        if (bestMatch) {
          console.log(`找到最佳匹配电影: ${bestMatch.movie.title}${bestMatch.movie.release_date ? ` (${new Date(bestMatch.movie.release_date).getFullYear()})` : ''}`)
          return bestMatch.movie
        }

        return null
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(`搜索电影 ${input} 时出错:`, {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message
          })
        } else {
          console.error(`搜索电影 ${input} 时出错:`, error)
        }
        throw error
      }
    })

    const results = await Promise.all(moviePromises)
    return results.filter((movie): movie is Movie => movie !== null)
  } catch (error) {
    console.error("搜索电影时出错:", error)
    throw error
  }
}
