import { Navigate, useLocation } from 'react-router-dom';

/** Legacy route — canonical player is `CourseModule`. */
export default function CourseDetail() {
  const location = useLocation();
  return <Navigate to={`/CourseModule${location.search}`} replace />;
}
