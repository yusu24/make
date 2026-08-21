/* eslint-disable react-refresh/only-export-components */
import { Route } from 'react-router-dom';
import { CategoryRoute, ProtectedRoute } from './guards';
import JasaApp from '../apps/jasa/repo/App';

const jasaRoutes = (
  <Route path="/jasa/*" element={<ProtectedRoute><CategoryRoute allowedCategory="Jasa"><JasaApp /></CategoryRoute></ProtectedRoute>} />
);

export default jasaRoutes;
