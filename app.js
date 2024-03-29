const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')
const { logger, logEvents } = require('./middleware/logger')
const express = require('express')
const dotenv = require('dotenv')
const bodyParser = require('body-parser')
const { connectDB } = require('./config/dbConfig.js')
const cookieParser = require('cookie-parser')
const {errorHandler}=require("./middleware/errorHandler")
const authRoute = require("./routes/auth.js")
const accountRoute = require("./routes/account.js")
const protectedRoute = require("./routes/protectedRoute.js")

const app = express();
dotenv.config();
const PORT = process.env.PORT;

//connect to db
connectDB();

// logger
app.use(logger)

//app middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use('/', express.static(path.join(__dirname, 'public')))


app.use('/auth', authRoute);
app.use('/protected', protectedRoute);
app.use('/accounts', accountRoute);
//route
app.get("/", (req, res) => {
    res.send("Home Page!");
});

//start server
app.use(errorHandler)
mongoose.connection.once('open', () => {
    console.log('DB connected');

    app.listen(PORT, () => {
        console.log(`Server is running on ${PORT}`);
    });
});
mongoose.connection.on('error', err => {
    console.log(err)
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
});