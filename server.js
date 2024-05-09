import mongoose from "mongoose";
import app from "./app.js";
import 'dotenv/config'

// console.log(app.get('env'));
// console.log(process.env);

mongoose.connect(process.env.CONN_STR, {
    useNewUrlParser: true
}).then((conn) => {
    // console.log(conn);
    console.log('DB Connection Succesfull');
}).catch((error) => {
    console.log('Some error has occured');
})



app.listen(process.env.PORT || 3000, () => {
    console.log('Server has started...');
})