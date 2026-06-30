import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import PersistentSOSButton from "./PersistentSOSButton";

export default function CitizenLayout() {
  return (
    <div className="min-h-screen bg-bg-base flex flex-col">
      <main className="flex-1 pb-20 md:pb-6">
        <Outlet />
      </main>
      <PersistentSOSButton />
      <BottomNav />
    </div>
  );
}
