import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ChurchSettingsProvider } from './context/ChurchSettingsContext';
import Nav from './components/Nav';
import Home from './pages/Home';
import PlanAVisit from './pages/PlanAVisit';
import Watch from './pages/Watch';
import Connect from './pages/Connect';
import Ministries from './pages/Ministries';
import Events from './pages/Events';
import Give from './pages/Give';
import About from './pages/About';
import Today from './pages/Today';

export default function App() {
  return (
    <ChurchSettingsProvider>
      <BrowserRouter>
        <Nav />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/plan-a-visit" element={<PlanAVisit />} />
          <Route path="/watch" element={<Watch />} />
          <Route path="/connect" element={<Connect />} />
          <Route path="/ministries" element={<Ministries />} />
          <Route path="/events" element={<Events />} />
          <Route path="/give" element={<Give />} />
          <Route path="/about" element={<About />} />
          <Route path="/today" element={<Today />} />
        </Routes>
      </BrowserRouter>
    </ChurchSettingsProvider>
  );
}