# Mochi Hall of Shame


## Stack

- Next.js 14 (App Router) + TypeScript strict mode
- GenLayerJS SDK (TypeScript, built on Viem)
- Three.js for the Alphabet Globe
- Deploy via GenLayer CLI or Studio (no custom deploy script needed)

## Project Structure

```
mochi-hall-of-shame/
+-- contracts/
|   +-- mochi_hall_of_shame.py   # GenLayer Intelligent Contract
+-- src/
|   +-- app/
|   |   +-- layout.tsx
|   |   +-- page.tsx             # Main UI (client component)
|   |   +-- globals.css
|   +-- components/
|   |   +-- Win98Window.tsx      # Draggable retro window
|   |   +-- AlphabetGlobe.tsx    # Three.js globe + pixel burst
|   |   +-- MochiAssistant.tsx   # Clippy-style helper
|   +-- hooks/
|   |   +-- useMochiContract.ts  # Typed GenLayerJS hook
|   +-- lib/
|   |   +-- genlayer.ts          # Client + chain config
|   +-- types/
|       +-- contract.ts          # Shared types
+-- public/
|   +-- mochi.png                # Mascot
+-- .env.example
+-- next.config.js
+-- tsconfig.json
+-- package.json
```

## Setup

### 1. Deploy the Contract

**Option A -- GenLayer Studio (recommended)**
1. Go to https://studio.genlayer.com
2. Open `contracts/mochi_hall_of_shame.py`
3. Deploy with constructor arg `legendary_threshold = 75`
4. Copy the contract address

**Option B -- GenLayer CLI**
```bash
genlayer init
genlayer deploy contracts/mochi_hall_of_shame.py --args 75
```

### 2. Run the Frontend

```bash
# One-time setup
npm install

# Config
cp .env.example .env.local
# Fill in NEXT_PUBLIC_CONTRACT_ADDRESS with the address from step 1

# Dev server
npm run dev
# -> http://localhost:3000
```

### 3. Optional checks

```bash
npm run type-check   # TypeScript strict check
npm run lint         # ESLint
npm run build        # Production build
```

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_GENLAYER_NETWORK` | `studionet` or `localnet` |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Deployed contract address |
| `NEXT_PUBLIC_PRIVATE_KEY` | Dev only -- use wallet adapter in production |

## How It Works

GenLayer validators each independently call the LLM with Mochi's persona
and reach consensus on whether the roast result is **structurally valid**
(not whether it's the same text -- LLM outputs are non-deterministic).

```python
def validator_fn(leader_result) -> bool:
    data = leader_result.calldata
    return (
        isinstance(data, dict)
        and isinstance(data.get("roast"), str)
        and 5 <= len(data["roast"]) <= 600
        and isinstance(data.get("cringe_score"), int)
        and 0 <= data["cringe_score"] <= 100
    )
```

## Safety Rules (hard-coded in contract prompt)

- No profanity or slurs in any language
- No SARA (Suku, Agama, Ras, Antar-golongan) mockery
- No body-shaming or physical appearance mockery
- Only roasts about digital habits and lifestyle choices
- Prompt injection attempts get roasted back
