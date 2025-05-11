import axios from 'axios'
import type { Movie, TMDbSearchResponse } from "./types"

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

export async function searchMovies(titles: string[]): Promise<Movie[]> {
  try {
    const moviePromises = titles.map(async (title) => {
      try {
        console.log(`正在搜索电影: ${title}`)
        const response = await api.get<TMDbSearchResponse>('/search/movie', {
          params: {
            query: title,
            language: 'zh-CN',
            include_adult: false
          }
        })

        if (response.data.results.length === 0) {
          console.log(`未找到电影: ${title}`)
          return null
        }

        console.log(`找到电影: ${response.data.results[0].title}`)
        return response.data.results[0]
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(`搜索电影 ${title} 时出错:`, {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message
          })
        } else {
          console.error(`搜索电影 ${title} 时出错:`, error)
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
