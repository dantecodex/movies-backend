import mongoose from "mongoose";
import 'dotenv/config';

process.on('uncaughtException', (err) => {
    console.log(err.name, err.message);
    console.log('Uncaught exception occured, Shutting Down...!');
    process.exit(1);
})


import app from "./app.js";

// console.log(app.get('env'));
// console.log(process.env);

mongoose.connect(process.env.CONN_STR, {
    useNewUrlParser: true
}).then((conn) => {
    // console.log(conn);
    console.log('DB Connection Succesfull');
}).catch((err) => {
    console.log(`Failed to connect MongoDB ${err}`);
})

const server = app.listen(process.env.PORT || 3000, () => {
    console.log('Server has started...');
})

process.on('unhandledRejection', (err) => {
    console.log(err.name, err.message);
    console.log('Unhandle Rejection occured, Shutting Down...!');
    server.close(() => {
        process.exit(1);
    });
})

