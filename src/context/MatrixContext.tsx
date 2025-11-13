import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { CellId, Matrix, MatrixDimensions } from '../types/cell'
import {
  appendMatrixRow,
  clampNearestCount,
  createRandomMatrix,
  removeMatrixRow,
  updateCellAmount,
} from '../utils/matrix'

type MatrixContextValue = {
  dimensions: MatrixDimensions
  matrix: Matrix
  nearestCount: number
  setDimensions: (dimensions: MatrixDimensions) => void
  setNearestCount: (count: number) => void
  regenerate: () => void
  incrementCell: (cellId: CellId) => void
  addRow: () => void
  removeRow: (rowIndex: number) => void
}

const MatrixContext = createContext<MatrixContextValue | undefined>(undefined)

const DEFAULT_DIMENSIONS: MatrixDimensions = {
  rows: 5,
  cols: 5,
}

const useNextId = () => {
  const counterRef = useRef(1)
  return useCallback(() => counterRef.current++, [])
}

export const MatrixProvider = ({ children }: { children: ReactNode }) => {
  const getNextId = useNextId()

  const initialMatrix = useMemo(
    () => createRandomMatrix(DEFAULT_DIMENSIONS.rows, DEFAULT_DIMENSIONS.cols, getNextId),
    [getNextId],
  )
  const matrixRef = useRef<Matrix>(initialMatrix)
  const [dimensions, setDimensionsState] = useState(DEFAULT_DIMENSIONS)
  const [matrix, setMatrix] = useState<Matrix>(initialMatrix)
  const [nearestCount, setNearestCountState] = useState(() =>
    clampNearestCount(5, initialMatrix),
  )

  const updateMatrix = useCallback(
    (next: Matrix | ((current: Matrix) => Matrix)) => {
      setMatrix((current) => {
        const resolved =
          typeof next === 'function' ? (next as (value: Matrix) => Matrix)(current) : next
        matrixRef.current = resolved
        return resolved
      })
    },
    [],
  )

  const regenerate = useCallback(() => {
    const { rows, cols } = dimensions
    if (rows <= 0 || cols <= 0) {
      updateMatrix([])
      setNearestCountState(0)
      return
    }
    const newMatrix = createRandomMatrix(rows, cols, getNextId)
    updateMatrix(newMatrix)
    setNearestCountState((current) => clampNearestCount(current, newMatrix))
  }, [dimensions, getNextId, updateMatrix])

  const setDimensions = useCallback(
    (updated: MatrixDimensions) => {
      const sanitized = {
        rows: Math.max(0, Math.min(Math.round(updated.rows), 100)),
        cols: Math.max(0, Math.min(Math.round(updated.cols), 100)),
      }

      if (sanitized.rows <= 0 || sanitized.cols <= 0) {
        setDimensionsState(sanitized)
        updateMatrix([])
        setNearestCountState(0)
        return
      }

      if (sanitized.rows === dimensions.rows && sanitized.cols === dimensions.cols) {
        setDimensionsState(sanitized)
        return
      }

      setDimensionsState(sanitized)

      const newMatrix = createRandomMatrix(sanitized.rows, sanitized.cols, getNextId)
      updateMatrix(newMatrix)
      setNearestCountState((current) => clampNearestCount(current, newMatrix))
    },
    [dimensions, getNextId, updateMatrix],
  )

  const incrementCell = useCallback(
    (cellId: CellId) => {
      updateMatrix((current) => updateCellAmount(current, cellId, 1))
    },
    [updateMatrix],
  )

  const addRow = useCallback(() => {
    if (dimensions.cols <= 0 || dimensions.rows >= 100) {
      return
    }

    setDimensionsState((prev) => ({ ...prev, rows: prev.rows + 1 }))

    updateMatrix((current) => {
      const updated = appendMatrixRow(current, dimensions.cols, getNextId)
      setNearestCountState((count) => clampNearestCount(count, updated))
      return updated
    })
  }, [dimensions.cols, dimensions.rows, getNextId, updateMatrix])

  const removeRow = useCallback(
    (rowIndex: number) => {
      updateMatrix((current) => {
        const updated = removeMatrixRow(current, rowIndex)
        setNearestCountState((count) => clampNearestCount(count, updated))
        return updated
      })
      setDimensionsState((prev) => ({
        ...prev,
        rows: Math.max(0, prev.rows - 1),
      }))
    },
    [updateMatrix],
  )

  const setNearestCount = useCallback((count: number) => {
    setNearestCountState(() => clampNearestCount(Math.round(count), matrixRef.current))
  }, [])

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const value = useMemo(
    () => ({
      dimensions,
      matrix,
      nearestCount,
      setDimensions,
      setNearestCount,
      regenerate,
      incrementCell,
      addRow,
      removeRow,
    }),
    [
      addRow,
      dimensions,
      incrementCell,
      matrix,
      nearestCount,
      regenerate,
      removeRow,
      setDimensions,
      setNearestCount,
    ],
  )

  return <MatrixContext.Provider value={value}>{children}</MatrixContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useMatrixContext = () => {
  const context = useContext(MatrixContext)
  if (!context) {
    throw new Error('useMatrixContext must be used within MatrixProvider')
  }
  return context
}

