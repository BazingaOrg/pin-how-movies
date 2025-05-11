import { MovieSearch } from "@/components/movie-search"
import { MovieResults } from "@/components/movie-results"
import { StreamingLogo } from "@/components/streaming-logo"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-netflix-black to-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center mb-12">
          <StreamingLogo className="w-32 h-16 mb-8" />
          <h1 className="text-4xl md:text-6xl font-bold text-center mb-2">中文电影海报查找器</h1>
          <p className="text-gray-400 text-center mb-8 max-w-2xl mx-auto">
            输入以逗号分隔的中文电影标题，查找电影数据库中的海报
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          <MovieSearch />
          <MovieResults />
        </div>
      </div>
    </div>
  )
}
