import { Sparkles } from 'lucide-react'

export default function Header() {
  return (
    <header className="pt-6 sm:pt-12 pb-4 sm:pb-8 text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-cosmos-600/10 border border-cosmos-500/20 text-cosmos-300 text-xs font-medium mb-3 sm:mb-6 animate-slide-up">
        <Sparkles size={12} />
        <span>AI-Powered Resume Analysis</span>
      </div>
      <h1 className="text-2xl sm:text-5xl font-bold tracking-tight mb-2 sm:mb-4 animate-slide-up animate-delay-100">
        <span className="text-gradient">AI赋能的智能简历分析</span>
        <span className="text-white/90">系统</span>
      </h1>
      <p className="text-white/40 text-sm sm:text-lg max-w-xl mx-auto animate-slide-up animate-delay-200">
        上传 PDF 简历，AI 自动解析关键信息，智能匹配岗位需求
      </p>
    </header>
  )
}
