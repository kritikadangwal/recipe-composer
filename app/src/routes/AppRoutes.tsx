import { Routes, Route } from "react-router-dom";
import { HomePage } from "../pages/HomePage";
import { RecipePage } from "../components/RecipePage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/recipe/:id" element={<RecipePage />} />
    </Routes>
  );
}
