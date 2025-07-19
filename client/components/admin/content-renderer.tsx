"use client"

interface ContentRendererProps {
  content: string
  className?: string
}

export default function ContentRenderer({ content, className = "" }: ContentRendererProps) {
  // Parse shortcode [image:ID|alt_text] thành HTML
  const parseContent = (text: string): string => {
    if (!text) return ""
    
    // Regex để tìm shortcode ảnh [image:123|alt text] hoặc [image:123]
    const imageShortcodeRegex = /\[image:(\d+)(?:\|([^\]]*))?\]/g
    
    return text.replace(imageShortcodeRegex, (match, imageId, altText) => {
      const alt = altText || 'Image'
      // Tạo URL đầy đủ cho ảnh (giả sử API trả về đường dẫn tương đối)
      const imageUrl = `http://14.187.218.183:12122/static/images/uploads/${imageId}.jpg`
      
      return `<img src="${imageUrl}" alt="${alt}" class="content-image" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px;" />`
    })
  }

  // Parse markdown cơ bản
  const parseMarkdown = (text: string): string => {
    return text
      // Bold: **text** -> <strong>text</strong>
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic: *text* -> <em>text</em>
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Links: [text](url) -> <a href="url">text</a>
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>')
      // Headings: # text -> <h1>text</h1>
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
      // Line breaks
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br />')
  }

  // Kết hợp parse shortcode và markdown
  const renderContent = (): string => {
    let parsed = parseContent(content)
    parsed = parseMarkdown(parsed)
    
    // Wrap trong paragraphs nếu chưa có
    if (parsed && !parsed.startsWith('<h') && !parsed.startsWith('<p')) {
      parsed = `<p class="mb-4">${parsed}</p>`
    }
    
    return parsed
  }

  if (!content) {
    return (
      <div className={`text-gray-500 italic ${className}`}>
        Chưa có nội dung
      </div>
    )
  }

  return (
    <div 
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: renderContent() }}
      style={{
        lineHeight: '1.6',
      }}
    />
  )
}

// Helper function để render content trong server components hoặc từ API
export function parseContentHTML(content: string): string {
  if (!content) return ""
  
  // Parse shortcode ảnh
  const imageShortcodeRegex = /\[image:(\d+)(?:\|([^\]]*))?\]/g
  let parsed = content.replace(imageShortcodeRegex, (match, imageId, altText) => {
    const alt = altText || 'Image'
    const imageUrl = `http://14.187.218.183:12122/static/images/uploads/${imageId}.jpg`
    
    return `<img src="${imageUrl}" alt="${alt}" class="content-image" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px;" />`
  })

  // Parse markdown cơ bản
  parsed = parsed
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>')
    .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
    .replace(/\n\n/g, '</p><p class="mb-4">')
    .replace(/\n/g, '<br />')

  // Wrap trong paragraphs nếu chưa có
  if (parsed && !parsed.startsWith('<h') && !parsed.startsWith('<p')) {
    parsed = `<p class="mb-4">${parsed}</p>`
  }

  return parsed
} 