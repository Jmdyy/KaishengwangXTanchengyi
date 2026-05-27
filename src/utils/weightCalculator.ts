/**
 * 训练重量计算工具
 * @author yy
 */

/** 三大项类型 */
export type LiftType = 'bench' | 'squat' | 'deadlift'

/** 重量单位 */
export type WeightUnit = 'barbell' | 'dumbbell' | 'cable'

/** 用户三大项数据 */
export interface LiftData {
  /** 杠铃卧推 1RM (kg) */
  bench: number
  /** 深蹲 1RM (kg) */
  squat: number
  /** 传统硬拉 1RM (kg) */
  deadlift: number
}

/** 1RM 推算方式 */
export type InputMethod = 'oneRM' | 'workingWeight'

/** 用户原始输入 */
export interface LiftInput {
  /** 推算方式 */
  method: InputMethod
  /** 卧推相关 */
  benchWeight: number
  benchReps: number
  /** 深蹲相关 */
  squatWeight: number
  squatReps: number
  /** 硬拉相关 */
  deadliftWeight: number
  deadliftReps: number
}

/** 单次训练记录 */
export interface TrainingLog {
  /** 时间戳 */
  date: number
  /** 训练日 */
  day: number
  /** 动作名称 */
  exerciseName: string
  /** 使用的重量 (kg，哑铃为单手) */
  weight: number
  /** 完成的组数×次数 */
  setsReps: string
  /** 自评 RPE */
  feltRpe: number
}

/** 月度递进：每个月的训练次数上限 */
export const MONTHLY_SESSIONS = 8

/** 月度递进方案中的单次训练 */
export interface MonthlyProgressionItem {
  /** 第几次训练（1-based） */
  session: number
  /** 第几周（1-4） */
  week: number
  /** 每只手重量 (kg) */
  weight: number
  /** 是否已训练完成 */
  completed: boolean
}

/** 月度递进方案 */
export interface MonthlyProgression {
  /** 基础重量（session=0 时的重量） */
  baseWeight: number
  /** 递进步长 */
  increment: number
  /** 单位 */
  unit: WeightUnit
  /** 递进类型 */
  progressionType: ProgressionType
  /** 分周的计划 */
  weeks: {
    week: number
    sessions: MonthlyProgressionItem[]
  }[]
}

/** RPE 8 对应的 1RM 百分比对照表 */
const RPE8_PERCENTAGES: Record<number, number> = {
  15: 0.65,
  12: 0.70,
  10: 0.75,
  8: 0.80,
  6: 0.85,
  5: 0.88,
  3: 0.92
}

/** 年度递进类型 */
export type ProgressionType = 'linear' | 'semi' | 'fixed'

/** 动作与三大项的映射关系 */
export interface ExerciseWeightMapping {
  /** 动作名称 */
  exerciseName: string
  /** 关联的三大项 */
  liftType: LiftType
  /** 1RM 转换系数 */
  coefficient: number
  /** 重量单位 */
  unit: WeightUnit
  /** 递进类型 */
  progressionType: ProgressionType
}

/**
 * 所有动作的重量映射表
 * 系数说明：
 * - barbell 动作：系数 = 该动作重量 ≈ 三大项1RM × 系数（双侧总重）
 * - dumbbell 动作：系数 = 单手哑铃重量 ≈ 三大项1RM × 系数（已内置 ~0.5× 单手/双侧换算）
 * - cable 动作：系数 = 钢线重量 ≈ 三大项1RM × 系数
 *
 * 递进策略：
 * - linear：主线推进，RPE 8，每次+2.5kg 线性递进
 * - semi：辅项，先建立动作熟练度，熟练后再逐步加重
 * - fixed：单关节/小肌群，固定重量做到力竭，不线性递增
 */
