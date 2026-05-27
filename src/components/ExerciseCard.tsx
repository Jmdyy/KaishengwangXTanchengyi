/**
 * 训练动作卡片组件
 * @author yy
 */

import { useState } from 'react'
import type { Exercise } from '../data/trainingPlan'
import type { LiftData } from '../utils/weightCalculator'
import { parseTargetReps, EXERCISE_WEIGHT_MAP, MONTHLY_SESSIONS } from '../utils/weightCalculator'
import { useUserDataStore } from '../store/userDataStore'
import WeightDisplay from './WeightDisplay'
import TrainingLogModal from './TrainingLogModal'

function getTagClass(tag: string): string {
  if (tag.includes('力竭')) return 'tag-warning'
  if (tag.includes('主线') || tag.includes('核心')) return 'tag-primary'
  if (tag.includes('单关节') || tag.includes('复合动作')) return 'tag-info'
  return 'tag'
}

interface Props {
  exercise: Exercise
  index: number
  day: number
  liftData: LiftData | null
}

export default function ExerciseCard({ exercise, index, day, liftData }: Props) {
  const [showLog, setShowLog] = useState(false)
  const { logs, getProgressionCount } = useUserDataStore()
  const targetReps = parseTargetReps(exercise.reps)

  const mapping = EXERCISE_WEIGHT_MAP.find((m) => m.exerciseName === exercise.name)
  const rawCount = mapping ? getProgressionCount(exercise.name, mapping.liftType) : 0
  const completedCount = rawCount > MONTHLY_SESSIONS ? MONTHLY_SESSIONS : rawCount

  const mappingLogs = logs.filter((l) => l.exerciseName === exercise.name)
  const lastLog = mappingLogs.length > 0 ? mappingLogs[mappingLogs.length - 1] : null
  const isDumbbell = mapping?.unit === 'dumbbell'

  return (
    <>
      <div
        className="card p-5 sm:p-6 animate-fade-in"
        style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'both' }}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#ff6b35]/10 text-[#ff8c5a] text-sm font-bold">
              {index + 1}
            </span>
            <h4 className="text-base sm:text-lg font-semibold text-[#e8e6e3]">
              {exercise.name}
              {isDumbbell && (
                <span className="text-[10px] text-[#ff8c5a]/60 ml-1.5 font-normal align-middle">哑铃·单手</span>
              )}
            </h4>
          </div>
          <div className="flex flex-wrap gap-1.5 justify-end">
            {exercise.tags.map((tag) => (
              <span key={tag} className={`tag ${getTagClass(tag)}`}>{tag}</span>
            ))}
          </div>
        </div>

        <p className="text-sm text-[#999] leading-relaxed mb-4">{exercise.description}</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          <InfoBlock label="组数" value={exercise.sets} />
          <InfoBlock label="次数" value={exercise.reps} />
          <InfoBlock label="强度" value={exercise.rpe} />
        </div>

        {/* 建议重量 + 月度递进 */}
        <WeightDisplay
          exerciseName={exercise.name}
          targetReps={targetReps}
          liftData={liftData}
          completedCount={completedCount}
        />

        {/* 上次记录 */}
        {lastLog && (
          <div className="mt-3 p-2.5 rounded-lg bg-[#60a5fa]/5 border border-[#60a5fa]/10 flex items-center gap-2 text-xs">
            <span>📝</span>
            <span className="text-[#60a5fa]">
              上次：{lastLog.weight}kg {lastLog.setsReps} · RPE {lastLog.feltRpe}
            </span>
            {isDumbbell && <span className="text-[10px] text-[#60a5fa]/60">单手</span>}
          </div>
        )}

        <div className="space-y-3 mt-4">
          <div className="p-3 rounded-xl bg-[#ffffff06] border border-[#2a2a2a]">
            <p className="text-xs font-semibold text-[#ff8c5a] mb-1 uppercase tracking-wider">📈 递进逻辑</p>
            <p className="text-sm text-[#ccc] leading-relaxed">{exercise.progression}</p>
          </div>
          <div className="p-3 rounded-xl bg-[#ffffff06] border border-[#2a2a2a]">
            <p className="text-xs font-semibold text-[#60a5fa] mb-1 uppercase tracking-wider">💡 执行要点</p>
            <p className="text-sm text-[#ccc] leading-relaxed">{exercise.tips}</p>
          </div>
        </div>

        {/* 记录训练按钮 */}
        {liftData && (
          <button
            onClick={() => setShowLog(true)}
            className="mt-4 w-full py-2 rounded-xl bg-[#ff6b35]/10 border border-[#ff6b35]/20 text-sm font-medium text-[#ff8c5a] hover:bg-[#ff6b35]/15 transition-colors"
          >
            📝 记录本次训练
          </button>
        )}
      </div>

      {showLog && (
        <TrainingLogModal
          exerciseName={exercise.name}
          targetReps={targetReps}
          day={day}
          liftData={liftData}
          completedCount={completedCount}
          onClose={() => setShowLog(false)}
        />
      )}
    </>
  )
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2.5 rounded-lg bg-[#ffffff04] border border-[#2a2a2a]/50 text-center">
      <p className="text-[10px] text-[#666] uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-[#e8e6e3]">{value}</p>
    </div>
  )
}
