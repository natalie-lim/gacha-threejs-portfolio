function Nav({ isFullSize = false, onHome, onGacha, onAbout, onWork}) {
  return (
    <nav className="flex fixed top-4 left-4 right-4 z-[1000]">
      <button
        className="text-white bg-[#89a894] absolute left-4 font-semibold text-sm md:text-lg px-3 md:px-5 rounded-lg"
        onClick={onHome}
      >
        natalie lim 하 은
      </button>
      <div className="flex gap-3 md:gap-6 px-3 md:px-5 text-white absolute right-4 text-sm md:text-lg bg-[#89a894] rounded-lg">
        <button onClick={onAbout}>about</button>
        <button onClick={onWork}>work</button>
        <button onClick={onGacha}>gacha machine</button>
      </div>
    </nav>
  );
}

export default Nav;