export const EXERCISE_WEIGHT_MAP: ExerciseWeightMapping[] = [
  { exerciseName: '杠铃卧推', liftType: 'bench', coefficient: 1.0, unit: 'barbell', progressionType: 'linear' },
  { exerciseName: '哑铃上斜卧推', liftType: 'bench', coefficient: 0.38, unit: 'dumbbell', progressionType: 'semi' },
  { exerciseName: '双杠臂屈伸', liftType: 'bench', coefficient: 0.85, unit: 'barbell', progressionType: 'semi' },
  { exerciseName: '仰卧臂屈伸（肩屈位）', liftType: 'bench', coefficient: 0.18, unit: 'dumbbell', progressionType: 'fixed' },
  { exerciseName: 'Y字侧平举', liftType: 'bench', coefficient: 0.06, unit: 'dumbbell', progressionType: 'fixed' },
  { exerciseName: '对握下拉', liftType: 'deadlift', coefficient: 0.65, unit: 'cable', progressionType: 'linear' },
  { exerciseName: '单手钢线下拉', liftType: 'deadlift', coefficient: 0.40, unit: 'cable', progressionType: 'semi' },
  { exerciseName: '单手器械划船', liftType: 'deadlift', coefficient: 0.55, unit: 'cable', progressionType: 'semi' },
  { exerciseName: '坐姿开肘划船', liftType: 'deadlift', coefficient: 0.40, unit: 'cable', progressionType: 'semi' },
  { exerciseName: '钢线弯举（肩屈位）', liftType: 'deadlift', coefficient: 0.08, unit: 'dumbbell', progressionType: 'fixed' },
  { exerciseName: '颈前深蹲', liftType: 'squat', coefficient: 0.82, unit: 'barbell', progressionType: 'linear' },
  { exerciseName: '罗马尼亚硬拉', liftType: 'deadlift', coefficient: 0.78, unit: 'barbell', progressionType: 'linear' },
  { exerciseName: '单腿硬拉', liftType: 'deadlift', coefficient: 0.22, unit: 'dumbbell', progressionType: 'semi' },
  { exerciseName: '保加利亚分腿蹲', liftType: 'squat', coefficient: 0.28, unit: 'dumbbell', progressionType: 'semi' },
  { exerciseName: '山羊挺身', liftType: 'deadlift', coefficient: 0.25, unit: 'barbell', progressionType: 'semi' }
]

/**
 * 通过 Brzycki 公式从工作重量推算 1RM
 * 1RM = weight × 36 / (37 - reps)
 * @param weight 工作重量 (kg)
 * @param reps 完成次数（至力竭）
 * @returns 估算 1RM (kg)
 */
export function estimate1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0
  if (reps >= 37) return weight
  const rm = weight * 36 / (37 - reps)
  return Math.round(rm * 10) / 10
}

/**
 * 根据 1RM 和 reps 计算 RPE 8 下的工作重量
 * @param oneRM 1RM (kg)
 * @param targetReps 目标次数
 * @returns RPE 8 工作重量 (kg)
 */
export function calcRpe8Weight(oneRM: number, targetReps: number): number {
  if (oneRM <= 0) return 0
  const pct = RPE8_PERCENTAGES[targetReps]
  if (pct === undefined) {
    const closestReps = Object.keys(RPE8_PERCENTAGES)
      .map(Number)
      .sort((a, b) => Math.abs(a - targetReps) - Math.abs(b - targetReps))[0]
    const raw = oneRM * RPE8_PERCENTAGES[closestReps]
    return roundToPlate(raw)
  }
  const raw = oneRM * pct
  return roundToPlate(raw)
}

/**
 * 根据三大项数据计算指定动作的 RPE 8 工作重量
 * 计算逻辑：
 *   杠铃动作：重量 = 杠铃1RM × 系数 → RPE 8 百分比
 *   哑铃动作：重量 = 杠铃1RM × 系数 → RPE 8 百分比（系数已内置换算）
 *   钢线动作：重量 = 硬拉1RM × 系数 → RPE 8 百分比
 * @param exerciseName 动作名称
 * @param liftData 用户三大项数据
 * @param targetReps 目标次数
 * @returns 建议工作重量 (kg)，哑铃返回单手重量，杠铃返回总重
 */
