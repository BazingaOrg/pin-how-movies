import { NextResponse } from "next/server"
import { searchMovies } from "@/lib/tmdb"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const titles = searchParams.get("titles")

    if (!titles) {
      return NextResponse.json({ error: "No titles provided" }, { status: 400 })
    }

    const movieTitles = titles
      .split(",")
      .map((title) => title.trim())
      .filter(Boolean)

    const movies = await searchMovies(movieTitles)

    // Add mock data for fields not provided by the basic TMDb API
    const enhancedMovies = movies.map((movie) => ({
      ...movie,
      // We'll generate this data in the component for visual variety
    }))

    return NextResponse.json(enhancedMovies)
  } catch (error) {
    console.error("Error in API route:", error)
    return NextResponse.json({ error: "Failed to fetch movies" }, { status: 500 })
  }
}
