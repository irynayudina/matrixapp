import type { Cell, Matrix } from '../types/cell'

const THREE_DIGIT_MIN = 100
const THREE_DIGIT_MAX = 999

export const createRandomAmount = () =>
  Math.floor(Math.random() * (THREE_DIGIT_MAX - THREE_DIGIT_MIN + 1)) + THREE_DIGIT_MIN

export const createRandomCell = (nextId: () => number): Cell => ({
  id: nextId(),
  amount: createRandomAmount(),
})

export const createRandomMatrix = (rows: number, cols: number, nextId: () => number): Matrix =>
  Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => createRandomCell(nextId)),
  )

export const updateCellAmount = (matrix: Matrix, cellId: number, delta: number): Matrix =>
  matrix.map((row) =>
    row.map((cell) => (cell.id === cellId ? { ...cell, amount: cell.amount + delta } : cell)),
  )

export const removeMatrixRow = (matrix: Matrix, rowIndex: number): Matrix =>
  matrix.filter((_, index) => index !== rowIndex)

export const appendMatrixRow = (
  matrix: Matrix,
  cols: number,
  nextId: () => number,
): Matrix => [...matrix, Array.from({ length: cols }, () => createRandomCell(nextId))]

export const flattenMatrix = (matrix: Matrix) => matrix.flat()

export const calculateRowSums = (matrix: Matrix) =>
  matrix.map((row) => row.reduce((sum, cell) => sum + cell.amount, 0))

export const calculateColumnValues = (matrix: Matrix) => {
  if (matrix.length === 0) {
    return []
  }

  const cols = matrix[0].length
  return Array.from({ length: cols }, (_, colIndex) => matrix.map((row) => row[colIndex].amount))
}

const percentileIndex = (values: number[], percentile: number) => {
  if (values.length === 0) return undefined
  const rank = percentile * (values.length - 1)
  const lower = Math.floor(rank)
  const upper = Math.ceil(rank)

  if (lower === upper) {
    return values[lower]
  }

  const weight = rank - lower
  return values[lower] + (values[upper] - values[lower]) * weight
}

export const calculateColumnPercentile = (matrix: Matrix, percentile = 0.6) => {
  const columnValues = calculateColumnValues(matrix).map((values) => {
    const sorted = [...values].sort((a, b) => a - b)
    const result = percentileIndex(sorted, percentile)
    return result ?? 0
  })

  return columnValues
}

export const calculateNearestCells = (matrix: Matrix, cellId: number, count: number) => {
  if (count <= 0) return new Set<number>()

  const flattened = flattenMatrix(matrix)
  const target = flattened.find((cell) => cell.id === cellId)
  if (!target) return new Set<number>()

  const sortedByDistance = flattened
    .map((cell) => ({
      cell,
      distance: Math.abs(cell.amount - target.amount),
    }))
    .sort((a, b) => {
      if (a.distance === b.distance) {
        return a.cell.id - b.cell.id
      }
      return a.distance - b.distance
    })
    .slice(0, Math.min(count, flattened.length))

  return new Set(sortedByDistance.map((item) => item.cell.id))
}

export const calculateRowPercentages = (matrix: Matrix, rowIndex: number) => {
  const row = matrix[rowIndex]
  if (!row) return []

  const total = row.reduce((sum, cell) => sum + cell.amount, 0)
  const max = row.reduce((acc, cell) => Math.max(acc, cell.amount), 0)

  return row.map((cell) => ({
    cellId: cell.id,
    percentOfTotal: total === 0 ? 0 : (cell.amount / total) * 100,
    percentOfMax: max === 0 ? 0 : (cell.amount / max) * 100,
  }))
}

export const clampNearestCount = (count: number, matrix: Matrix) => {
  const max = flattenMatrix(matrix).length
  if (max === 0) return 0
  return Math.max(0, Math.min(count, max))
}