export function calcExerciseWeight(
  exerciseName: string,
  liftData: LiftData | null,
  targetReps: number
): number {
  if (!liftData) return 0

  const mapping = EXERCISE_WEIGHT_MAP.find((m) => m.exerciseName === exerciseName)
  if (!mapping) return 0

  const oneRM = liftData[mapping.liftType]
  if (oneRM <= 0) return 0

  const adjustedRM = oneRM * mapping.coefficient
  return calcRpe8Weight(adjustedRM, targetReps)
}

/**
 * 解析动作次数字符串，提取主要目标次数
 * @param repsStr 次数字符串
 * @returns 主目标次数
 */
export function parseTargetReps(repsStr: string): number {
  const match = repsStr.match(/(\d+)/)
  return match ? parseInt(match[1], 10) : 12
}

/**
 * 按 2.5kg 为单位取整（杠铃/哑铃/钢线通用）
 * 健身房实际可用的重量：2.5, 5, 7.5, 10, 12.5, 15 ...
 * @param weight 原始计算重量 (kg)
 * @returns 取整到最近 2.5kg 步长的重量
 */
export function roundToPlate(weight: number): number {
  if (weight <= 0) return 0
  return Math.round(weight / 2.5) * 2.5
}

/**
 * 计算线性递进后的推荐重量
 * @param baseWeight 基础重量 (kg)
 * @param sessionCount 已完成训练次数
 * @param increment 每次递增重量 (kg)
 * @returns 递进后重量 (kg)，取整到 2.5kg 步长
 */
export function calcProgressionWeight(
  baseWeight: number,
  sessionCount: number,
  increment: number
): number {
  return roundToPlate(baseWeight + sessionCount * increment)
}

/** 获取该训练的递进步长（统一 2.5kg/次） */
export function getProgressionIncrement(_liftType: LiftType): number {
  return 2.5
}

/** 获取动作的重量单位文字 */
export function getWeightUnitLabel(unit: WeightUnit): string {
  switch (unit) {
    case 'dumbbell':
      return 'kg / 只'
    case 'cable':
      return 'kg'
    case 'barbell':
      return 'kg'
  }
}

/** 三大项的显示名称 */
export const LIFT_DISPLAY_NAMES: Record<LiftType, string> = {
  bench: '杠铃卧推',
  squat: '深蹲（颈后）',
  deadlift: '传统硬拉'
}

/** 默认三大项数据（未设置） */
export const DEFAULT_LIFT_DATA: LiftData = {
  bench: 0,
  squat: 0,
  deadlift: 0
}

/**
 * 生成月度量量递进方案（8次训练，分4周）
 * @param exerciseName 动作名称
 * @param liftData 用户三大项数据
 * @param targetReps 目标次数
 * @param completedCount 已完成训练次数
 * @returns 月度递进方案，null 表示该动作无映射
 */
export function getMonthlyProgression(
  exerciseName: string,
  liftData: LiftData | null,
  targetReps: number,
  completedCount: number
): MonthlyProgression | null {
  const mapping = EXERCISE_WEIGHT_MAP.find((m) => m.exerciseName === exerciseName)
  if (!mapping || !liftData) return null

  const baseWeight = calcExerciseWeight(exerciseName, liftData, targetReps)
  if (baseWeight <= 0) return null

  const increment = getProgressionIncrement(mapping.liftType)
  const weeks: MonthlyProgression['weeks'] = []

  for (let session = 1; session <= MONTHLY_SESSIONS; session++) {
    const week = Math.ceil(session / 2)
    const weight = calcProgressionWeight(baseWeight, session - 1, increment)
    const completed = session <= completedCount

    let weekGroup = weeks.find((w) => w.week === week)
    if (!weekGroup) {
      weekGroup = { week, sessions: [] }
      weeks.push(weekGroup)
    }
    weekGroup.sessions.push({ session, week, weight, completed })
  }

  return {
    baseWeight,
    increment,
    unit: mapping.unit,
    progressionType: mapping.progressionType,
    weeks
  }
}
