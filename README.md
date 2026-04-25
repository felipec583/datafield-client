# Datafield Client

Frontend React application for the Datafield inspection management system.

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

## Environment Variables

Create a `.env` file in the `client` folder:

```
# Backend API URL (required for production)
VITE_API_URL=http://localhost:3000/api
VITE_UPLOADS_URL=http://localhost:3000/uploads
```

For development, create `.env` with your local server URL. For production, deploy first then set the URL to your Fly.io backend.

## App Structure

```
client/
├── src/
│   ├── api.js           # API configuration (imports from env)
│   ├── App.jsx          # Main app with routes
│   ├── main.jsx         # Entry point
│   ├── index.css        # Global styles
│   ├── pages/
│   │   ├── Home.jsx     # Landing page
│   │   ├── Login.jsx    # Authentication
│   │   ├── Form.jsx     # New inspection form
│   │   ├── ReviewList.jsx # Inspection list (cards)
│   │   ├── ReviewDetail.jsx # Inspection details
│   │   └── Completion.jsx  # Success/confirmation
│   ├── components/
│   │   ├── ConfirmModal.jsx
│   │   ├── PhotoModal.jsx
│   │   └── api.js       # Component API config
│   └── styles/
│       └── variables.css  # Theme variables
├── index.html
├── package.json
└── vite.config.js
```

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Landing page |
| `/login` | Login | User login |
| `/form` | Form | New inspection form |
| `/reviews` | ReviewList | List all inspections |
| `/reviews/:id` | ReviewDetail | View inspection |
| `/completion` | Completion | Success message |

## Deployment (Vercel)

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click "Add New..." → Project
3. Select this repository
4. In Environment Variables, add:
   - `VITE_API_URL` = your Fly.io backend URL
   - `VITE_UPLOADS_URL` = your Fly.io uploads URL
5. Click Deploy

## Features

- Mobile-first responsive design
- Photo upload (up to 6 photos per inspection)
- Photo gallery with lightbox
- Delete confirmations
- Toast notifications
- Card-based review list
- PDF report in detail view
