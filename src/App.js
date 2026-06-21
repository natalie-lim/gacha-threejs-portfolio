import { useEffect, useState } from "react";
import Gotcha from "./components_3D/gacha";
import Welcome from "./components_3D/welcome";
import Nav from "./components_2D/Navigation";
import GridOverlay from "./components_2D/GridOverlay";

function App() {
  const [visible, setVisible] = useState(true);
  const [isFullSize, setIsFullSize] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-screen min-h-screen overflow-y-auto">
      <GridOverlay />
      {visible ? (
        <Welcome text="hi, my name is natalie!" />
      ) : (
        <div className="relative z-10">
          <div className="flex flex-row justify-between items-center p-24">
            {!isFullSize && (
              <div className="space-y-6">
                <p className="text-[#0e4749] font-bold text-7xl">
                  nat's gacha machine!{" "}
                </p>
                <p className="font-semibold text-2xl">
                  full-stack • machine learning • agentic systems
                </p>
              </div>
            )}
            <div className="flex flex-col items-center justify-center">
              <Gotcha isFullSize={isFullSize} onToggleFullSize={setIsFullSize} />
            </div>
          </div>
          <Nav />
        </div>
      )}
    </div>
  );
}

export default App;
