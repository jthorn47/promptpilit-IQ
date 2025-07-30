import { POPSidebar } from "./POPSidebar";
import { Outlet } from "react-router-dom";

export function POPLayout() {
  return (
    <div className="flex h-screen bg-background">
      <POPSidebar className="w-64 flex-shrink-0" />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}