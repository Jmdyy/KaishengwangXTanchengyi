/**
 * 训练重量建议 + 月度递进计划组件
 * @author yy
 */

import type { LiftData, ProgressionType } from '../utils/weightCalculator'
import {
  getMonthlyProgression,
  getWeightUnitLabel,
  MONTHLY_SESSIONS,
  EXERCISE_WEIGHT_MAP
} from '../utils/weightCalculator'

interface Props {
  exerciseName: string
  targetReps: number
  liftData: LiftData | null
  completedCount: number
}

export default function WeightDisplay({ exerciseName, targetReps, liftData, completedCount }: Props) {
  if (!liftData) return null

  const plan = getMonthlyProgression(exerciseName, liftData, targetReps, completedCount)
  if (!plan) return null

  const mapping = EXERCISE_WEIGHT_MAP.find((m) => m.exerciseName === exerciseName)
  const unitLabel = mapping ? getWeightUnitLabel(mapping.unit) : 'kg'
  const isDumbbell = mapping?.unit === 'dumbbell'

  return (
    <div className="mt-3 mb-1">
      <CurrentWeight
        baseWeight={plan.baseWeight}
        unitLabel={unitLabel}
        isDumbbell={isDumbbell}
        completedCount={completedCount}
        progressionType={plan.progressionType}
      />
      <ProgressionPanel
        plan={plan}
        unitLabel={unitLabel}
        completedCount={completedCount}
        progressionType={plan.progressionType}
      />
    </div>
  )
}

