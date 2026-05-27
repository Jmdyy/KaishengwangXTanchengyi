/**
 * 用户数据概览面板（首页展示）
 * @author yy
 */

import { useState } from 'react'
import { useUserDataStore } from '../store/userDataStore'
import { LIFT_DISPLAY_NAMES, MONTHLY_SESSIONS } from '../utils/weightCalculator'
import type { LiftType } from '../utils/weightCalculator'
import LiftInput from './LiftInput'

export default function UserDataPanel() {
  const { liftData, hasSetLifts, logs, monthStartTime, reset } = useUserDataStore()
  const [showInput, setShowInput] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  if (showInput) {
    return (
      <LiftInput onClose={() => setShowInput(false)} />
    )
  }

  if (showConfirm) {
    return (
      <div className="card p-5 sm:p-6 animate-fade-in text-center">
        <p className="text-sm text-[#e8e6e3] mb-4">确定要清除所有训练数据和历史记录吗？此操作不可撤销。</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => { reset(); setShowConfirm(false) }}
            className="px-5 py-2 rounded-xl bg-[#ef4444]/15 text-[#ef4444] text-sm font-bold border border-[#ef4444]/20 hover:bg-[#ef4444]/20 transition-colors"
          >
            确认清除
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            className="px-5 py-2 rounded-xl border border-[#2a2a2a] text-sm text-[#999] hover:text-[#e8e6e3] transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    )
  }

  if (!hasSetLifts) {
    return (
      <button
        onClick={() => setShowInput(true)}
        className="card p-5 sm:p-6 w-full text-left group cursor-pointer hover:translate-y-[-2px] animate-fade-in"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">📊</span>
          <div>
            <h3 className="text-base font-bold text-[#e8e6e3] group-hover:text-[#ff8c5a] transition-colors mb-1">
              设置三大项数据
            </h3>
            <p className="text-sm text-[#777]">
              输入你的卧推、深蹲、硬拉数据，自动计算每个动作的建议训练重量
            </p>
          </div>
        </div>
      </button>
    )
  }

  const liftKeys: LiftType[] = ['bench', 'squat', 'deadlift']

  const monthLogs = logs.filter((l) => l.date >= monthStartTime)
  const totalMonthLogs = monthLogs.length
  const someComplete = totalMonthLogs >= MONTHLY_SESSIONS

  const monthStart = new Date(monthStartTime)
  const monthLabel = `${monthStart.getMonth() + 1}月${monthStart.getDate()}日`

  return (
    <div className="card p-5 sm:p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-[#e8e6e3] flex items-center gap-2">
          <span>📊</span> 你的三大项数据
          <span className="text-[10px] text-[#666] font-normal ml-1">
            （{monthLabel} 起）
          </span>
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInput(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#ff8c5a] border border-[#ff6b35]/20 hover:bg-[#ff6b35]/10 transition-colors"
          >
            更新 1RM
          </button>
          <button
            onClick={() => setShowConfirm(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#666] border border-[#2a2a2a] hover:text-[#ef4444] hover:border-[#ef4444]/20 transition-colors"
          >
            清除
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {liftKeys.map((key) => (
          <div key={key} className="p-3 rounded-xl bg-[#ffffff06] border border-[#2a2a2a]/50 text-center">
            <p className="text-[10px] text-[#666] uppercase tracking-wider mb-1">
              {LIFT_DISPLAY_NAMES[key]}
            </p>
            <p className="text-xl font-extrabold gradient-text">
              {liftData[key]}
            </p>
            <p className="text-[10px] text-[#555] mt-0.5">kg (1RM)</p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {totalMonthLogs > 0 && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-[#4ade80]/5 border border-[#4ade80]/10">
            <span className="text-sm">📝</span>
            <p className="text-xs text-[#4ade80]">
              本月已记录 <span className="font-bold">{totalMonthLogs}</span> 次训练
            </p>
          </div>
        )}

        {someComplete && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-[#facc15]/5 border border-[#facc15]/10">
            <span className="text-sm">🔄</span>
            <p className="text-xs text-[#facc15]">
              部分动作已达月度上限（{MONTHLY_SESSIONS}次），建议重新测试三大项 1RM 并更新数据。
            </p>
          </div>
        )}

        <div className="p-3 rounded-xl bg-[#ffffff04] border border-[#2a2a2a]/50">
          <p className="text-[10px] text-[#666] leading-relaxed">
            💡 月度周期：每次修改 1RM 数据都会开启新的月度训练周期，递进计数归零。
            每月完成 {MONTHLY_SESSIONS} 次训练后建议重测 1RM，以反映力量增长。
          </p>
        </div>
      </div>
    </div>
  )
}
