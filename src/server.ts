import mongoose from "mongoose";
import app from "./app";
import config from "./config";
import deleteOldUsers from "./cronJob/deleteOldUsers";

async function main() {
    try {
        await mongoose.connect(config.db_url as string);

        // Start cron jobs after DB is connected
        deleteOldUsers(); // 👈 Start the cron job here


        app.listen(config.port, () => {
            console.log(`Elite Task backend listening on port ${config.port}`)
        })
    } catch (err) {
        console.log(err);
    }

}


main();