function CurrentWeight({
  baseWeight,
  unitLabel,
  isDumbbell,
  completedCount,
  progressionType
}: {
  baseWeight: number
  unitLabel: string
  isDumbbell: boolean
  completedCount: number
  progressionType: ProgressionType
}) {
  if (progressionType === 'fixed') {
    return (
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="px-2.5 py-1 rounded-lg bg-[#60a5fa]/10 text-xs font-semibold text-[#60a5fa]">
          ~ {baseWeight} {unitLabel}
          <span className="text-[10px] opacity-60 font-normal ml-0.5">参考</span>
        </span>
        <span className="text-[10px] text-[#60a5fa]/60">固定重量 · 触力竭即可</span>
        {isDumbbell && <span className="text-[10px] text-[#ff8c5a]/50">🤚 单手</span>}
      </div>
    )
  }

  if (progressionType === 'semi') {
    return (
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="px-2.5 py-1 rounded-lg bg-[#facc15]/10 text-xs font-semibold text-[#facc15]">
          ~ {baseWeight} {unitLabel}
          <span className="text-[10px] opacity-60 font-normal ml-0.5">起步</span>
        </span>
        <span className="text-[10px] text-[#facc15]/70">熟练后再递进</span>
        {isDumbbell && <span className="text-[10px] text-[#ff8c5a]/50">🤚 单手</span>}
      </div>
    )
  }

  const monthComplete = completedCount >= MONTHLY_SESSIONS
  if (monthComplete) {
    return (
      <span className="px-2.5 py-1 rounded-lg bg-[#ef4444]/10 text-xs font-semibold text-[#ef4444]">
        ⚠ 本月完成 · 请重新测试 1RM
      </span>
    )
  }

  return (
    <div className="flex items-center gap-2 mb-2 flex-wrap">
      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
        completedCount === 0
          ? 'bg-[#4ade80]/10 text-[#4ade80]'
          : 'bg-[#facc15]/10 text-[#facc15]'
      }`}>
        ~ {plan_of(baseWeight, completedCount)} {unitLabel}
        <span className="text-[10px] opacity-60 font-normal ml-0.5">RPE 8</span>
      </span>
      {completedCount > 0 && (
        <span className="text-[10px] text-[#777]">
          第 {completedCount + 1} 次 · +2.5kg/次
        </span>
      )}
      {isDumbbell && <span className="text-[10px] text-[#ff8c5a]/50">🤚 单手</span>}
    </div>
  )
}

function plan_of(base: number, count: number): number {
  return Math.round((base + count * 2.5) / 2.5) * 2.5
}

function ProgressionPanel({
  plan,
  unitLabel,
  completedCount,
  progressionType
}: {
  plan: NonNullable<ReturnType<typeof getMonthlyProgression>>
  unitLabel: string
  completedCount: number
  progressionType: ProgressionType
}) {
  const monthComplete = completedCount >= MONTHLY_SESSIONS

  if (progressionType === 'fixed') {
    return (
      <details className="group mt-1">
        <summary className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#60a5fa]/5 border border-[#60a5fa]/10 cursor-pointer select-none hover:border-[#60a5fa]/25 transition-all">
          <span className="text-sm">💡</span>
          <span className="text-xs font-bold text-[#60a5fa]">不线性递进</span>
          <span className="text-[10px] text-[#999] ml-auto">说明</span>
          <span className="text-[10px] text-[#60a5fa]/60 group-open:hidden">展开 ▾</span>
          <span className="text-[10px] text-[#60a5fa]/60 hidden group-open:inline">收起 ▴</span>
        </summary>
        <div className="mt-2 p-3 rounded-lg bg-[#60a5fa]/5 border border-[#60a5fa]/10">
          <p className="text-[11px] text-[#ccc] leading-relaxed">
            🚫 单关节/小肌群动作，<b>不强制线性递增</b>。<br />
            选择一个能做目标次数至力竭的重量，长期保持。<br />
            当你觉得太轻松时（RPE 降至 6 以下），再加重 2.5kg。
          </p>
        </div>
      </details>
    )
  }

  if (progressionType === 'semi') {
    return (
      <details className="group mt-1">
        <summary className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#facc15]/5 border border-[#facc15]/10 cursor-pointer select-none hover:border-[#facc15]/25 transition-all">
          <span className="text-sm">📅</span>
          <span className="text-xs font-bold text-[#facc15]">辅项递进计划</span>
          <span className="text-[10px] text-[#999] ml-auto">{MONTHLY_SESSIONS}次 / {plan.weeks.length}周</span>
          <span className="text-[10px] text-[#facc15]/60 group-open:hidden">展开 ▾</span>
          <span className="text-[10px] text-[#facc15]/60 hidden group-open:inline">收起 ▴</span>
        </summary>
        <div className="mt-2 p-3 rounded-lg bg-[#facc15]/5 border border-[#facc15]/10 mb-2">
          <p className="text-[11px] text-[#ccc] leading-relaxed">
            ⚠ 辅项：<b>先建立动作熟练度，再逐步加重</b>。<br />
            下方为参考递进表，但实际加重节奏应比主项慢。
            当 RPE 明显下降（感觉太轻松）时才增加重量。
          </p>
        </div>
        <WeightGrid plan={plan} unitLabel={unitLabel} completedCount={completedCount} />
        {monthComplete && <MonthCompleteNote />}
      </details>
    )
  }

  return (
    <details className="group mt-1">
      <summary className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#ff6b35]/5 border border-[#ff6b35]/15 cursor-pointer select-none hover:border-[#ff6b35]/30 transition-all">
        <span className="text-sm">📅</span>
        <span className="text-xs font-bold text-[#ff8c5a]">主线递进计划</span>
        <span className="text-[10px] text-[#999] ml-auto">{MONTHLY_SESSIONS}次 / {plan.weeks.length}周</span>
        <span className="text-[10px] text-[#ff8c5a]/60 group-open:hidden">展开 ▾</span>
        <span className="text-[10px] text-[#ff8c5a]/60 hidden group-open:inline">收起 ▴</span>
      </summary>
      <div className="mt-2 p-3 rounded-lg bg-[#ff6b35]/5 border border-[#ff6b35]/10 mb-2">
        <p className="text-[11px] text-[#ccc] leading-relaxed">
          🎯 主线动作：<b>严格执行线性递进，每次+2.5kg</b>。<br />
          RPE 8，留 2 个余量，不力竭。每次训练只动一个变量。
        </p>
      </div>
      <WeightGrid plan={plan} unitLabel={unitLabel} completedCount={completedCount} />
      {monthComplete && <MonthCompleteNote />}
    </details>
  )
}

function WeightGrid({
  plan,
  unitLabel,
  completedCount
}: {
  plan: NonNullable<ReturnType<typeof getMonthlyProgression>>
  unitLabel: string
  completedCount: number
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {plan.weeks.map((weekGroup) => (
        <div
          key={weekGroup.week}
          className="p-2.5 rounded-lg bg-[#ffffff04] border border-[#2a2a2a]/50"
        >
          <p className="text-[11px] font-bold text-[#999] mb-2 text-center border-b border-[#2a2a2a]/30 pb-1.5">
            第 {weekGroup.week} 周
          </p>
          {weekGroup.sessions.map((session) => (
            <div
              key={session.session}
              className={`flex items-center justify-between px-1.5 py-1 rounded text-xs ${
                session.session === completedCount + 1
                  ? 'bg-[#ff6b35]/15 text-[#ff8c5a] font-bold'
                  : session.completed
                    ? 'text-[#4ade80]/60 line-through'
                    : 'text-[#aaa]'
              }`}
            >
              <span>
                {session.session === completedCount + 1 ? '▶ ' : session.completed ? '✓ ' : ''}
                {session.session}
              </span>
              <span className="font-mono">{session.weight} {unitLabel}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function MonthCompleteNote() {
  return (
    <p className="mt-2 text-[10px] text-[#ef4444]/70 leading-relaxed">
      ⚠ 本月 8 次已完成，返回首页重新测试 1RM，系统将基于新数据重新计算下月重量。
    </p>
  )
}
