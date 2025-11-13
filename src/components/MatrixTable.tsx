import { useMemo, useState } from 'react'
import { useMatrixContext } from '../context/MatrixContext'
import {
  calculateColumnPercentile,
  calculateNearestCells,
  calculateRowPercentages,
  calculateRowSums,
} from '../utils/matrix'
import './MatrixTable.css'

export const MatrixTable = () => {
  const {
    matrix,
    dimensions,
    nearestCount,
    incrementCell,
    removeRow,
    addRow,
  } = useMatrixContext()

  const [hoveredCellId, setHoveredCellId] = useState<number | null>(null)
  const [hoveredRowForPercent, setHoveredRowForPercent] = useState<number | null>(null)

  const rowSums = useMemo(() => calculateRowSums(matrix), [matrix])
  const columnPercentiles = useMemo(() => calculateColumnPercentile(matrix, 0.6), [matrix])

  const highlightedCells = useMemo(() => {
    if (hoveredCellId === null) return new Set<number>()
    return calculateNearestCells(matrix, hoveredCellId, nearestCount)
  }, [matrix, hoveredCellId, nearestCount])

  type PercentInfo = { percentOfTotal: number; percentOfMax: number }
  const percentLookup = useMemo<Map<number, PercentInfo>>(() => {
    if (hoveredRowForPercent === null) {
      return new Map()
    }

    const entries = calculateRowPercentages(matrix, hoveredRowForPercent).map(
      (info): [number, PercentInfo] => [
        info.cellId,
        {
          percentOfTotal: info.percentOfTotal,
          percentOfMax: info.percentOfMax,
        },
      ],
    )

    return new Map<number, PercentInfo>(entries)
  }, [matrix, hoveredRowForPercent])

  const handleCellEnter = (cellId: number) => {
    setHoveredCellId(cellId)
  }

  const handleCellLeave = () => {
    setHoveredCellId(null)
  }

  const handleSumEnter = (rowIndex: number) => {
    setHoveredRowForPercent(rowIndex);
    console.log('hoveredRowForPercent', hoveredRowForPercent);
  }

  const handleRowLeave = () => {
    setHoveredRowForPercent(null)
  }

  if (matrix.length === 0 || matrix[0]?.length === 0) {
    return (
      <div className="empty-state">
        <p>No data to display. Adjust the dimensions above to generate a matrix.</p>
        <button type="button" onClick={addRow} disabled={dimensions.cols === 0}>
          Add initial row
        </button>
      </div>
    )
  }

  return (
    <div className="table-wrapper">
      <div className="table-header">
        <h2>
          Matrix {dimensions.rows} × {dimensions.cols}
        </h2>
        <div className="table-actions">
          <span>Total cells: {dimensions.rows * dimensions.cols}</span>
          <button
            type="button"
            onClick={addRow}
            disabled={dimensions.rows >= 100 || dimensions.cols === 0}
          >
            Add row
          </button>
        </div>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th scope="col" className="corner-head">
              Row
            </th>
            {matrix[0].map((_, columnIndex) => (
              <th scope="col" key={`head-${columnIndex}`}>
                Col {columnIndex + 1}
              </th>
            ))}
            <th scope="col" className="sum-head">
              Row sum
            </th>
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, rowIndex) => (
            <tr key={`row-${rowIndex}`} onMouseLeave={handleRowLeave}>
              <th scope="row" className="row-head">
                <span>Row {rowIndex + 1}</span>
                <button type="button" onClick={() => removeRow(rowIndex)} aria-label={`Remove row ${rowIndex + 1}`}>
                  ×
                </button>
              </th>
              {row.map((cell) => {
                const isHighlighted = highlightedCells.has(cell.id)
                const percentInfo = percentLookup.get(cell.id)
                const isPercentView = percentInfo !== undefined
                const displayValue = percentInfo
                  ? `${percentInfo.percentOfTotal.toFixed(1)}%`
                  : cell.amount.toLocaleString()

                const style = percentInfo
                  ? {
                      background: `linear-gradient(90deg, rgba(56, 189, 248, 0.25) ${percentInfo.percentOfMax}%, transparent ${percentInfo.percentOfMax}%)`,
                    }
                  : undefined

                return (
                  <td
                    key={cell.id}
                    className={[
                      'matrix-cell',
                      isHighlighted ? 'matrix-cell--highlighted' : '',
                      isPercentView ? 'matrix-cell--percent' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    style={style}
                    onClick={() => incrementCell(cell.id)}
                    onMouseEnter={() => handleCellEnter(cell.id)}
                    onMouseLeave={handleCellLeave}
                  >
                    {displayValue}
                  </td>
                )
              })}
              <td className="sum-cell" onMouseEnter={() => handleSumEnter(rowIndex)}>
                {rowSums[rowIndex].toLocaleString()}
              </td>
            </tr>
          ))}
          <tr className="percentile-row">
            <th scope="row">60th percentile</th>
            {columnPercentiles.map((value, index) => (
              <td key={`percentile-${index}`}>{value.toFixed(1)}</td>
            ))}
            <td className="sum-cell muted">—</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

