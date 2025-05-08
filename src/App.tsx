
import { useRoutes } from "react-router-dom";
import { routes } from "./routes";
import AppProviders from "./components/AppProviders";
import OfflineAlert from "./components/OfflineAlert";

const AppRoutes = () => {
  const routeElements = useRoutes(routes);
  return (
    <>
      <OfflineAlert />
      {routeElements}
    </>
  );
};

const App = () => (
  <AppProviders>
    <AppRoutes />
  </AppProviders>
);

export default App;
