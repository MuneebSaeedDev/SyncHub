const dotenv = require("dotenv")
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

const authRouter = require("./routes/auth.route");
const taskRouter = require("./routes/task.Route");
const friendRequestRoutes = require("./routes/friend.Route");

const app = express();

dotenv.config();

app.use(helmet());

app.use(cors({
    origin: [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174"
    ],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/tasks', taskRouter);
app.use("/api/friends", friendRequestRoutes);

const port = process.env.PORT || 5000

const startServer = async () => {
    try {
        await connectDB();

        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
};

startServer()