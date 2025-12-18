import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MeterProvider } from './context/MeterContext';
import { AppLayout } from './components/Layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { MeterDistribution } from './pages/MeterDistribution';
import { DailyInstallation } from './pages/DailyInstallation';
import { BalanceCount } from './pages/BalanceCount';
import { MeterTracking } from './pages/MeterTracking';
import './index.css';

function App() {
  return (
    <MeterProvider>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/meter-distribution" element={<MeterDistribution />} />
            <Route path="/daily-installation" element={<DailyInstallation />} />
            <Route path="/balance-count" element={<BalanceCount />} />
            <Route path="/meter-tracking" element={<MeterTracking />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </MeterProvider>
  );
}

export default App;
