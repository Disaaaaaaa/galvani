import { Routes, Route } from 'react-router-dom'
import Navigation from './components/ui/Navigation'
import HomePage from './pages/HomePage'
import ElectricityPage from './pages/ElectricityPage'
import ElectronPage from './pages/ElectronPage'
import BatteryPage from './pages/BatteryPage'
import HistoryPage from './pages/HistoryPage'
import ZnCuPage from './pages/ZnCuPage'
import CellBuilderPage from './pages/CellBuilderPage'
import JourneyPage from './pages/JourneyPage'
import SaltBridgePage from './pages/SaltBridgePage'
import VirtualLabPage from './pages/VirtualLabPage'
import CarBatteryPage from './pages/CarBatteryPage'
import TasksPage from './pages/TasksPage'
import SummaryPage from './pages/SummaryPage'
import { useApp } from './store/useApp'

export default function App() {
  const reduced = useApp((s) => s.settings.reducedMotion)

  return (
    <div className={`app-root ${reduced ? 'reduce-motion' : ''}`}>
      <Navigation />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/electricity" element={<ElectricityPage />} />
          <Route path="/electron" element={<ElectronPage />} />
          <Route path="/battery" element={<BatteryPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/zn-cu" element={<ZnCuPage />} />
          <Route path="/builder" element={<CellBuilderPage />} />
          <Route path="/journey" element={<JourneyPage />} />
          <Route path="/salt-bridge" element={<SaltBridgePage />} />
          <Route path="/lab" element={<VirtualLabPage />} />
          <Route path="/car-battery" element={<CarBatteryPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/summary" element={<SummaryPage />} />
        </Routes>
      </main>
    </div>
  )
}
