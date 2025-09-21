## Create a platform for 'investment clubs' that allows small groups to pool funds and invest collectively.

# Invest Club Platform

A full-stack platform for managing investment clubs, including club creation, member management, proposals, voting, portfolio tracking, and more. Built with Node.js (Express) for the backend and React (Vite) for the frontend.

## Features

### Backend (Node.js/Express)
- RESTful API for club management, member management, contributions, proposals, voting, notifications, and more
- Authentication and authorization middleware
- Models for clubs, members, transactions, proposals, votes, audit logs, KYC, notifications, and more
- File uploads and report generation
- API documentation available in `Backend/API_DOCUMENTATION.md`

### Frontend (React/Vite)
- Modern UI for club dashboards, member lists, proposals, voting, portfolio tracking, and news
- Authentication (login/signup)
- Responsive design
- Components for all major features

## Project Structure

```
invest-club-platform/
├── server/
│   ├── models/           # Mongoose models for all entities
│   ├── routes/           # Express route handlers
│   ├── middleware/       # Auth and other middleware
│   ├── utils/            # Utility functions (e.g., email)
│   ├── docs/             # API documentation
│   ├── index.js          # Main server entry point
│   └── package.json      # Backend dependencies
├── Frontend/
│   ├── components/       # React components
│   ├── public/           # Static assets
│   ├── src/              # Main React source files
│   ├── index.html        # App entry point
│   ├── vite.config.js    # Vite configuration
│   └── package.json      # Frontend dependencies
├── PDF/                  # PDF reports or templates
├── README.md             # Project overview
└── WORK.txt              # Work log or notes
```

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn

### Backend Setup
1. Navigate to the backend folder:
	```powershell
	cd server
	```
2. Create a `.env` file with the following variables:
	```
	MONGODB_URI=mongodb://localhost:27017/investclub
	PORT=3000
	JWT_SECRET=your-secret-key
	EMAIL_HOST=smtp.gmail.com
	EMAIL_PORT=587
	EMAIL_USER=your-email@gmail.com
	EMAIL_PASS=your-app-password
	```
3. Install dependencies:
	```powershell
	npm install
	```
4. Start the backend server:
	```powershell
	npm start
	```

### Frontend Setup
1. Navigate to the frontend folder:
	```powershell
	cd Frontend
	```
2. Install dependencies:
	```powershell
	npm install
	```
3. Start the frontend development server:
	```powershell
	npm run dev
	```

## API Documentation
See `server/API_DOCUMENTATION.md` and `server/docs/api-endpoints.md` for details on available endpoints and usage.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
This project is licensed under the MIT License.
