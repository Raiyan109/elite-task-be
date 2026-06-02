// src/cron/deleteOldUsers.ts
import cron from 'node-cron';
import userModel from '../modules/User/user.model';


const deleteOldUsers = () => {
  cron.schedule('0 0 * * *', async () => {
    const now = new Date();
    try {
      const result = await userModel.deleteMany({
        scheduledForDeletionAt: { $lte: now },
      });

      console.log(`${result.deletedCount} user(s) permanently deleted`);
    } catch (error) {
      console.error('Error during user deletion cron job:', error);
    }
  });
};

export default deleteOldUsers;
