import { useState, useEffect } from "react";

function Welcome({ text = "" }) {
  const [displayed, setDisplayed] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (displayed.length >= text.length) return;
    const timer = setTimeout(() => {
      setDisplayed(text.slice(0, displayed.length + 1));
    }, 100);
    return () => clearTimeout(timer);
  }, [displayed, text]);

  return (
    <div>
      <p className="w-screen h-screen flex items-center justify-center text-xl">
        {displayed}
        {showCursor && (
          <span
            className="cursor-blink"
            onAnimationEnd={() => setShowCursor(false)}
          >
            |
          </span>
        )}
      </p>
    </div>
  );
}

export default Welcome;
