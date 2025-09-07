const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Club = require('./models/Club');
const User = require('./models/User');
const ClubMember = require('./models/ClubMember');
const Position = require('./models/Position');
const Transaction = require('./models/Transaction');

dotenv.config();

const sampleClubs = [
    // Technology Clubs
    {
        name: "Tech Innovators Hub",
        description: "Investing in cutting-edge technology companies and startups",
        category: "Technology",
        riskLevel: "High",
        members: 245,
        totalValue: "$2.4M",
        monthlyReturn: "+12.5%",
        image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop",
        minContribution: 1000,
        currency: "INR",
        votingMode: "weighted",
        approvalThresholdPercent: 60,
        isPublic: true,
        investmentSymbols: ["AAPL", "GOOGL", "MSFT", "TSLA", "NVDA"]
    },
    {
        name: "AI & Machine Learning Fund",
        description: "Focused on artificial intelligence and ML companies",
        category: "Technology",
        riskLevel: "High",
        members: 189,
        totalValue: "$1.8M",
        monthlyReturn: "+15.2%",
        image: "https://images.unsplash.com/photo-1555255707-c07966088b7b?w=400&h=300&fit=crop",
        minContribution: 2000,
        currency: "INR",
        votingMode: "simple",
        approvalThresholdPercent: 50,
        isPublic: true,
        investmentSymbols: ["GOOGL", "META", "AMZN", "NFLX", "CRM"]
    },
    {
        name: "Blockchain Pioneers",
        description: "Investing in blockchain technology and crypto infrastructure",
        category: "Technology",
        riskLevel: "Very High",
        members: 156,
        totalValue: "$950K",
        monthlyReturn: "+8.7%",
        image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=300&fit=crop",
        minContribution: 1500,
        currency: "INR",
        votingMode: "weighted",
        approvalThresholdPercent: 70,
        isPublic: true,
        investmentSymbols: ["COIN", "MSTR", "SQ", "PYPL", "SHOP"]
    },

    // Energy Clubs
    {
        name: "Green Energy Solutions",
        description: "Investing in renewable energy and sustainable technologies",
        category: "Energy",
        riskLevel: "Medium",
        members: 312,
        totalValue: "$3.1M",
        monthlyReturn: "+9.3%",
        image: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&h=300&fit=crop",
        minContribution: 800,
        currency: "INR",
        votingMode: "simple",
        approvalThresholdPercent: 50,
        isPublic: true,
        investmentSymbols: ["ENPH", "SEDG", "FSLR", "NEE", "DUK"]
    },
    {
        name: "Oil & Gas Traditional",
        description: "Conservative investment in established oil and gas companies",
        category: "Energy",
        riskLevel: "Medium",
        members: 278,
        totalValue: "$4.2M",
        monthlyReturn: "+6.8%",
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
        minContribution: 1200,
        currency: "INR",
        votingMode: "weighted",
        approvalThresholdPercent: 55,
        isPublic: true,
        investmentSymbols: ["XOM", "CVX", "COP", "EOG", "PXD"]
    },

    // Real Estate Clubs
    {
        name: "Urban Property Investors",
        description: "Investing in commercial and residential properties in major cities",
        category: "Real Estate",
        riskLevel: "Medium",
        members: 198,
        totalValue: "$5.6M",
        monthlyReturn: "+11.2%",
        image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop",
        minContribution: 2500,
        currency: "INR",
        votingMode: "weighted",
        approvalThresholdPercent: 65,
        isPublic: true,
        investmentSymbols: ["PLD", "AMT", "EQIX", "CCI", "SPG"]
    },
    {
        name: "Commercial Real Estate",
        description: "Focus on office buildings and commercial property investments",
        category: "Real Estate",
        riskLevel: "Low",
        members: 167,
        totalValue: "$7.8M",
        monthlyReturn: "+8.1%",
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop",
        minContribution: 3000,
        currency: "INR",
        votingMode: "simple",
        approvalThresholdPercent: 50,
        isPublic: true,
        investmentSymbols: ["O", "AVB", "EQR", "ESS", "MAA"]
    },

    // Crypto Clubs
    {
        name: "Crypto Diversified Fund",
        description: "Balanced cryptocurrency portfolio with multiple assets",
        category: "Crypto",
        riskLevel: "Very High",
        members: 423,
        totalValue: "$1.2M",
        monthlyReturn: "+18.5%",
        image: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400&h=300&fit=crop",
        minContribution: 500,
        currency: "INR",
        votingMode: "simple",
        approvalThresholdPercent: 50,
        isPublic: true,
        investmentSymbols: ["BTC", "ETH", "ADA", "SOL", "DOT"]
    },
    {
        name: "DeFi Protocols Club",
        description: "Investing in decentralized finance protocols and yield farming",
        category: "Crypto",
        riskLevel: "Very High",
        members: 298,
        totalValue: "$780K",
        monthlyReturn: "+22.1%",
        image: "https://images.unsplash.com/photo-1639762681057-408e52192e55?w=400&h=300&fit=crop",
        minContribution: 750,
        currency: "INR",
        votingMode: "weighted",
        approvalThresholdPercent: 60,
        isPublic: true,
        investmentSymbols: ["UNI", "AAVE", "COMP", "MKR", "SUSHI"]
    },

    // Commodities Clubs
    {
        name: "Precious Metals Fund",
        description: "Gold, silver, and precious metals investment portfolio",
        category: "Commodities",
        riskLevel: "Low",
        members: 145,
        totalValue: "$2.9M",
        monthlyReturn: "+7.4%",
        image: "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=400&h=300&fit=crop",
        minContribution: 1000,
        currency: "INR",
        votingMode: "simple",
        approvalThresholdPercent: 50,
        isPublic: true,
        investmentSymbols: ["GLD", "SLV", "GDX", "GOLD", "NEM"]
    },
    {
        name: "Agricultural Commodities",
        description: "Investing in agricultural products and food commodities",
        category: "Commodities",
        riskLevel: "Medium",
        members: 98,
        totalValue: "$1.5M",
        monthlyReturn: "+5.9%",
        image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop",
        minContribution: 800,
        currency: "INR",
        votingMode: "weighted",
        approvalThresholdPercent: 55,
        isPublic: true,
        investmentSymbols: ["CORN", "WEAT", "SOYB", "CANE", "COTT"]
    }
];

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        // Clear existing clubs
        await Club.deleteMany({});
        console.log('Cleared existing clubs');

        // Create a dummy user for club ownership (you might want to create a proper admin user)
        let dummyUser = await User.findOne({ email: 'admin@investclub.com' });
        if (!dummyUser) {
            dummyUser = new User({
                firstName: 'Arjun',
                lastName: 'Mehta',
                username: 'admin',
                email: 'admin@investclub.com',
                password: await require('bcryptjs').hash('admin123', 10),
                isVerified: true
            });
            await dummyUser.save();
            console.log('Created admin user: Arjun Mehta');
        }

        // Create some sample users with Indian names
        const sampleUsers = [
            { firstName: 'Rahul', lastName: 'Sharma', username: 'rahulsharma', email: 'rahul@example.com' },
            { firstName: 'Priya', lastName: 'Patel', username: 'priyapatel', email: 'priya@example.com' },
            { firstName: 'Amit', lastName: 'Kumar', username: 'amitkumar', email: 'amit@example.com' },
            { firstName: 'Sneha', lastName: 'Singh', username: 'snehasingh', email: 'sneha@example.com' },
            { firstName: 'Vikram', lastName: 'Gupta', username: 'vikramgupta', email: 'vikram@example.com' },
            { firstName: 'Anjali', lastName: 'Verma', username: 'anjaliverma', email: 'anjali@example.com' },
            { firstName: 'Rajesh', lastName: 'Yadav', username: 'rajeshkumar', email: 'rajesh@example.com' },
            { firstName: 'Kavita', lastName: 'Jain', username: 'kavitajain', email: 'kavita@example.com' }
        ];

        const createdUsers = [];
        for (const userData of sampleUsers) {
            let user = await User.findOne({ email: userData.email });
            if (!user) {
                user = new User({
                    ...userData,
                    password: await require('bcryptjs').hash('password123', 10),
                    isVerified: true
                });
                await user.save();
                console.log(`Created user: ${userData.firstName} ${userData.lastName}`);
            }
            createdUsers.push(user);
        }

        // Create clubs with the dummy user as owner
        const clubsWithOwner = sampleClubs.map(club => ({
            ...club,
            ownerId: dummyUser._id
        }));

        const createdClubs = await Club.insertMany(clubsWithOwner);
        console.log(`Seeded ${sampleClubs.length} clubs successfully`);

        // Create club memberships
        for (const club of createdClubs) {
            // Add owner as member
            const ownerMembership = new ClubMember({
                clubId: club._id,
                userId: dummyUser._id,
                role: 'owner',
                contributionAmount: club.minContribution
            });
            await ownerMembership.save();

            // Add some random members to each club (different users for each club)
            const availableUsers = [...createdUsers].sort(() => 0.5 - Math.random());
            const numMembers = Math.min(3 + Math.floor(Math.random() * 3), availableUsers.length); // 3-5 members per club

            for (let i = 0; i < numMembers; i++) {
                const existingMembership = await ClubMember.findOne({
                    clubId: club._id,
                    userId: availableUsers[i]._id
                });

                if (!existingMembership) {
                    const membership = new ClubMember({
                        clubId: club._id,
                        userId: availableUsers[i]._id,
                        role: i === 0 ? 'admin' : 'member',
                        contributionAmount: Math.floor(Math.random() * club.minContribution) + club.minContribution
                    });
                    await membership.save();
                }
            }
        }

        console.log('Created club memberships');

        // Create sample positions for each club
        for (const club of createdClubs) {
            const symbols = club.investmentSymbols || ['RELIANCE.NS', 'TCS.NS', 'INFY.NS'];

            for (const symbol of symbols.slice(0, 3)) { // Limit to 3 positions per club
                const position = new Position({
                    clubId: club._id,
                    symbol: symbol,
                    quantity: Math.floor(Math.random() * 100) + 10,
                    avgPrice: Math.floor(Math.random() * 1000) + 500,
                    lastPrice: Math.floor(Math.random() * 1000) + 500,
                    currency: 'INR'
                });
                await position.save();
            }
        }
        console.log('Created sample positions');

        // Create sample transactions for each club
        for (const club of createdClubs) {
            for (let i = 0; i < 5; i++) { // 5 transactions per club
                const transaction = new Transaction({
                    clubId: club._id,
                    type: ['contribution', 'buy', 'sell'][Math.floor(Math.random() * 3)],
                    amount: Math.floor(Math.random() * 10000) + 1000,
                    currency: 'INR',
                    createdBy: dummyUser._id
                });
                await transaction.save();
            }
        }
        console.log('Created sample transactions');

        console.log('Database seeding completed!');
        process.exit(0);

    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
