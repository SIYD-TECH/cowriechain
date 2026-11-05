# CowrieChain Backend & Relayer Service

This directory provides the backend infrastructure, off-chain indexing, notification dispatch, and keeper relayer services for CowrieChain.

## Role & Responsibilities

1. **Circle Indexer & Off-chain Cache**:
   - Caches events from `GroupSaveFactory` and individual `GroupSave` contracts.
   - Provides fast, paginated querying for discovery and user dashboards.
2. **Keeper / Relayer Engine**:
   - Automatically monitors active circles where `canResolve() == true` (grace period elapsed with unpaid members).
   - Executes `resolveRound()` permissionlessly so circles never stall waiting for member action.
3. **Off-Chain Invite System**:
   - Handles circle invite deep-links, QR codes, and push notifications for upcoming round deadlines.
4. **Reward Consistency Computation**:
   - Calculates on-time payment records across cycles for distribution of quarterly bonus points.

## API Endpoints

- `GET /api/health` - Health check & node connectivity
- `GET /api/circles` - Paginated circles index
- `POST /api/circles/invite` - Queue circle invites & notification alerts
- `GET /api/vaults/analytics/:userAddress` - Saver metrics & discipline scores
- `GET /api/rewards/leaderboard` - Consistency leaderboard
- `POST /api/relayer/resolve-round` - Relayer execution for expired grace rounds

