import { useEffect, useState } from "react";
import Welcome from "./components_3D/welcome";
import Nav from "./components_2D/Navigation";
import GridOverlay from "./components_2D/GridOverlay";
import About from "./components_2D/About";
import Gacha from "./components_3D/gacha";

function App() {
  const [isWelcome, setIsWelcome] = useState(true);
  const [view, setView] = useState("home"); // "home" | "gacha"

  useEffect(() => {
    const timer = setTimeout(() => setIsWelcome(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-screen min-h-screen overflow-y-auto">
      <GridOverlay />
      {isWelcome ? (
        <Welcome text="hi, my name is natalie!" />
      ) : (
        <div className="relative z-10">
          <div className="flex flex-row justify-between items-center p-24">
            {view === "home" && (
                <div className="space-y-6">
                  <p className="text-[#0e4749] font-bold text-7xl">
                    nat's gacha machine!{" "}
                  </p>
                  <p className="font-semibold text-2xl">
                    full-stack • machine learning • agentic systems
                  </p>
                </div>
              )}
            {view == "about" && <About />}
            {(view === "home" || view === "gacha") && (
                  <div className="flex flex-col items-center justify-center">
                    <Gacha
                      isFullSize={view === "gacha"}
                      onToggleFullSize={(val) =>
                        setView(val ? "gacha" : "home")
                      }
                    />
                  </div>
                )}
          </div>
          <Nav
            isFullSize={view === "gacha"}
            onHome={() => setView("home")}
            onGacha={() => setView("gacha")}
            onAbout={() => setView("about")}
          />
        </div>
      )}
    </div>
  );
}

export default App;
