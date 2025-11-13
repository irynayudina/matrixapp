import './App.css'
import { MatrixControls } from './components/MatrixControls'
import { MatrixTable } from './components/MatrixTable'

export const App = () => {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Matrix Explorer</h1>
        <p>
          Generate an M × N matrix of three-digit values, explore row summaries, and surface the
          nearest cells by value.
        </p>
      </header>
      <main className="app-main">
        <MatrixControls />
        <MatrixTable />
      </main>
    </div>
  )
}

export default App
