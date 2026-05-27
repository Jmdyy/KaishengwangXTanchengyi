/**
 * 用户数据状态管理（localStorage 持久化）
 * @author yy
 */

import { create } from 'zustand'
import type {
  LiftData,
  TrainingLog,
  LiftType
} from '../utils/weightCalculator'
import { DEFAULT_LIFT_DATA, MONTHLY_SESSIONS } from '../utils/weightCalculator'
import { estimate1RM } from '../utils/weightCalculator'

/** localStorage 键名 */
const STORAGE_KEY_LIFTS = 'training_lift_data'
const STORAGE_KEY_LOGS = 'training_logs'
const STORAGE_KEY_MONTH_START = 'training_month_start'

/** 安全读取 localStorage */
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

/** 安全写入 localStorage */
function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {
    /* localStorage full or unavailable, silently ignore */
  }
}

/** 用户数据 store 接口 */
interface UserDataState {
  /** 三大项 1RM 数据 */
  liftData: LiftData
  /** 是否已设置三大项 */
  hasSetLifts: boolean
  /** 训练日志数组 */
  logs: TrainingLog[]
  /** 本月起始时间戳（用于计数月度训练次数） */
  monthStartTime: number
  /** 获取指定动作本月已完成训练次数 */
  getProgressionCount: (exerciseName: string, liftType: LiftType) => number
  /** 设置三大项并开启新周期 */
  setLiftData: (data: LiftData) => void
  /** 通过工作重量+次数设置三大项并开启新周期 */
  setLiftDataByWorkingWeight: (
    benchW: number, benchR: number,
    squatW: number, squatR: number,
    deadliftW: number, deadliftR: number
  ) => void
  /** 添加训练日志 */
  addLog: (log: Omit<TrainingLog, 'date'>) => void
  /** 清空所有数据 */
  reset: () => void
}

export const useUserDataStore = create<UserDataState>((set, get) => ({
  liftData: loadFromStorage<LiftData>(STORAGE_KEY_LIFTS, DEFAULT_LIFT_DATA),
  hasSetLifts: loadFromStorage<LiftData>(STORAGE_KEY_LIFTS, DEFAULT_LIFT_DATA).bench > 0,
  logs: loadFromStorage<TrainingLog[]>(STORAGE_KEY_LOGS, []),
  monthStartTime: loadFromStorage<number>(STORAGE_KEY_MONTH_START, Date.now()),

  getProgressionCount: (exerciseName: string, _liftType: LiftType) => {
    const { logs, monthStartTime } = get()
    return logs.filter(
      (l) => l.exerciseName === exerciseName && l.date >= monthStartTime
    ).length
  },

  setLiftData: (data: LiftData) => {
    const now = Date.now()
    set({
      liftData: data,
      hasSetLifts: data.bench > 0 && data.squat > 0 && data.deadlift > 0,
      monthStartTime: now
    })
    saveToStorage(STORAGE_KEY_LIFTS, data)
    saveToStorage(STORAGE_KEY_MONTH_START, now)
  },

  setLiftDataByWorkingWeight: (
    benchW: number, benchR: number,
    squatW: number, squatR: number,
    deadliftW: number, deadliftR: number
  ) => {
    const data: LiftData = {
      bench: estimate1RM(benchW, benchR),
      squat: estimate1RM(squatW, squatR),
      deadlift: estimate1RM(deadliftW, deadliftR)
    }
    const now = Date.now()
    set({
      liftData: data,
      hasSetLifts: data.bench > 0 && data.squat > 0 && data.deadlift > 0,
      monthStartTime: now
    })
    saveToStorage(STORAGE_KEY_LIFTS, data)
    saveToStorage(STORAGE_KEY_MONTH_START, now)
  },

  addLog: (log) => {
    const fullLog: TrainingLog = { ...log, date: Date.now() }
    const updated = [...get().logs, fullLog]
    set({ logs: updated })
    saveToStorage(STORAGE_KEY_LOGS, updated)
  },

  reset: () => {
    set({
      liftData: DEFAULT_LIFT_DATA,
      hasSetLifts: false,
      logs: [],
      monthStartTime: Date.now()
    })
    try {
      localStorage.removeItem(STORAGE_KEY_LIFTS)
      localStorage.removeItem(STORAGE_KEY_LOGS)
      localStorage.removeItem(STORAGE_KEY_MONTH_START)
    } catch {
      /* ignore */
    }
  }
}))
