/**
 * 三大项数据输入组件
 * 支持两种输入方式：直接输入1RM，或输入工作重量+次数自动推算
 * @author yy
 */

import { useState } from 'react'
import { useUserDataStore } from '../store/userDataStore'
import type { InputMethod } from '../utils/weightCalculator'
import { LIFT_DISPLAY_NAMES, estimate1RM } from '../utils/weightCalculator'

interface LiftField {
  key: 'bench' | 'squat' | 'deadlift'
  label: string
  icon: string
  placeholderWeight: string
  placeholderReps: string
}

const LIFT_FIELDS: LiftField[] = [
  {
    key: 'bench',
    label: LIFT_DISPLAY_NAMES.bench,
    icon: '🏋️',
    placeholderWeight: '例如 60',
    placeholderReps: '例如 8'
  },
  {
    key: 'squat',
    label: LIFT_DISPLAY_NAMES.squat,
    icon: '🦵',
    placeholderWeight: '例如 80',
    placeholderReps: '例如 8'
  },
  {
    key: 'deadlift',
    label: LIFT_DISPLAY_NAMES.deadlift,
    icon: '🔗',
    placeholderWeight: '例如 100',
    placeholderReps: '例如 5'
  }
]

interface Props {
  onClose?: () => void
}

export default function LiftInput({ onClose }: Props) {
  const { liftData, setLiftData, setLiftDataByWorkingWeight } = useUserDataStore()
  const [method, setMethod] = useState<InputMethod>('workingWeight')
  const [values, setValues] = useState({
    bench: { weight: liftData.bench > 0 ? String(liftData.bench) : '', reps: '8' },
    squat: { weight: liftData.squat > 0 ? String(liftData.squat) : '', reps: '8' },
    deadlift: { weight: liftData.deadlift > 0 ? String(liftData.deadlift) : '', reps: '5' }
  })

  const handleValueChange = (
    lift: 'bench' | 'squat' | 'deadlift',
    field: 'weight' | 'reps',
    value: string
  ) => {
    setValues((prev) => ({
      ...prev,
      [lift]: { ...prev[lift], [field]: value }
    }))
  }

  const handleSubmit = () => {
    if (method === 'oneRM') {
      const data = {
        bench: parseFloat(values.bench.weight) || 0,
        squat: parseFloat(values.squat.weight) || 0,
        deadlift: parseFloat(values.deadlift.weight) || 0
      }
      if (data.bench <= 0 && data.squat <= 0 && data.deadlift <= 0) return
      setLiftData(data)
    } else {
      const bw = parseFloat(values.bench.weight)
      const br = parseInt(values.bench.reps, 10)
      const sw = parseFloat(values.squat.weight)
      const sr = parseInt(values.squat.reps, 10)
      const dw = parseFloat(values.deadlift.weight)
      const dr = parseInt(values.deadlift.reps, 10)

      if ((bw <= 0 || br <= 0) && (sw <= 0 || sr <= 0) && (dw <= 0 || dr <= 0)) return

      setLiftDataByWorkingWeight(
        bw > 0 && br > 0 ? bw : 0,
        bw > 0 && br > 0 ? br : 8,
        sw > 0 && sr > 0 ? sw : 0,
        sw > 0 && sr > 0 ? sr : 8,
        dw > 0 && dr > 0 ? dw : 0,
        dw > 0 && dr > 0 ? dr : 5
      )
    }
    onClose?.()
  }

  const canSubmit = LIFT_FIELDS.some((f) => {
    const v = values[f.key]
    if (method === 'oneRM') return parseFloat(v.weight) > 0
    return parseFloat(v.weight) > 0 && parseInt(v.reps, 10) > 0
  })

  return (
    <div className="card p-5 sm:p-6 animate-fade-in">
      <h3 className="text-lg font-bold text-[#e8e6e3] mb-1 flex items-center gap-2">
        <span>📊</span> 设置你的三大项数据
      </h3>
      <p className="text-sm text-[#777] mb-5 leading-relaxed">
        输入你的三大项数据，系统将自动为每个训练动作计算个性化的 RPE 8 建议重量。
      </p>

      {/* 输入方式切换 */}
      <div className="flex gap-2 mb-5 p-1 rounded-xl bg-[#ffffff06] border border-[#2a2a2a]">
        <button
          onClick={() => setMethod('workingWeight')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
            method === 'workingWeight'
              ? 'bg-[#ff6b35]/15 text-[#ff8c5a]'
              : 'text-[#777] hover:text-[#ccc]'
          }`}
        >
          输入工作重量推算 1RM
        </button>
        <button
          onClick={() => setMethod('oneRM')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
            method === 'oneRM'
              ? 'bg-[#ff6b35]/15 text-[#ff8c5a]'
              : 'text-[#777] hover:text-[#ccc]'
          }`}
        >
          直接输入估算 1RM
        </button>
      </div>

      {/* 输入字段 */}
      <div className="space-y-3 mb-5">
        {LIFT_FIELDS.map((field) => {
          const v = values[field.key]
          const estimatedRM = method === 'workingWeight'
            ? estimate1RM(parseFloat(v.weight) || 0, parseInt(v.reps, 10) || 0)
            : null

          return (
            <div key={field.key} className="p-3 rounded-xl bg-[#ffffff04] border border-[#2a2a2a]/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{field.icon}</span>
                <span className="text-sm font-semibold text-[#e8e6e3]">{field.label}</span>
              </div>

              {method === 'oneRM' ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="2.5"
                    min="0"
                    placeholder={field.placeholderWeight}
                    value={v.weight}
                    onChange={(e) => handleValueChange(field.key, 'weight', e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-[#0f0f0f] border border-[#2a2a2a] text-sm text-[#e8e6e3] placeholder-[#555] focus:outline-none focus:border-[#ff6b35]/40 transition-colors"
                  />
                  <span className="text-xs text-[#666] flex-shrink-0">kg (1RM)</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="2.5"
                    min="0"
                    placeholder={field.placeholderWeight}
                    value={v.weight}
                    onChange={(e) => handleValueChange(field.key, 'weight', e.target.value)}
                    className="w-24 px-3 py-2 rounded-lg bg-[#0f0f0f] border border-[#2a2a2a] text-sm text-[#e8e6e3] placeholder-[#555] focus:outline-none focus:border-[#ff6b35]/40 transition-colors"
                  />
                  <span className="text-xs text-[#666]">kg ×</span>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    max="36"
                    placeholder={field.placeholderReps}
                    value={v.reps}
                    onChange={(e) => handleValueChange(field.key, 'reps', e.target.value)}
                    className="w-16 px-2 py-2 rounded-lg bg-[#0f0f0f] border border-[#2a2a2a] text-sm text-[#e8e6e3] placeholder-[#555] focus:outline-none focus:border-[#ff6b35]/40 transition-colors"
                  />
                  <span className="text-xs text-[#666]">次（至力竭）</span>
                  {estimatedRM !== null && estimatedRM > 0 && (
                    <span className="text-xs text-[#4ade80] ml-auto flex-shrink-0 whitespace-nowrap">
                      推算 1RM ≈ {estimatedRM} kg
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 提交按钮 */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="flex-1 py-2.5 rounded-xl bg-[#ff6b35] hover:bg-[#ff8c5a] disabled:bg-[#333] disabled:text-[#666] text-sm font-bold text-white transition-colors"
        >
          保存并应用
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#2a2a2a] text-sm text-[#999] hover:text-[#e8e6e3] transition-colors"
          >
            取消
          </button>
        )}
      </div>

      <p className="text-[10px] text-[#555] mt-3 text-center leading-relaxed">
        💡 数据保存在浏览器本地，不会上传到任何服务器。可随时修改或清除。
      </p>
    </div>
  )
}
