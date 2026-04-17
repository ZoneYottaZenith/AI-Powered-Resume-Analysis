import { useState } from 'react'
import { User, Phone, Mail, MapPin, Briefcase, GraduationCap, Code, ArrowRight, RotateCcw, FileCheck, FileText, X } from 'lucide-react'

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null
  return (
    <div className="flex items-center justify-between gap-2 py-1.5 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-1.5 shrink-0">
        <Icon size={13} className="text-cosmos-400" />
        <span className="text-white/40 text-xs">{label}</span>
      </div>
      <span className="text-white/75 text-xs sm:text-sm text-left min-w-[55%] truncate">{value}</span>
    </div>
  )
}

function RawTextModal({ text, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="glass-card w-full max-w-3xl max-h-[80vh] flex flex-col">
        {/* 弹框头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 shrink-0">
          <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
            <FileText size={15} className="text-cosmos-400" />
            简历原始文本
            <span className="text-white/30 text-xs font-normal">{text ? text.length.toLocaleString() : 0} 字符</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        {/* 文本内容，可滚动 */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <pre className="text-white/60 text-sm font-mono leading-relaxed whitespace-pre-wrap break-words">
            {text || '（无原始文本）'}
          </pre>
        </div>
      </div>
    </div>
  )
}

export default function ResumeResult({ data, onNext, onReset }) {
  const { resume_data: r, filename, page_count, text_length } = data
  const [showRaw, setShowRaw] = useState(false)

  return (
    <div className="space-y-6 animate-slide-up">
      {showRaw && <RawTextModal text={r.raw_text} onClose={() => setShowRaw(false)} />}

      {/* 文件概况 */}
      <div className="glass-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white/90 mb-1 flex items-center gap-2"><FileCheck size={20} className="text-cosmos-400" /> 解析完成</h2>
            <p className="text-white/40 text-sm">
              {filename} · {page_count} 页 · {text_length.toLocaleString()} 字符
            </p>
          </div>
          <div className="flex justify-center gap-2 sm:gap-3 w-full sm:w-auto sm:justify-end">
            <button
              onClick={() => setShowRaw(true)}
              className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm text-white/50 hover:text-white/80 bg-white/5 hover:bg-white/10 transition-all whitespace-nowrap"
            >
              <FileText size={13} />
              原始文本
            </button>
            <button onClick={onReset} className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm text-white/50 hover:text-white/80 bg-white/5 hover:bg-white/10 transition-all whitespace-nowrap">
              <RotateCcw size={13} />
              重新上传
            </button>
            <button onClick={onNext} className="btn-primary flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-3 sm:px-6 py-2 sm:py-3 whitespace-nowrap">
              岗位匹配
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* 基本信息卡片 */}
        <div className="glass-card p-4 sm:p-6">
          <h3 className="text-xs sm:text-sm font-semibold text-cosmos-300 uppercase tracking-wider mb-3">基本信息</h3>
          <div>
            <InfoRow icon={User} label="姓名" value={r.basic_info.name} />
            <InfoRow icon={Phone} label="电话" value={r.basic_info.phone} />
            <InfoRow icon={Mail} label="邮箱" value={r.basic_info.email} />
            <InfoRow icon={MapPin} label="地址" value={r.basic_info.address} />
          </div>
        </div>

        {/* 求职相关的信息 */}
        <div className="glass-card p-4 sm:p-6">
          <h3 className="text-xs sm:text-sm font-semibold text-cosmos-300 uppercase tracking-wider mb-3">职业信息</h3>
          <div>
            <InfoRow icon={Briefcase} label="求职意向" value={r.job_intent.position} />
            <InfoRow icon={Briefcase} label="期望薪资" value={r.job_intent.expected_salary} />
            <InfoRow icon={GraduationCap} label="学历" value={r.background.education} />
            <InfoRow icon={Briefcase} label="工作年限" value={r.background.work_years} />
          </div>
        </div>
      </div>

      {/* 技能标签们 */}
      {r.skills && r.skills.length > 0 && (
        <div className="glass-card p-4 sm:p-6">
          <h3 className="text-xs sm:text-sm font-semibold text-cosmos-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Code size={14} />
            技能
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {r.skills.map((skill) => (
              <span key={skill} className="tag justify-center truncate">{skill}</span>
            ))}
          </div>
        </div>
      )}

      {/* 项目经历列表 */}
      {r.background.projects && r.background.projects.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-cosmos-300 uppercase tracking-wider mb-4">项目经历</h3>
          <ul className="space-y-3">
            {r.background.projects.map((proj, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-white/60">
                <span className="text-cosmos-400 mt-1">•</span>
                <span>{proj}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
