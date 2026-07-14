# 🎰 nat's gacha machine

A personal portfolio site, reimagined as an interactive gacha (gumball) machine. Instead of static bio sections, visitors crank a handle on a real-time 3D gacha machine and watch a physics-simulated gumball drop, roll down a chute, and burst open into a prize.

Built by [Natalie Lim](https://github.com/natalie-lim) — CS & AI @ UPenn.

**🔗 Live demo: [gacha-liard-seven.vercel.app](https://gacha-liard-seven.vercel.app/)**

## Features

- **3D gacha machine** — modeled at runtime with CSG (constructive solid geometry) boolean operations: the cabinet, dome, coin slot, and dispenser chute are all boxes/cylinders combined and cut from one another rather than pre-made assets.
- **Physics-driven gumballs** — dozens of gumballs tumble inside the glass dome using a `cannon-es` rigid-body simulation. Gravity is continuously re-oriented to match the camera's orientation, so the balls tumble realistically as you orbit the machine (snow-globe effect).
- **Click-to-play crank** — click the crank handle to spin it, drop a random gumball into the chute, and watch it fly out, split open, and reveal a hidden message.
- **Gacha-ball page transitions** — the About and Work pages open with a shaking, bursting gacha ball animation before the content is revealed.
- **Typewriter intro** — a typed greeting plays on first load before handing off to the main site.
- **Interactive grid background** — a canvas grid with a mouse-reactive glow effect rendered behind all content.
- **Fully responsive 3D view** — the gacha machine can be expanded to a full-screen, orbit-controllable view.

## Tech Stack

- [React 19](https://react.dev/) (via `react-scripts` / Create React App)
- [Three.js](https://threejs.org/) for 3D rendering
- [three-bvh-csg](https://github.com/gkjohnson/three-bvh-csg) for constructive solid geometry
- [cannon-es](https://github.com/pmndrs/cannon-es) for rigid-body physics
- [Tailwind CSS](https://tailwindcss.com/) for 2D layout/styling

## Getting Started

```bash
# install dependencies
npm install

# run the dev server at http://localhost:3000
npm start

# build for production
npm run build
```

## Project Structure

```
src/
├── App.js                    # top-level view state (home / about / work / gacha)
├── components_2D/
│   ├── Navigation.jsx        # top nav bar
│   ├── About.jsx             # about page (gacha-ball reveal + bio)
│   ├── Work.jsx               # work experience timeline + projects tab
│   └── GridOverlay.jsx       # animated background grid
└── components_3D/
    ├── welcome.js             # typewriter intro screen
    ├── gacha.js               # the full gacha machine scene, physics & interactions
    └── prize.js               # the shaking/bursting gacha ball used on page transitions
```

## Interacting with the Gacha Machine

- **Drag** to orbit the camera around the machine.
- **Click the crank** to spin it and dispense a gumball prize.
- Click **"gacha machine"** in the nav to expand it to full screen.
