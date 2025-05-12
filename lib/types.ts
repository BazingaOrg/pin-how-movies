export interface Credit {
  name: string
  job?: string
  character?: string
}

export interface MoviePoster {
  file_path: string
  iso_639_1: string | null
  vote_average: number
  width: number
  height: number
}

export interface PosterUrls {
  thumbnail: string  // w500 尺寸，用于缩略图
  full: string      // original 尺寸，用于查看大图
}

export interface MovieImages {
  id: number
  posters: MoviePoster[]
}

export interface Movie {
  id: number
  title: string
  poster_path: string | null
  release_date: string
  overview: string
  original_title: string
  original_language: string
  vote_average: number
  genres: Array<{ id: number; name: string }>
  production_countries: Array<{ iso_3166_1: string; name: string }>
  runtime: number
  directors: Credit[]
  writers: Credit[]
  cast: Credit[]
  alternative_titles?: Array<{ title: string; type: string }>
  best_poster_path?: PosterUrls | null
}

export interface TMDbSearchResponse {
  page: number
  results: Movie[]
  total_results: number
  total_pages: number
}
