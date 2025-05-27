import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const imageUrl = searchParams.get('url')

        if (!imageUrl) {
            return new NextResponse('Missing image URL', { status: 400 })
        }

        // 构建请求选项
        const fetchOptions: RequestInit = {
            headers: {
                // TMDB 推荐的请求头
                'Accept': 'image/webp,image/*,*/*;q=0.8',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
            }
        }

        const response = await fetch(imageUrl, fetchOptions)

        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`)
        }

        const buffer = await response.arrayBuffer()
        const headers = new Headers()

        // 设置响应头
        headers.set(
            'Content-Type',
            response.headers.get('Content-Type') || 'image/jpeg'
        )
        headers.set('Cache-Control', 'public, max-age=31536000') // 缓存1年
        headers.set('Access-Control-Allow-Origin', '*')
        headers.set('Access-Control-Allow-Methods', 'GET')
        headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

        // 如果是 TMDB 的图片，添加额外的缓存控制
        if (imageUrl.includes('image.tmdb.org')) {
            headers.set('Cache-Control', 'public, max-age=31536000, immutable')
        }

        return new NextResponse(buffer, {
            headers,
            status: 200,
        })
    } catch (error) {
        console.error('Error proxying image:', error)
        const errorMessage = error instanceof Error ? error.message : 'Error fetching image'
        return new NextResponse(errorMessage, {
            status: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'text/plain'
            }
        })
    }
}
