"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import type { Movie } from "@/lib/types"
import { motion } from "framer-motion"
import { Star } from "lucide-react"

export function MoviePoster({
  movie,
  index,
  totalCount,
}: {
  movie: Movie
  index: number
  totalCount: number
}) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const posterRef = useRef<HTMLDivElement>(null)

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "/placeholder.svg?height=750&width=500"

  // Mock data for fields not provided by the basic TMDb API
  const mockDetails = {
    duration: `${Math.floor(Math.random() * 60 + 90)}分钟`,
    director: ["张艺谋", "李安", "王家卫", "陈凯歌"][Math.floor(Math.random() * 4)],
    writer: ["王朔", "李碧华", "刘恒", "芦苇"][Math.floor(Math.random() * 4)],
    actors: {
      male: ["梁朝伟", "张国荣", "葛优", "姜文"][Math.floor(Math.random() * 4)],
      female: ["巩俐", "章子怡", "张曼玉", "周迅"][Math.floor(Math.random() * 4)],
    },
    rating: (Math.random() * 2 + 7).toFixed(1),
  }

  // Generate random position for each poster with boundary constraints
  const generatePosition = () => {
    // Create a pattern that's more scattered but still somewhat organized
    // Different patterns based on screen size
    const isMobile = window.innerWidth < 768

    // Calculate safe boundaries (percentage of container)
    // This ensures posters don't go outside the container
    const safeMargin = 15 // 15% margin from edges

    if (isMobile) {
      // For mobile, create a more vertical stack with less horizontal variation
      const row = Math.floor(index / 2)
      const col = index % 2

      // Base position (as percentage of container)
      const baseX = col * 40 + 10 // 40% width per column + 10% offset
      const baseY = row * 25 // 25% height per row

      // Add constrained randomness
      const randomX = Math.random() * 10 - 5 // -5% to +5%
      const randomY = Math.random() * 10 - 5 // -5% to +5%

      // Ensure within boundaries
      const finalX = Math.min(Math.max(baseX + randomX, safeMargin), 100 - safeMargin - 20) // 20% is approx poster width
      const finalY = Math.min(Math.max(baseY + randomY, 0), 100 - 30) // 30% is approx poster height

      return {
        left: `${finalX}%`,
        top: `${finalY}%`,
        zIndex: isHovered ? 50 : 10 + (index % 10),
        rotate: Math.random() * 10 - 5, // -5 to +5 degrees (less rotation on mobile)
      }
    } else {
      // For larger screens, create a more scattered layout
      // Calculate rows and columns based on total count
      const cols = Math.min(5, Math.ceil(Math.sqrt(totalCount))) // Max 5 columns
      const rows = Math.ceil(totalCount / cols)

      // Calculate which cell this poster belongs to
      const row = Math.floor(index / cols)
      const col = index % cols

      // Calculate cell size as percentage
      const cellWidth = (100 - safeMargin * 2) / cols
      const cellHeight = 100 / rows

      // Base position (center of the cell)
      const baseX = safeMargin + col * cellWidth + cellWidth / 2
      const baseY = row * cellHeight + cellHeight / 2

      // Add significant but constrained randomness
      const maxOffset = Math.min(cellWidth, cellHeight) / 3
      const randomX = Math.random() * maxOffset * 2 - maxOffset
      const randomY = Math.random() * maxOffset * 2 - maxOffset

      // Calculate final position, ensuring poster stays within its cell with some overlap allowed
      const posterWidthPercent = 15 // Approximate poster width as percentage
      const posterHeightPercent = 25 // Approximate poster height as percentage

      const minX = safeMargin + col * cellWidth - posterWidthPercent / 2
      const maxX = safeMargin + (col + 1) * cellWidth - posterWidthPercent / 2
      const minY = row * cellHeight - posterHeightPercent / 2
      const maxY = (row + 1) * cellHeight - posterHeightPercent / 2

      const finalX = Math.min(Math.max(baseX + randomX - posterWidthPercent / 2, minX), maxX)
      const finalY = Math.min(Math.max(baseY + randomY - posterHeightPercent / 2, minY), maxY)

      return {
        left: `${finalX}%`,
        top: `${finalY}%`,
        zIndex: isHovered ? 50 : 10 + (index % 10),
        rotate: Math.random() * 12 - 6, // -6 to +6 degrees
      }
    }
  }

  const [position, setPosition] = useState({ left: "0%", top: "0%", zIndex: 10, rotate: 0 })

  useEffect(() => {
    // Set initial position
    setPosition(generatePosition())

    // Update position on window resize
    const handleResize = () => {
      setPosition(generatePosition())
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [index, totalCount])

  return (
    <motion.div
      ref={posterRef}
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        x: 0,
        y: 0,
        zIndex: isHovered ? 50 : position.zIndex,
        rotate: isHovered ? 0 : position.rotate,
      }}
      transition={{
        duration: 0.5,
        delay: index * 0.05,
        type: "spring",
        stiffness: 100,
      }}
      className="poster-item"
      style={{
        left: position.left,
        top: position.top,
        transform: `rotate(${position.rotate}deg)`,
        zIndex: isHovered ? 50 : position.zIndex,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`poster-card ${isHovered ? "hovered" : ""}`}>
        <div className="poster-image">
          <Image
            src={posterUrl || "/placeholder.svg"}
            alt={movie.title}
            fill
            className={`object-cover transition-all duration-500 ${
              isLoaded ? "scale-100 blur-0" : "scale-110 blur-sm"
            }`}
            onLoad={() => setIsLoaded(true)}
          />
        </div>

        {isHovered && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="poster-details">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-white">{movie.title}</h3>
              <div className="flex items-center bg-netflix-red px-2 py-1 rounded text-white text-xs font-bold">
                <Star className="w-3 h-3 mr-1 fill-white" />
                {mockDetails.rating}
              </div>
            </div>

            <div className="text-xs text-gray-300 mb-2 flex items-center">
              {movie.release_date && <span className="mr-2">{new Date(movie.release_date).getFullYear()}</span>}
              <span className="mr-2">•</span>
              <span>{mockDetails.duration}</span>
            </div>

            <div className="text-xs text-gray-300 mb-1">
              <span className="text-gray-400">导演：</span>
              {mockDetails.director}
            </div>

            <div className="text-xs text-gray-300 mb-1">
              <span className="text-gray-400">编剧：</span>
              {mockDetails.writer}
            </div>

            <div className="text-xs text-gray-300 mb-1">
              <span className="text-gray-400">主演：</span>
              {mockDetails.actors.male}, {mockDetails.actors.female}
            </div>

            <div className="text-xs text-gray-300 mt-2 line-clamp-3">
              <span className="text-gray-400 block mb-1">简介：</span>
              {movie.overview || "暂无简介"}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
