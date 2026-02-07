# shroom

A multiplayer 3D game built with React Three Fiber, designed to run as a Discord Activity via Playroom.

## Tech Stack

- **Runtime** — [Vite](https://vite.dev) + [React](https://react.dev) + TypeScript
- **3D / Rendering** — [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) + [Drei](https://drei.docs.pmnd.rs) + [Three.js](https://threejs.org)
- **Physics** — [Rapier](https://rapier.rs) via [@react-three/rapier](https://github.com/pmndrs/react-three-rapier)
- **Multiplayer** — [Playroom](https://joinplayroom.com) with Discord Activities integration
- **Discord** — [@discord/embedded-app-sdk](https://github.com/discord/embedded-app-sdk)
- **Package Manager** — [pnpm](https://pnpm.io)

## Getting Started

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_DISCORD_CLIENT_ID=your_discord_client_id
```

## Project Structure

```
src/
├── components/       # Game components (Scene, Player, UI)
├── hooks/            # Custom React hooks (useMultiplayer)
├── multiplayer/      # Discord + Playroom integration
├── main.tsx          # Entry point
└── App.tsx           # Canvas, physics, keyboard controls
```

## Development Roadmap

- [x] Project scaffold (Vite + React + TS)
- [x] React Three Fiber + Rapier physics setup
- [x] Basic player controller (WASD + jump)
- [x] Discord SDK + Playroom multiplayer wiring
- [ ] Character model & animations
- [ ] Level design & environment art
- [ ] Multiplayer player sync
- [ ] Game mechanics & objectives
- [ ] Discord Activity manifest & deployment
- [ ] Audio / SFX

## License

TBD
