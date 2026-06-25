import { RecipeBookProvider } from "./context/RecipeBookContext";
import { AppRoutes } from "./routes/AppRoutes";
import "./App.css";

function App() {
  return (
    <RecipeBookProvider>
      <AppRoutes />
    </RecipeBookProvider>
  );
}

export default App;
