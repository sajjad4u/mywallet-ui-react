import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { AccountPage } from './pages/Account';
import { CategoryPage } from './pages/Category';
import { PersonPage } from './pages/Person';
import { TransactionPage } from './pages/Transaction';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/category" element={<CategoryPage />} />
          <Route path="/person" element={<PersonPage />} />
          <Route path="/transaction" element={<TransactionPage />} />
          <Route path="/" element={<Navigate to="/home" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
