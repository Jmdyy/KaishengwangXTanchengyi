/**
 * 训练日详情页面
 * @author yy
 */

import { useParams, Link } from 'react-router-dom'
import { trainingPlan } from '../data/trainingPlan'
import { useUserDataStore } from '../store/userDataStore'
import ExerciseCard from '../components/ExerciseCard'

export default function DayPage() {
  const { dayId } = useParams<{ dayId: string }>()
  const day = trainingPlan.days.find((d) => d.day === Number(dayId))
  const { liftData, hasSetLifts } = useUserDataStore()

  if (!day) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-[#e8e6e3] mb-3">训练日不存在</h2>
        <Link to="/" className="text-[#ff8c5a] hover:underline">返回首页</Link>
      </div>
    )
  }

  const prevDay = day.day > 1 ? trainingPlan.days.find((d) => d.day === day.day - 1) : null
  const nextDay = trainingPlan.days.find((d) => d.day === day.day + 1) || null

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 面包屑 */}
      <div className="flex items-center gap-2 text-sm text-[#666] mb-6">
        <Link to="/" className="hover:text-[#ff8c5a] transition-colors">首页</Link>
        <span>/</span>
        <span className="text-[#e8e6e3]">Day {day.day} · {day.name}</span>
      </div>

      {/* 标题 */}
      <div className="text-center mb-8 animate-fade-in">
        <span className="text-4xl mb-3 block">{day.icon}</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">
          <span className="gradient-text">Day {day.day} · {day.name}</span>
        </h1>
        <p className="text-sm text-[#ff8c5a] font-medium mb-3">{day.focus}</p>
        <p className="text-sm text-[#999] max-w-2xl mx-auto leading-relaxed">{day.summary}</p>
      </div>

      {/* 未设置三大项提示 */}
      {!hasSetLifts && (
        <div className="mb-6 p-4 rounded-xl bg-[#facc15]/5 border border-[#facc15]/10 text-center animate-fade-in">
          <p className="text-sm text-[#facc15]">
            💡 在首页设置你的三大项数据，即可看到个性化的训练重量建议
          </p>
          <Link
            to="/"
            className="inline-block mt-2 text-xs text-[#ff8c5a] hover:underline"
          >
            前往设置 →
          </Link>
        </div>
      )}

      {/* 动作列表 */}
      <div className="space-y-4">
        {day.exercises.map((exercise, index) => (
          <ExerciseCard
            key={exercise.name}
            exercise={exercise}
            index={index}
            day={day.day}
            liftData={hasSetLifts ? liftData : null}
          />
        ))}
      </div>

      {/* 上下页导航 */}
      <div className="flex items-center justify-between mt-10 pt-6 border-t border-[#2a2a2a]">
        {prevDay ? (
          <Link
            to={`/day/${prevDay.day}`}
            className="flex items-center gap-2 text-sm text-[#999] hover:text-[#ff8c5a] transition-colors"
          >
            <span>←</span>
            <span>Day {prevDay.day} · {prevDay.name}</span>
          </Link>
        ) : <div />}

        {nextDay && (
          <Link
            to={`/day/${nextDay.day}`}
            className="flex items-center gap-2 text-sm text-[#999] hover:text-[#ff8c5a] transition-colors"
          >
            <span>Day {nextDay.day} · {nextDay.name}</span>
            <span>→</span>
          </Link>
        )}
      </div>

      <div className="text-center mt-8">
        <Link
          to="/principles"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ff6b35]/10 border border-[#ff6b35]/20 text-sm text-[#ff8c5a] hover:bg-[#ff6b35]/15 transition-colors"
        >
          📋 查看训练原则
        </Link>
      </div>
    </div>
  )
}
