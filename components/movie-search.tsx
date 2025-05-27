"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Search, X } from "lucide-react"

interface MovieSearchProps {
  onSearch: (titles: string) => void
  initialValue?: string
}

export function MovieSearch({ onSearch, initialValue = "" }: MovieSearchProps) {
  const [input, setInput] = useState(initialValue)
  const [isLoading, setIsLoading] = useState(false)

  // 当 initialValue 变化时更新 input
  useEffect(() => {
    if (initialValue !== input) {
      setInput(initialValue)
    }
  }, [initialValue])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setIsLoading(true)
    await onSearch(input)
    setIsLoading(false)
  }, [input, onSearch])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }, [])

  const handleClear = useCallback(() => {
    setInput("")
    onSearch("")
  }, [onSearch])

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-12">
      <div className="rounded-md border p-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              id="movie-titles"
              value={input}
              onChange={handleInputChange}
              placeholder="输入中文电影标题，用逗号分隔"
              className="bg-netflix-black border-netflix-light-gray text-white placeholder:text-gray-500 pl-10 pr-10 h-12"
            />
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
            {input.trim() && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-3 text-gray-500 hover:text-white transition-colors focus:outline-none"
                aria-label="清除搜索内容"
              >
                <X className="h-5 w-5" />
              </button>
            )}
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
      </div>
    </form>
  )
}
