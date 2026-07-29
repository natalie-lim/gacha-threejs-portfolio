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

function Projects({ revealed = false }) {
  return (
    <div className="relative w-full">
      <p>Coming soon! </p>
    </div>
  );
}

export default Projects;
