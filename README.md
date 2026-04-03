# PromptShield

PromptShield is a full-stack hackathon project that demonstrates how an AI agent can be manipulated by jailbreak-style prompts into generating unsafe blockchain transaction requests, while an OWS-aligned wallet security layer blocks unsafe requests before execution.

The demo is intentionally split into three concerns:

1. AI prompt interpretation
2. Policy evaluation and firewall verdicts
3. Wallet execution through an OWS adapter boundary

In mock mode, the app runs end-to-end with realistic simulated wallet responses.
In real mode, the backend is already structured to call a local OWS CLI wallet, look up wallet state, and hand off signing/execution without ever exposing private keys to the AI layer.

## Project Structure

```text
promptshield/
  apps/
    api/
    web/
  packages/
    shared/
```

## Prerequisites

- Git
- npm
- Node.js installed with `nvm`
- Optional but recommended: a local shell environment that can run the OWS CLI commands below

## 1. Install Node Using nvm

Use the exact setup flow requested for local OWS development:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install --lts
node -v
npm -v
```

## 2. Install OWS Globally

```bash
npm install -g @open-wallet-standard/core
```

## 3. Create an OWS Wallet

```bash
ows wallet create --name my-agent
```

This creates the local wallet state used by the real adapter.

## 4. Get the Wallet Address

```bash
ows wallet address --chain eip155:1
```

Use that output to verify your wallet is ready for delegated signing.

## 5. Create an Agent Token

```bash
ows token create --name my-agent-token
```

Store the generated token in your local `.env` file as `PROMPTSHIELD_OWS_AGENT_TOKEN` when you move from mock mode to real mode.

## Environment Variables

Copy the root env template:

```bash
cp .env.example .env
```

Key variables:

- `PROMPTSHIELD_OWS_MODE=mock` keeps the project fully runnable without local wallet state
- `PROMPTSHIELD_OWS_MODE=real` enables the CLI-backed adapter
- `PROMPTSHIELD_OWS_WALLET_NAME` is the wallet name created via `ows wallet create`
- `PROMPTSHIELD_OWS_AGENT_TOKEN_NAME` documents which agent token should be used
- `PROMPTSHIELD_OWS_AGENT_TOKEN` is where you can provide the locally created token
- `PROMPTSHIELD_APPROVED_RECIPIENTS` controls the allowlist used by the policy engine
- `PROMPTSHIELD_MAX_TRANSFER_AMOUNT` and `PROMPTSHIELD_DAILY_LIMIT` define guardrails
- `NEXT_PUBLIC_API_BASE_URL` points the Next.js frontend at the API

## Install

From the project root:

```bash
npm install
```

## Run in Development

```bash
npm run dev
```

This starts:

- API on `http://localhost:4000`
- Web app on `http://localhost:3000`

## Build

```bash
npm run build
```

## Start Production Servers

```bash
npm run start
```

## API Endpoints

- `GET /api/health`
- `POST /api/simulate-prompt`
- `POST /api/evaluate-request`
- `POST /api/execute-request`

## How Mock Mode Works

Mock mode is the default for hackathon velocity and offline demos.

Flow:

1. The frontend sends a prompt to the API.
2. The mock AI interpreter converts it into a structured transaction request.
3. The policy engine evaluates the request.
4. If blocked, the backend returns the firewall verdict and audit log.
5. If allowed, the mock OWS adapter simulates wallet execution and returns a fake tx hash.

Mock mode still preserves the correct architecture:

- The AI layer never signs transactions.
- The policy engine remains separate from wallet execution.
- The wallet adapter is the only place where OWS-specific execution lives.

## How to Switch to Real OWS Integration

1. Complete the wallet and token setup commands above.
2. Update `.env`:

```bash
PROMPTSHIELD_OWS_MODE=real
PROMPTSHIELD_OWS_WALLET_NAME=my-agent
PROMPTSHIELD_OWS_AGENT_TOKEN_NAME=my-agent-token
PROMPTSHIELD_OWS_AGENT_TOKEN=your_generated_token_here
```

3. Restart the API.

In real mode, the API uses the adapter in `apps/api/src/services/ows/real-ows-wallet-adapter.ts`.

That adapter is where these OWS responsibilities connect to the app:

- Wallet creation: documented in README, assumed to be completed locally before runtime
- Wallet address lookup: `getWalletContext()` calls the local CLI to retrieve the address
- Agent token usage: injected via environment variables and attached only in the wallet adapter boundary
- Signing and execution: `executeTransaction()` is the handoff point for real signing/execution

## Where the Real OWS Commands Fit

PromptShield does not let the AI touch private keys. Instead:

1. The AI interpreter outputs a structured request.
2. The policy engine decides whether that request is allowed.
3. Only if allowed, the OWS wallet adapter may call the local wallet for execution.

The adapter boundary is the upgrade path from hackathon mock mode to production-like delegated signing:

- `wallet create` happens once during setup and establishes local wallet storage
- `wallet address` is used by the app to display the active wallet context
- `token create` creates the delegated agent credential used by the real adapter
- transaction signing/execution is isolated to the OWS service layer

## Demo Script for Hackathon Presentation

1. Start the app with `npm run dev`.
2. Open `http://localhost:3000`.
3. Click `Send all funds`.
4. Show how the AI interprets the malicious prompt into a transfer request.
5. Highlight the firewall denying it because it exceeds the max transfer amount and targets an unapproved recipient.
6. Click `Approve unlimited token spending`.
7. Show the policy engine blocking unlimited approvals at high severity.
8. Click `Send 5 USDC to approved address`.
9. Show the request being allowed and the wallet adapter returning a mock execution response.
10. Explain that switching `PROMPTSHIELD_OWS_MODE` from `mock` to `real` moves execution to the local OWS wallet boundary without changing the UI or policy engine.

## Exact Commands to Run Locally

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install --lts
npm install -g @open-wallet-standard/core
ows wallet create --name my-agent
ows wallet address --chain eip155:1
ows token create --name my-agent-token
cp .env.example .env
npm install
npm run dev
```

## Notes

- If the OWS CLI is unavailable on your machine, keep `PROMPTSHIELD_OWS_MODE=mock`.
- The project can be copied into a fresh folder and run locally with only `.env` setup and `npm install`.
- For a live-chain demo, replace the mock execution body in the real adapter with the exact OWS signing/execution command available in your local CLI or SDK version.
