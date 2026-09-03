import api from "./services/api";
import AppRoutes from "./routes/AppRoutes.jsx";

function App() {
  console.log("API Base URL:", api.defaults.baseURL);
  return <AppRoutes />;
}

export default App;