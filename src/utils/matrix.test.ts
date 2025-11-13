import { describe, expect, it } from 'vitest'
import type { Matrix } from '../types/cell'
import {
  calculateColumnPercentile,
  calculateNearestCells,
  calculateRowPercentages,
  calculateRowSums,
  clampNearestCount,
} from './matrix'

const buildMatrix = (values: number[][]): Matrix =>
  values.map((row, rowIndex) =>
    row.map((amount, colIndex) => ({
      id: rowIndex * 100 + colIndex + 1,
      amount,
    })),
  )

describe('matrix utilities', () => {
  const matrix = buildMatrix([
    [100, 200, 300],
    [150, 250, 350],
    [120, 220, 320],
  ])

  it('calculates row sums', () => {
    expect(calculateRowSums(matrix)).toEqual([600, 750, 660])
  })

  it('computes 60th percentile per column', () => {
    const percentiles = calculateColumnPercentile(matrix, 0.6)
    expect(percentiles.map((value) => Number(value.toFixed(2)))).toEqual([126, 226, 326])
  })

  it('finds nearest cells by amount', () => {
    const highlighted = calculateNearestCells(matrix, matrix[0][0].id, 4)
    expect(highlighted.size).toBe(4)
    expect(highlighted.has(matrix[0][0].id)).toBe(true)
  })

  it('returns percentages for hovered row', () => {
    const percentages = calculateRowPercentages(matrix, 1)
    expect(percentages).toHaveLength(3)
    expect(Number(percentages[0].percentOfTotal.toFixed(1))).toBeCloseTo(20.0, 1)
    expect(Number(percentages[2].percentOfMax.toFixed(1))).toBeCloseTo(100.0, 1)
  })

  it('clamps nearest count to matrix size', () => {
    expect(clampNearestCount(100, matrix)).toBe(matrix.length * matrix[0].length)
    expect(clampNearestCount(-5, matrix)).toBe(0)
  })
})

