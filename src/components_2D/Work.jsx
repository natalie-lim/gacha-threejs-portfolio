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
      "Owned an end-to-end defect classification pipeline from raw sensor data to production predictions (XGBoost, scikit-learn), reaching 97% accuracy with minimal existing tooling available",
      "Partnered with non-technical steel plant stakeholders to translate SHAP-based feature importance into actions",
      "Rescaled the pipeline onto cloud infrastructure (Microsoft Fabric Lakehouse, Delta tables, Spark)",
      "Designed and shipped a real-time multi-camera thermal imaging dashboard (PyQtGraph, OpenCV, multithreading), deployed on the manufacturing floor for live defect monitoring in vacuum arc remelting machines",
      "Architected a multi-agent PDF extraction pipeline for the Sustainability team, chunking SAP-sourced utility invoices across parallel extraction agents and amalgamating outputs into structured records",
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
    <div
      className={`flex flex-col gap-1 w-full max-w-sm ${align === "right" ? "items-start text-left" : "items-end text-right"}`}
    >
      <p className="font-semibold text-[#0e4749] text-base leading-tight">
        {job.title}
      </p>
      <p className="text-[#0e4749] text-sm opacity-70">
        {job.company}
        {job.location ? ` · ${job.location}` : ""}
      </p>
      <p className="text-[#0e4749] text-xs opacity-50 mb-1">{job.dates}</p>
      <ul className="space-y-1.5">
        {job.bullets.map((b, j) => (
          <li
            key={j}
            className={`text-[#0e4749] text-sm flex gap-2 ${align === "right" ? "flex-row" : "flex-row-reverse"}`}
          >
            <span className="mt-1.5 shrink-0 w-1 h-1 rounded-full bg-[#0e4749] opacity-60" />
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Just the timeline. The gumball burst that gates it, the heading, and the links
// all live in WorkPage — `revealed` is the one thing this needs from it, so the
// per-job stagger below starts in step with the rest of the page.
function Work({ revealed = false }) {
  return (
    <div className="relative w-full">
      {/* Center vertical line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#0e4749] opacity-20 -translate-x-1/2" />

      {WORK_EXPERIENCE.map((job, i) => {
        const isLeft = i % 2 === 0;
        return (
          <div
            key={i}
            className="relative flex items-center mb-12 md:mb-20"
            style={{
              opacity: revealed ? 1 : 0,
              transform: revealed ? "translateY(0)" : "translateY(24px)",
              transition: `opacity 0.5s ease ${0.3 + i * 0.12}s, transform 0.5s ease ${0.3 + i * 0.12}s`,
            }}
          >
            {/* Left half */}
            <div className="w-1/2 pr-4 md:pr-10 flex justify-end">
              {isLeft ? (
                <JobCard job={job} align="right" />
              ) : (
                <img
                  src={job.logo}
                  alt={job.company}
                  className="w-20 h-20 md:w-32 md:h-32 object-contain rounded-xl"
                />
              )}
            </div>

            {/* Center dot */}
            <div className="absolute left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#0e4749] opacity-70 z-10 ring-4 ring-white" />

            {/* Right half */}
            <div className="w-1/2 pl-4 md:pl-10 flex justify-start">
              {isLeft ? (
                <img
                  src={job.logo}
                  alt={job.company}
                  className="w-20 h-20 md:w-32 md:h-32 object-contain rounded-xl"
                />
              ) : (
                <JobCard job={job} align="right" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Work;
