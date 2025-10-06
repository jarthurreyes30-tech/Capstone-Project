import { Outlet } from "react-router-dom";
import { CharityNavbar } from "./CharityNavbar";

export const CharityLayout = () => {
  return (
    <div className="min-h-screen bg-muted/10">
      <CharityNavbar />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
};
