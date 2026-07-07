import { RouterProvider } from 'react-router-dom';
import router from './router.jsx';
import OfflineBanner from './components/OfflineBanner.jsx';
import './styles/index.css';

const App = () => {
  return (
    <>
      <OfflineBanner />
      <RouterProvider router={router} />
    </>
  );
};

export default App;
