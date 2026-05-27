import { Link } from 'react-router-dom'
import { trainingPlan } from '../data/trainingPlan'

export default function PrinciplesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 面包屑 */}
      <div className="flex items-center gap-2 text-sm text-[#666] mb-6">
        <Link to="/" className="hover:text-[#ff8c5a] transition-colors">首页</Link>
        <span>/</span>
        <span className="text-[#e8e6e3]">训练原则</span>
      </div>

      {/* 标题 */}
      <div className="text-center mb-10 animate-fade-in">
        <span className="text-4xl mb-3 block">📋</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">
          <span className="gradient-text">训练原则与执行要点</span>
        </h1>
        <p className="text-sm text-[#999] max-w-2xl mx-auto leading-relaxed">
          这套计划的核心思路：用自由重量开发身体功能，用线性递进提升力量上限，用合理疲劳管理保证持续进步。
        </p>
      </div>

      {/* 原则卡片 */}
      <div className="space-y-5">
        {trainingPlan.principles.map((principle, index) => (
          <div
            key={principle.title}
            className="card p-5 sm:p-6 animate-fade-in"
            style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
          >
            <div className="flex items-start gap-3 mb-4">
              <span className="text-2xl mt-0.5">{principle.icon}</span>
              <div>
                <h3 className="text-lg font-bold text-[#e8e6e3] mb-1">{principle.title}</h3>
                <p className="text-sm text-[#999] leading-relaxed">{principle.content}</p>
              </div>
            </div>

            <ul className="space-y-2.5 ml-11">
              {principle.keypoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-[#ccc]">
                  <span className="text-[#ff8c5a] mt-0.5 flex-shrink-0 text-xs">●</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* RPE 速查表 */}
      <div className="mt-10 animate-fade-in" style={{ animationDelay: '500ms', animationFillMode: 'both' }}>
        <h2 className="text-lg font-bold text-[#e8e6e3] mb-4 flex items-center gap-2">
          🎯 RPE 速查表
        </h2>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a2a2a]">
                <th className="text-left px-5 py-3 text-[#666] font-semibold uppercase tracking-wider text-xs">RPE</th>
                <th className="text-left px-5 py-3 text-[#666] font-semibold uppercase tracking-wider text-xs">感觉</th>
                <th className="text-left px-5 py-3 text-[#666] font-semibold uppercase tracking-wider text-xs">余量</th>
                <th className="text-left px-5 py-3 text-[#666] font-semibold uppercase tracking-wider text-xs">适用</th>
              </tr>
            </thead>
            <tbody>
              {[
                { rpe: 'RPE 6', feel: '轻松，能快速移动', reserve: '4 个', apply: '热身组' },
                { rpe: 'RPE 7', feel: '有挑战，但节奏稳定', reserve: '3 个', apply: '技术练习' },
                { rpe: 'RPE 8', feel: '感觉重，但能控制', reserve: '2 个', apply: '主项动作 ★' },
                { rpe: 'RPE 9', feel: '非常吃力', reserve: '1 个', apply: '辅项后期' },
                { rpe: 'RPE 10', feel: '完全力竭', reserve: '0 个', apply: '单关节动作' }
              ].map((row) => (
                <tr key={row.rpe} className="border-b border-[#2a2a2a] last:border-0 hover:bg-[#ffffff04] transition-colors">
                  <td className="px-5 py-3 font-semibold text-[#ff8c5a]">{row.rpe}</td>
                  <td className="px-5 py-3 text-[#e8e6e3]">{row.feel}</td>
                  <td className="px-5 py-3 text-[#999]">{row.reserve}</td>
                  <td className="px-5 py-3 text-[#ccc]">{row.apply}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 返回导航 */}
      <div className="flex flex-wrap gap-3 justify-center mt-10 pt-6 border-t border-[#2a2a2a]">
        {trainingPlan.days.map((day) => (
          <Link
            key={day.day}
            to={`/day/${day.day}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#ffffff08] border border-[#2a2a2a] text-sm text-[#999] hover:text-[#ff8c5a] hover:border-[#ff6b35]/20 transition-colors"
          >
            <span>{day.icon}</span>
            <span>Day {day.day}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
