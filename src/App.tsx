import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import UploadPage from './pages/UploadPage';
import DetailPage from './pages/DetailPage';
import EditPage from './pages/EditPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/food/:id" element={<DetailPage />} />
        <Route path="/food/:id/edit" element={<EditPage />} />
      </Route>
    </Routes>
  );
}
