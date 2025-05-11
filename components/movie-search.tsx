"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Search } from "lucide-react"

export function MovieSearch() {
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setIsLoading(true)
    const encodedTitles = encodeURIComponent(input)
    router.push(`/?titles=${encodedTitles}`)
    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-12">
      <div className="bg-netflix-dark-gray rounded-md border border-netflix-light-gray p-6 shadow-2xl">
        <label htmlFor="movie-titles" className="block text-sm font-medium mb-2 text-gray-300">
          电影标题 (逗号分隔)
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              id="movie-titles"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入中文电影标题，用逗号分隔"
              className="bg-netflix-black border-netflix-light-gray text-white placeholder:text-gray-500 pl-10 h-12"
            />
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
          </div>
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-netflix-red hover:bg-netflix-red/90 text-white px-6 h-12"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                搜索中
              </>
            ) : (
              "搜索"
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">示例: 英雄, 卧虎藏龙, 红高粱</p>
      </div>
    </form>
  )
}
