import { useState, useEffect, useRef } from "react";
import aboutImg from "../assets/about.JPG";
import Prize3D from "../components_3D/prize";
import carpenterLogo from "../assets/carpenter.png";
import upaheadLogo from "../assets/upahead.png";
import pennLogo from "../assets/penn.png";
import whartonLogo from "../assets/wharton.png";

const WORK_EXPERIENCE = [
  {
    title: "Machine Learning Engineering Intern",
    company: "Carpenter Technology",
    location: "Reading, PA",
    dates: "May 2026 – Present",
    logo: carpenterLogo,
    bullets: [
      "Built an end-to-end defect detection pipeline for steel manufacturing using XGBoost and scikit-learn",
      "Applied SHAP analysis to interpret feature importances and validate model behavior, achieving 97% accuracy",
      "Migrated and scaled the ML pipeline to Microsoft Fabric; developed interactive Power BI dashboards and matplotlib visualizations to surface real-time predictions and explainability insights to non-technical stakeholders",
    ],
  },
  {
    title: "Full-Stack Software Engineering Intern",
    company: "UpAhead",
    location: "Remote",
    dates: "June 2025 – October 2025",
    logo: upaheadLogo,
    bullets: [
      "Drove a 25× increase in user signups across 200+ universities by launching a redesigned dashboard, iOS onboarding flow, in-app calendar, LMS-integrated automatic assignment population, and major UI/UX improvements",
      "Restructured Firestore collections to optimize query performance and significantly reduce read costs",
      "Operated in an agile environment with weekly deployments, interfacing with users to iterate on features quickly",
    ],
  },
  {
    title: "Graph Theory & Internet Protocol Teaching Assistant",
    company: "NETS 1500 · University of Pennsylvania CIS Department",
    location: "",
    dates: "January 2026 – Present",
    logo: pennLogo,
    bullets: [
      "Taught graph theory algorithms, network protocols, web scraping, and game theory to 200 students",
      "Debugged student implementations in Java, identifying logic, runtime, and edge cases in graphs and web scraping",
    ],
  },
  {
    title: "Wharton Negotiations AI Chatbot Developer",
    company: "Wharton Operations, Information, and Decisions Department",
    location: "Philadelphia, PA",
    dates: "October 2025 – Present",
    logo: whartonLogo,
    bullets: [
      "Developed an LLM-powered platform to create research-focused custom negotiation chatbots",
      "Built redesigned UI using TypeScript & React/Tailwind, translating researcher requirements into product features",
    ],
  },
];

function JobCard({ job, align }) {
  return (
    <div className={`flex flex-col gap-1 max-w-sm ${align === "right" ? "items-start text-left" : "items-end text-right"}`}>
      <p className="font-semibold text-[#0e4749] text-base leading-tight">{job.title}</p>
      <p className="text-[#0e4749] text-sm opacity-70">{job.company}{job.location ? ` · ${job.location}` : ""}</p>
      <p className="text-[#0e4749] text-xs opacity-50 mb-1">{job.dates}</p>
      <ul className="space-y-1.5">
        {job.bullets.map((b, j) => (
          <li key={j} className={`text-[#0e4749] text-sm flex gap-2 ${align === "right" ? "flex-row" : "flex-row-reverse"}`}>
            <span className="mt-1.5 shrink-0 w-1 h-1 rounded-full bg-[#0e4749] opacity-60" />
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Work() {
  const [showPrize, setShowPrize] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [tab, setTab] = useState("work");
  const imgRef = useRef(null);

  function handleBurst() {
    setRevealed(true);
    setTimeout(() => setShowPrize(false), 900);
  }

  useEffect(() => {
    if (!revealed || !imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const dx = window.innerWidth / 2 - (rect.left + rect.width / 2);
    const dy = window.innerHeight / 2 - (rect.top + rect.height / 2);

    imgRef.current.style.transition = "none";
    imgRef.current.style.transform = `translate(${dx}px, ${dy}px) scale(1.4)`;
    imgRef.current.style.opacity = "0";

    void imgRef.current.offsetWidth;

    imgRef.current.style.transition =
      "transform 0.85s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.5s ease";
    imgRef.current.style.transform = "translate(0, 0) scale(1)";
    imgRef.current.style.opacity = "1";
  }, [revealed]);

  return (
    <div className="w-full my-24">
      {showPrize && <Prize3D onBurst={handleBurst} color="#9381FF" />}

      <div className="flex flex-col items-start justify-center mx-12 gap-16">
        {/* Tab header */}
        <div
          style={{
            opacity: revealed ? 1 : 0,
            transform: revealed ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s",
          }}
        >
          <div className="flex flex-row gap-2 items-center">
            <button
              onClick={() => setTab("work")}
              className={`font-semibold text-4xl transition-opacity ${tab === "work" ? "text-[#0e4749] opacity-100" : "text-[#0e4749] opacity-30"}`}
            >
              Work
            </button>
            <span className="text-[#0e4749] text-4xl font-semibold opacity-30">/</span>
            <button
              onClick={() => setTab("projects")}
              className={`font-semibold text-4xl transition-opacity ${tab === "projects" ? "text-[#0e4749] opacity-100" : "text-[#0e4749] opacity-30"}`}
            >
              Projects
            </button>
          </div>
        </div>

        {/* Timeline */}
        {tab === "work" && (
          <div className="relative w-full">
            {/* Center vertical line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#0e4749] opacity-20 -translate-x-1/2" />

            {WORK_EXPERIENCE.map((job, i) => {
              const isLeft = i % 2 === 0;
              return (
                <div
                  key={i}
                  className="relative flex items-center mb-20"
                  style={{
                    opacity: revealed ? 1 : 0,
                    transform: revealed ? "translateY(0)" : "translateY(24px)",
                    transition: `opacity 0.5s ease ${0.3 + i * 0.12}s, transform 0.5s ease ${0.3 + i * 0.12}s`,
                  }}
                >
                  {/* Left half */}
                  <div className="w-1/2 pr-10 flex justify-end">
                    {isLeft ? (
                      <JobCard job={job} align="right" />
                    ) : (
                      <img
                        src={job.logo}
                        alt={job.company}
                        className="w-32 h-32 object-contain rounded-xl"
                      />
                    )}
                  </div>

                  {/* Center dot */}
                  <div className="absolute left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#0e4749] opacity-70 z-10 ring-4 ring-white" />

                  {/* Right half */}
                  <div className="w-1/2 pl-10 flex justify-start">
                    {isLeft ? (
                      <img
                        src={job.logo}
                        alt={job.company}
                        className="w-32 h-32 object-contain rounded-xl"
                      />
                    ) : (
                      <JobCard job={job} align="right" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "projects" && (
          <p className="text-[#0e4749] opacity-50 text-lg">coming soon :)</p>
        )}

        {/* Links */}
        <div
          className="flex flex-row items-center justify-center w-full gap-20 my-24"
          style={{
            opacity: revealed ? 1 : 0,
            transition: "opacity 0.5s ease 0.6s",
          }}
        >
          <a
            href="https://www.linkedin.com/in/natalie-lim1906/"
            target="_blank"
            rel="noreferrer"
            className="text-[#0e4749] hover:opacity-60 transition-opacity"
          >
            <svg viewBox="0 0 24 24" width="56" height="56" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>
          <a
            href="https://github.com/natalie-lim"
            target="_blank"
            rel="noreferrer"
            className="text-[#0e4749] hover:opacity-60 transition-opacity"
          >
            <svg viewBox="0 0 24 24" width="56" height="56" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.562 21.8 24 17.302 24 12 24 5.373 18.627 0 12 0z" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}

export default Work;
