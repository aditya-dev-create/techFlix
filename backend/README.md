# TrustyCrowdFlow — Backend

This repository contains a production-ready backend scaffold for TrustyCrowdFlow — a transparent crowdfunding platform combining blockchain and Web2.

Features included:
- Node.js + Express (TypeScript)
- PostgreSQL + Prisma ORM
- JWT + Wallet (MetaMask) authentication
- IPFS integration
- Socket.IO for realtime
- Hardhat/Ethers integration skeleton for event listening
- Smile detection service (AI) integration skeleton
- Redis + BullMQ for job queues

Getting started (development)

1. Copy `.env.example` to `.env` and set values.
2. Start DB & Redis via Docker Compose (recommended):

```bash
cd backend
docker-compose up -d
```

3. Install dependencies and generate Prisma client:

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
```

4. Start dev server:

```bash
npm run dev
```

5. Frontend runs on port 8080; backend default is 4000.

Notes
- The blockchain listener and contract integrations are skeletons — wire your contract ABIs and addresses in `services/blockchain`.
- Smile detection uses an external API URL configured in `SMILE_API_URL`.
- This scaffold follows Clean Architecture and separates controllers, services, and routes.
