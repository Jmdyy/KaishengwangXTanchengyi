/**
 * 首页 - 训练计划概述
 * @author yy
 */

import { Link } from 'react-router-dom'
import { trainingPlan } from '../data/trainingPlan'
import UserDataPanel from '../components/UserDataPanel'

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Hero */}
      <section className="text-center mb-10 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight mb-3">
          <span className="gradient-text">{trainingPlan.name}</span>
        </h1>
        <p className="text-sm sm:text-base text-[#777] max-w-2xl mx-auto leading-relaxed">
          {trainingPlan.subtitle}
        </p>
      </section>

      {/* 用户三大项数据面板 */}
      <section className="mb-10 animate-fade-in" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
        <UserDataPanel />
      </section>

      {/* 训练日概览表格 */}
      <section className="mb-10 animate-fade-in" style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
        <h2 className="text-lg font-bold text-[#e8e6e3] mb-4 flex items-center gap-2">
          📅 训练日分配
        </h2>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a2a2a]">
                <th className="text-left px-5 py-3 text-[#666] font-semibold uppercase tracking-wider text-xs">训练日</th>
                <th className="text-left px-5 py-3 text-[#666] font-semibold uppercase tracking-wider text-xs">类型</th>
                <th className="text-left px-5 py-3 text-[#666] font-semibold uppercase tracking-wider text-xs">目标部位</th>
                <th className="text-right px-5 py-3 text-[#666] font-semibold uppercase tracking-wider text-xs">动作数</th>
              </tr>
            </thead>
            <tbody>
              {trainingPlan.days.map((day, i) => (
                <tr
                  key={day.day}
                  className="border-b border-[#2a2a2a] last:border-0 hover:bg-[#ffffff04] transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <Link
                      to={`/day/${day.day}`}
                      className="flex items-center gap-2 text-[#ff8c5a] hover:text-[#ff6b35] font-semibold transition-colors"
                    >
                      <span className="text-lg">{day.icon}</span>
                      <span>Day {day.day}</span>
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-[#e8e6e3]">{day.name}</td>
                  <td className="px-5 py-3.5 text-[#999]">{day.focus}</td>
                  <td className="px-5 py-3.5 text-right text-[#999]">{day.exercises.length} 个动作</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 训练日卡片 */}
      <section className="mb-10 animate-fade-in" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
        <h2 className="text-lg font-bold text-[#e8e6e3] mb-4 flex items-center gap-2">
          🎯 选择训练日
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {trainingPlan.days.map((day, i) => (
            <Link
              key={day.day}
              to={`/day/${day.day}`}
              className="card p-5 group cursor-pointer hover:translate-y-[-2px]"
              style={{ animationDelay: `${250 + i * 80}ms`, animationFillMode: 'both' }}
            >
              <div className="text-3xl mb-3">{day.icon}</div>
              <h3 className="text-lg font-bold text-[#e8e6e3] group-hover:text-[#ff8c5a] transition-colors mb-1">
                Day {day.day} · {day.name}
              </h3>
              <p className="text-xs text-[#777] mb-3">{day.focus}</p>
              <p className="text-xs text-[#666] leading-relaxed line-clamp-2">{day.summary}</p>
              <div className="mt-3 text-xs text-[#ff8c5a] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                查看详情 →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 三分化 vs 五分化 */}
      <section className="mb-10 animate-fade-in" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
        <h2 className="text-lg font-bold text-[#e8e6e3] mb-4 flex items-center gap-2">
          💡 三分化 vs 五分化
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <ComparisonCard
            title="三分化"
            items={trainingPlan.comparison.threeSplit}
            highlight
          />
          <ComparisonCard
            title="五分化"
            items={trainingPlan.comparison.fiveSplit}
            highlight={false}
          />
        </div>
        <p className="mt-4 text-sm text-[#666] leading-relaxed px-4 py-3 rounded-xl bg-[#ff6b35]/5 border border-[#ff6b35]/10">
          💡 五分化每周每个部位只练 1 次，三分化每周每个部位可以练到 2 次。训练频率更高，肌肉蛋白合化的窗口期利用得更充分。
        </p>
      </section>

      {/* 训练原则入口 */}
      <section className="animate-fade-in" style={{ animationDelay: '500ms', animationFillMode: 'both' }}>
        <Link
          to="/principles"
          className="card p-5 sm:p-6 flex items-center justify-between group cursor-pointer hover:translate-y-[-2px]"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">📋</span>
            <div>
              <h3 className="text-base font-bold text-[#e8e6e3] group-hover:text-[#ff8c5a] transition-colors">
                训练原则与执行要点
              </h3>
              <p className="text-sm text-[#666] mt-0.5">力竭判断 · RPE 概念 · 休息策略 · 核心要点</p>
            </div>
          </div>
          <span className="text-[#ff8c5a] text-lg opacity-0 group-hover:opacity-100 transition-opacity">→</span>
        </Link>
      </section>
    </div>
  )
}

function ComparisonCard({ title, items, highlight }: { title: string; items: string[]; highlight: boolean }) {
  return (
    <div className={`card p-5 ${highlight ? 'border-[#ff6b35]/20' : ''}`}>
      <h3 className={`text-sm font-bold mb-3 ${highlight ? 'text-[#ff8c5a]' : 'text-[#999]'}`}>
        {title}
      </h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-[#ccc]">
            <span className="text-[#4ade80] mt-1 flex-shrink-0">✓</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
