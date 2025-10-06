import { Outlet } from "react-router-dom";
import { DonorNavbar } from "./DonorNavbar";

export const DonorLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <DonorNavbar />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
};
