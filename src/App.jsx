import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header.jsx';
import Home from './pages/Home.jsx';
import LessonView from './components/LessonView.jsx';
import FormulaSheet from './components/FormulaSheet.jsx';
import SolverDemo from './components/SolverDemo.jsx';

export default function App() {
  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/learn" element={<LessonView />} />
          <Route path="/formulas" element={<FormulaSheet />} />
          <Route path="/solver" element={<SolverDemo />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="app-footer">
        <span>Rubik's Cube Mastery · 魔方入门到精通</span>
      </footer>
    </div>
  );
}
