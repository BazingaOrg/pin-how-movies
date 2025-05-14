'use client'

import { useState, useCallback, useEffect } from 'react'
import { MovieSearch } from '@/components/movie-search'
import { MovieResults } from '@/components/movie-results'
import { useSearchParams, useRouter } from 'next/navigation'
import type { Movie } from '@/lib/types'

export default function Home() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const urlTitles = searchParams.get('titles')

    // 全局状态管理
    const [searchTitles, setSearchTitles] = useState(urlTitles || '')
    const [movies, setMovies] = useState<Movie[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [hasSearched, setHasSearched] = useState(!!urlTitles)

    // 处理搜索
    const handleSearch = useCallback(
        async (titles: string) => {
            // 处理空搜索情况
            if (!titles.trim()) {
                setSearchTitles('')
                setMovies([])
                setHasSearched(false)
                router.replace('/', { scroll: false }) // 清除 URL 参数
                return
            }

            // 统一处理过的输入文本
            const trimmedTitles = titles.trim()

            // 更新 URL 以支持分享
            const encodedTitles = encodeURIComponent(trimmedTitles)
            router.replace(`/?titles=${encodedTitles}`, { scroll: false })

            // 如果当前搜索与上次相同，不再重复请求
            if (trimmedTitles === searchTitles.trim()) return

            // 更新搜索标题状态
            setSearchTitles(trimmedTitles)
            setIsLoading(true)
            setError(null)
            setHasSearched(true)

            try {
                const response = await fetch(
                    `/api/movies?titles=${encodedTitles}`
                )

                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`)
                }

                const results = await response.json()
                setMovies(results)
            } catch (err) {
                console.error('Error fetching movies:', err)
                setError('获取电影海报失败。请重试。')
            } finally {
                setIsLoading(false)
            }
        },
        [router, searchTitles]
    )

    // 初始加载和 URL 变化时同步
    useEffect(() => {
        if (urlTitles) {
            const decodedTitles = decodeURIComponent(urlTitles)
            setSearchTitles(decodedTitles)

            // 首次加载时强制调用接口
            setIsLoading(true)
            setError(null)

            fetch(`/api/movies?titles=${urlTitles}`)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`API error: ${response.status}`)
                    }
                    return response.json()
                })
                .then((results) => {
                    setMovies(results)
                })
                .catch((err) => {
                    console.error('Error fetching movies:', err)
                    setError('获取电影海报失败。请重试。')
                })
                .finally(() => {
                    setIsLoading(false)
                })
        }
        // 只依赖 urlTitles，确保仅在 URL 参数变化时执行
    }, [urlTitles])

    return (
        <div className="min-h-screen bg-gradient-to-b from-netflix-black to-black text-white">
            <div className="container mx-auto px-4 py-12">
                <div className="flex flex-col items-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-bold text-center mb-2">
                        拼好影
                    </h1>
                </div>

                <div className="max-w-7xl mx-auto">
                    <MovieSearch
                        onSearch={handleSearch}
                        initialValue={searchTitles}
                    />
                    <MovieResults
                        movies={movies}
                        loading={isLoading}
                        error={error}
                        hasSearched={hasSearched}
                    />
                </div>
            </div>
        </div>
    )
}
