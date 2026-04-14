import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Explore from './pages/Explore';
import Food from './pages/Food';
import Language from './pages/Language';
import Expense from './pages/Expense';

// NOTE: 主路由配置 - 5 個主要頁面 + 全局 Layout

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/food" element={<Food />} />
          <Route path="/language" element={<Language />} />
          <Route path="/expense" element={<Expense />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
