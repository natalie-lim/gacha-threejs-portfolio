import aboutImg from "../assets/about.JPG";
import About3D from "../components_3D/prize";

function About() {
  return (
    <div>
      <div className="flex flex-row items-start justify-center mx-12">
        <div className="space-y-12">
          <p className="font-semibold text-[#0e4749] text-4xl">About Me</p>
          <img className="h-full w-64" src={aboutImg} alt="About me" />
        </div>
        <About3D />
      </div>
    </div>
  );
}

export default About;
