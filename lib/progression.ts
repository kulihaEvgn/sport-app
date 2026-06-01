import type { SetLog, TargetVolume } from '@/types'

export function shouldSuggestProgression(
  sessions: SetLog[][],
  targetVolume: TargetVolume,
): boolean {
  if (sessions.length < 3) return false
  if (targetVolume.type !== 'reps' || !targetVolume.max) return false

  const maxWeights = sessions.map(s => Math.max(...s.map(set => set.weight)))
  const allSameWeight = maxWeights[0] > 0 && maxWeights.every(w => w === maxWeights[0])
  if (!allSameWeight) return false

  const lastSession = sessions[0]
  const avgReps = lastSession.reduce((acc, s) => acc + s.reps, 0) / lastSession.length
  return avgReps >= targetVolume.max
}
