const mongoose = require('mongoose')

mongoose.set('strictQuery', false);

const connectDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.DB_URL, {
            useNewUrlParser: true,
            //useUnifiedTopoloy: true,
        });
        console.log(`Database Running!! ${conn.connection.host}`);
    }catch(err){
        console.log(err.message);
    }
};

module.exports = { connectDB };