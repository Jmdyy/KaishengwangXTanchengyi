/**
 * 训练记录弹窗组件
 * @author yy
 */

import { useState } from 'react'
import { useUserDataStore } from '../store/userDataStore'
import type { LiftData } from '../utils/weightCalculator'
import {
  calcProgressionWeight,
  EXERCISE_WEIGHT_MAP,
  MONTHLY_SESSIONS,
  getMonthlyProgression,
  getWeightUnitLabel,
  parseTargetReps
} from '../utils/weightCalculator'

interface Props {
  exerciseName: string
  targetReps: number
  day: number
  liftData: LiftData | null
  completedCount: number
  onClose: () => void
}

export default function TrainingLogModal({
  exerciseName,
  targetReps,
  day,
  liftData,
  completedCount,
  onClose
}: Props) {
  const { addLog } = useUserDataStore()

  const mapping = EXERCISE_WEIGHT_MAP.find((m) => m.exerciseName === exerciseName)
  const unitLabel = mapping ? getWeightUnitLabel(mapping.unit) : 'kg'
  const isDumbbell = mapping?.unit === 'dumbbell'

  const plan = getMonthlyProgression(exerciseName, liftData, targetReps, completedCount)
  const nextWeight = plan?.weeks
    .flatMap((w) => w.sessions)
    .find((s) => s.session === completedCount + 1)?.weight ?? plan?.baseWeight ?? 0

  const suggestedWeight = completedCount > 0
    ? calcProgressionWeight(plan?.baseWeight ?? 0, completedCount, plan?.increment ?? 2.5)
    : (plan?.baseWeight ?? 0)

  const monthComplete = completedCount >= MONTHLY_SESSIONS

  const [weight, setWeight] = useState(suggestedWeight > 0 ? String(suggestedWeight) : '')
  const [sets, setSets] = useState('4')
  const [completedReps, setCompletedReps] = useState(String(targetReps))
  const [feltRpe, setFeltRpe] = useState(8)

  const handleSave = () => {
    const w = parseFloat(weight)
    if (w <= 0) return

    addLog({
      day,
      exerciseName,
      weight: w,
      setsReps: `${sets}×${completedReps}`,
      feltRpe
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card p-5 sm:p-6 w-full max-w-sm animate-fade-in">
        <h4 className="text-base font-bold text-[#e8e6e3] mb-1">
          {exerciseName}
          {isDumbbell && <span className="text-[11px] text-[#ff8c5a]/60 ml-1 font-normal">单手每只</span>}
        </h4>
        <p className="text-xs text-[#777] mb-4">Day {day} · 记录本次训练</p>

        {monthComplete && (
          <div className="mb-4 p-3 rounded-xl bg-[#ef4444]/5 border border-[#ef4444]/10">
            <p className="text-xs text-[#ef4444]">
              ⚠ 本月 {MONTHLY_SESSIONS} 次已完成，建议返回首页重新测试 1RM 后再开始新周期。
            </p>
          </div>
        )}

        {/* 建议重量参考 */}
        {nextWeight > 0 && !monthComplete && (
          <div className="mb-4 p-3 rounded-xl bg-[#ff6b35]/5 border border-[#ff6b35]/10">
            <p className="text-[10px] text-[#ff8c5a] uppercase tracking-wider mb-1">
              📈 {completedCount > 0 ? `递进建议（第 ${completedCount + 1} / ${MONTHLY_SESSIONS} 次）` : '首次训练建议'}
            </p>
            <p className="text-sm text-[#e8e6e3]">
              建议重量 <span className="text-[#ff8c5a] font-bold">~{suggestedWeight} {unitLabel}</span>
              {completedCount > 0 && plan && (
                <span className="text-xs text-[#777] ml-1">
                  （基础 {plan.baseWeight} + {plan.increment}×{completedCount}）
                </span>
              )}
            </p>
            {isDumbbell && (
              <p className="text-[10px] text-[#ff8c5a]/60 mt-0.5">💡 以上为单手哑铃重量</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-[10px] text-[#666] uppercase tracking-wider mb-1">
              重量 ({unitLabel}{isDumbbell ? '每只' : ''})
            </label>
            <input
              type="number"
              step="2.5"
              min="0"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="重量"
              className="w-full px-3 py-2 rounded-lg bg-[#0f0f0f] border border-[#2a2a2a] text-sm text-[#e8e6e3] placeholder-[#555] focus:outline-none focus:border-[#ff6b35]/40 transition-colors"
            />
          </div>
          <div>
            <label className="block text-[10px] text-[#666] uppercase tracking-wider mb-1">组数</label>
            <input
              type="number"
              step="1"
              min="1"
              value={sets}
              onChange={(e) => setSets(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0f0f0f] border border-[#2a2a2a] text-sm text-[#e8e6e3] focus:outline-none focus:border-[#ff6b35]/40 transition-colors"
            />
          </div>
          <div>
            <label className="block text-[10px] text-[#666] uppercase tracking-wider mb-1">完成次数</label>
            <input
              type="number"
              step="1"
              min="1"
              value={completedReps}
              onChange={(e) => setCompletedReps(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0f0f0f] border border-[#2a2a2a] text-sm text-[#e8e6e3] focus:outline-none focus:border-[#ff6b35]/40 transition-colors"
            />
          </div>
          <div>
            <label className="block text-[10px] text-[#666] uppercase tracking-wider mb-1">自评 RPE</label>
            <div className="flex gap-1">
              {[6, 7, 8, 9, 10].map((rpe) => (
                <button
                  key={rpe}
                  onClick={() => setFeltRpe(rpe)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                    feltRpe === rpe
                      ? 'bg-[#ff6b35]/15 text-[#ff8c5a] border border-[#ff6b35]/30'
                      : 'bg-[#0f0f0f] border border-[#2a2a2a] text-[#999] hover:border-[#ff6b35]/20'
                  }`}
                >
                  {rpe}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={parseFloat(weight) <= 0}
            className="flex-1 py-2.5 rounded-xl bg-[#ff6b35] hover:bg-[#ff8c5a] disabled:bg-[#333] disabled:text-[#666] text-sm font-bold text-white transition-colors"
          >
            记录训练
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#2a2a2a] text-sm text-[#999] hover:text-[#e8e6e3] transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  )
}
