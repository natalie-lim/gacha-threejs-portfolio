function Nav() {
  return (
    <nav className="flex absolute top-4 left-4 right-4">
      <div className="text-white bg-[#89a894] absolute left-4 font-semibold text-lg px-5 rounded-xl">
        natalie lim 하 은
      </div>
      <div className="flex gap-6 px-5 text-white absolute right-4 text-lg bg-[#89a894] rounded-xl">
        <button>about</button>
        <button>work</button>
        <button>projects</button>
        <button>gacha machine</button>
      </div>
    </nav>
  );
}

export default Nav;
