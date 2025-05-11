export interface Movie {
  id: number
  title: string
  poster_path: string | null
  release_date: string
  overview: string
  original_title: string
  original_language: string
}

export interface TMDbSearchResponse {
  page: number
  results: Movie[]
  total_results: number
  total_pages: number
}
