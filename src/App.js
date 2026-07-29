import { useEffect, useState } from "react";
import Welcome from "./components_3D/welcome";
import Nav from "./components_2D/Navigation";
import GridOverlay from "./components_2D/GridOverlay";
import About from "./components_2D/About";
import Gacha from "./components_3D/gacha";
import WorkPage from "./components_2D/WorkPage";

function App() {
  const [isWelcome, setIsWelcome] = useState(true);
  const [view, setView] = useState("home");

  useEffect(() => {
    const timer = setTimeout(() => setIsWelcome(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  // w-full, not w-screen: 100vw includes the scrollbar's width, which is itself
  // enough to make the page scroll sideways once the content is tall.
  return (
    <div className="w-full min-h-screen overflow-x-hidden overflow-y-auto">
      <GridOverlay />
      {isWelcome ? (
        <Welcome text="hi, my name is natalie!" />
      ) : (
        <div className="relative z-10">
          {/* Below md the row becomes a column, so the gacha machine lands
              under the heading instead of squeezing in beside it. */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-10 px-6 py-20 md:p-24">
            {view === "home" && (
                <div className="space-y-6">
                  <p className="text-[#0e4749] font-bold text-4xl sm:text-5xl md:text-7xl">
                    nat's gacha machine!{" "}
                  </p>
                  <p className="font-semibold text-lg md:text-2xl">
                    full-stack • machine learning • agentic systems
                  </p>
                </div>
              )}
            {view === "about" && <About />}
            {view === "work" && <WorkPage />}
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
            onWork={() => setView("work")}
          />
        </div>
      )}
    </div>
  );
}

export default App;
