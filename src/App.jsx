import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import Login from './pages/Login';
import Form from './pages/Form';
import Completion from './pages/Completion';
import ReviewList from './pages/ReviewList';
import ReviewDetail from './pages/ReviewDetail';

function App() {
  return (
    <Router>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reviews" element={<ReviewList />} />
        <Route path="/reviews/:id" element={<ReviewDetail />} />
        <Route path="/form" element={<Form />} />
        <Route path="/completion" element={<Completion />} />
      </Routes>
    </Router>
  );
}

export default App;
