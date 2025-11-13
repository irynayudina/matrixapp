import {type FormEvent, useEffect, useState } from 'react'
import { useMatrixContext } from '../context/MatrixContext'
import './MatrixControls.css'

const clampInput = (value: string) => {
  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? 0 : parsed
}

export const MatrixControls = () => {
  const {
    dimensions,
    setDimensions,
    regenerate,
    nearestCount,
    setNearestCount,
  } = useMatrixContext()

  const [rowsInput, setRowsInput] = useState(dimensions.rows.toString())
  const [colsInput, setColsInput] = useState(dimensions.cols.toString())
  const [nearestInput, setNearestInput] = useState(nearestCount.toString())

  useEffect(() => {
    setRowsInput(dimensions.rows.toString())
  }, [dimensions.rows])

  useEffect(() => {
    setColsInput(dimensions.cols.toString())
  }, [dimensions.cols])

  useEffect(() => {
    setNearestInput(nearestCount.toString())
  }, [nearestCount])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setDimensions({
      rows: clampInput(rowsInput),
      cols: clampInput(colsInput),
    })
    setNearestCount(clampInput(nearestInput))
  }

  return (
    <form className="controls" onSubmit={handleSubmit}>
      <div className="control-group">
        <label htmlFor="rows">Rows (M)</label>
        <input
          id="rows"
          type="number"
          min={0}
          max={100}
          value={rowsInput}
          onChange={(event) => setRowsInput(event.target.value)}
        />
      </div>
      <div className="control-group">
        <label htmlFor="cols">Columns (N)</label>
        <input
          id="cols"
          type="number"
          min={0}
          max={100}
          value={colsInput}
          onChange={(event) => setColsInput(event.target.value)}
        />
      </div>
      <div className="control-group">
        <label htmlFor="nearest">Nearest cells (X)</label>
        <input
          id="nearest"
          type="number"
          min={0}
          max={Math.max(0, dimensions.rows * dimensions.cols)}
          value={nearestInput}
          onChange={(event) => setNearestInput(event.target.value)}
        />
      </div>
      <div className="controls-actions">
        <button type="submit">Apply</button>
        <button type="button" onClick={regenerate}>
          Regenerate values
        </button>
      </div>
    </form>
  )
}

