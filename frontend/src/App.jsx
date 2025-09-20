import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import FuelPage from './pages/FuelPage'
import CarsPage from './pages/CarsPage'
import ChartsPage from './pages/ChartsPage'; 
import ServicePage from './pages/ServicePage';
import DrivingDataPage from './pages/DrivingDataPage';
import Navbar from './components/Navbar'

function App() {
  return (
    <div className="app">
      <Navbar />
      <div className="content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cars" element={<CarsPage />} />
          <Route path="/fuel" element={<FuelPage />} />
	  <Route path="/drivingdata" element={<DrivingDataPage />} />
          <Route path="/services" element={<ServicePage />} />
          <Route path="/charts" element={<ChartsPage />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
