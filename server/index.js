const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const clubRoutes = require('./routes/clubs');
const proposalRoutes = require('./routes/proposals');
const contributionsRoutes = require('./routes/contributions');
const fileRoutes = require('./routes/files');
const marketRoutes = require('./routes/market');
const portfolioRoutes = require('./routes/portfolio');
const notificationsRoutes = require('./routes/notifications');
const reportsRoutes = require('./routes/reports');
const webhooksRoutes = require('./routes/webhooks');

const app = express();
app.use(cors());
app.use(express.json());

// add after app.use(express.json());
app.get('/api/health', (req, res) => {
    res.json({ ok: true, time: new Date().toISOString() });
});


mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1); // exit process when DB connection fails
    });

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/clubs', proposalRoutes);
app.use('/api/clubs', contributionsRoutes);
app.use('/api/clubs', fileRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/clubs', portfolioRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/clubs', reportsRoutes);
app.use('/api/webhooks', webhooksRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});