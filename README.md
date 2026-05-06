# Mochi Hall of Shame

On-chain meme game built on GenLayer where an AI cyber-cat roasts your digital habits. Get roasted, earn a cringe score, and mint your shame as a "Mochi's Certified L" NFT.

Live: https://mochi-hall-of-shame.vercel.app

---

## What is this?

Mochi is a sassy cyber-astronaut cat who lives on the GenLayer blockchain.
You confess your most cringe digital habits, Mochi roasts you via on-chain LLM consensus,
and if your roast is legendary enough — you can mint it as an NFT.

---

## How it works

1. Connect your wallet (MetaMask or any EIP-1193 wallet)
2. Submit a confession — weird digital habit, cringe tech opinion, productivity goblin behavior
3. GenLayer AI validators reach consensus on your roast
4. Your shame is stored permanently on-chain
5. Mint any entry as "Mochi's Certified L" NFT
6. Share your certificate to X (Twitter) with a generated PNG

---

## NFT Rarity System

Rarity is determined by cringe score + verdict combination:

| Rarity    | Points | Emoji |
|-----------|--------|-------|
| BASED     | 0-14   | ✨    |
| COMMON    | 15-34  | ⬜    |
| UNCOMMON  | 35-54  | 🌿    |
| RARE      | 55-74  | 💎    |
| EPIC      | 75-94  | ⚡    |
| LEGENDARY | 95-114 | 🔱    |
| MYTHIC    | 115+   | 👑    |

---

## Tech Stack

| Layer | Tech |
|---|---|
| Blockchain | GenLayer (Intelligent Contracts) |
| Smart Contract | Python (GenVM) |
| Frontend | Next.js 15 + TypeScript |
| Wallet | MetaMask / EIP-1193 via Viem |
| SDK | GenLayerJS |
| Styling | Inline styles (Win98/XP aesthetic) |
| Deploy | Vercel |

---

## Project Structure
mochi-hall-of-shame/
+-- contracts/
|   +-- mochi_hall_of_shame.py   # GenLayer Intelligent Contract
+-- src/
|   +-- app/
|   |   +-- page.tsx             # Main UI (mobile + desktop)
|   |   +-- layout.tsx
|   |   +-- globals.css
|   +-- components/
|   |   +-- Win98Window.tsx      # Draggable resizable window (desktop) / stack (mobile)
|   |   +-- Taskbar.tsx          # XP-style taskbar with Start menu
|   |   +-- BackgroundVibe.tsx   # Pixel art XP Bliss background
|   |   +-- MochiAssistant.tsx   # Clippy-style Mochi helper
|   |   +-- NFTGallery.tsx       # NFT collection browser with rarity filters
|   |   +-- NFTCertificate.tsx   # Certificate modal with PNG export
|   |   +-- LoadingDots.tsx      # Animated loading indicator
|   |   +-- Toast.tsx            # Toast notification system
|   +-- hooks/
|   |   +-- useWallet.ts         # MetaMask connection hook
|   |   +-- useMochiContract.ts  # GenLayerJS contract hook
|   +-- lib/
|   |   +-- genlayer.ts          # GenLayer client setup
|   |   +-- rarity.ts            # NFT rarity calculation
|   |   +-- nftCanvas.ts         # Canvas PNG certificate generator
|   +-- types/
|       +-- contract.ts          # TypeScript types
+-- public/
|   +-- mochi.png                # Mochi mascot
+-- .env.example
+-- next.config.js
+-- tsconfig.json
+-- package.json

---

## Setup

### 1. Deploy the Contract

Open https://studio.genlayer.com, paste `contracts/mochi_hall_of_shame.py`,
deploy with constructor arg `legendary_threshold = 0`, copy the contract address.

Or via CLI:
```bash
genlayer deploy contracts/mochi_hall_of_shame.py
```

### 2. Run Frontend

```bash
npm install
cp .env.example .env.local
# fill in NEXT_PUBLIC_CONTRACT_ADDRESS
npm run dev
```

Open http://localhost:3000

### 3. Environment Variables
NEXT_PUBLIC_GENLAYER_NETWORK=studionet
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...

---

## Contract Methods

| Method | Type | Description |
|---|---|---|
| `submit_for_roast(text)` | write | Submit text confession for roasting |
| `submit_image_for_roast(b64, caption)` | write | Submit image for roasting |
| `mint_certificate(entry_id)` | write | Mint NFT for any entry |
| `get_recent_entries(limit)` | view | Get latest roast entries |
| `get_player_stats(address)` | view | Get player roast stats |
| `get_nft(token_id)` | view | Get NFT metadata |
| `total_entries()` | view | Total entries count |
| `total_nfts()` | view | Total NFTs minted |

---

## Safety Rules (hard-coded in contract)

- No profanity or slurs in any language
- No SARA (Suku, Agama, Ras, Antar-golongan) mockery
- No body-shaming or physical appearance mockery
- Only roasts about digital habits and lifestyle choices
- Prompt injection attempts get roasted back

---

## Features

- Windows XP pixel art background (hills + clouds + trees)
- Draggable + resizable windows on desktop
- XP-style taskbar with Start menu
- Minimize / maximize / close windows
- Wallet connect via MetaMask (system tray)
- Auto-refresh Hall of Shame every 15 seconds
- NFT Gallery with rarity filters (All / Mine / per rarity)
- Certificate PNG generator with canvas
- Share to X (Twitter) with generated image
- Toast notification system
- Mochi assistant (Clippy-style) with mood reactions

---

## Built on GenLayer

GenLayer is a blockchain where validator nodes powered by AI reach consensus
on subjective decisions. This makes it perfect for Mochi — there is no
objective "right roast", but validators can agree a roast is structurally
valid and within safety rules.

Learn more: https://docs.genlayer.com

---

## License

MIT