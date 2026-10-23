# BACKEND – (not in this repository)

This repository is frontend only. The backend is the sibling project `../reva_designs_server-main` (Express 4, Mongoose 7, MongoDB, JWT). See its `.github/context/BACKEND.md` and `API_AND_DATA_FLOW.md`.

Facts that matter for frontend work (VERIFIED from the server source):
- Base URL: `VITE_SERVER_API_URL` or `http://localhost:8080`; entity CRUD at `/entities/<Entity>`, auth at `/auth/*`.
- Server list endpoint ignores filter query params and defaults to `limit=10`.
- No authorization on `/entities/*`; bcrypt/JWT only for `/auth/*`.
- Server schemas are strict: fields not in the model are dropped silently.
- Changes needing a server change must be coordinated; do not edit the server from this project's tasks unless asked.
