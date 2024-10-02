import { Worker } from "bullmq";
import { redisConnection } from "../loaders/redis.loader.js";
import { createSpace } from "../services/lib/space.service.js";

const processSpaceJob = async (job) => {
    const { user } = job.data;
    const spaces = [
        { name: "Notes", icon: "note" },
        { name: "Meetings", icon: "meeting" },
        { name: "This Week", icon: "" },
        { name: "Reading List", icon: "book" }
    ];

    try {
        for (const spaceData of spaces) {
            await createSpace(user, spaceData);
        }
    } catch (error) {
        console.error('Error processing pages:', error);
        throw error;
    }
};

const spaceWorker = new Worker('spaceQueue', async (job) => {
    await processSpaceJob(job);
}, {
    connection: redisConnection
});

spaceWorker.on('completed', async (job) => {
    console.log(`Job with id ${job.id} has been completed`);
    await job.remove();
});

spaceWorker.on('failed', (job, err) => {
    console.error(`Job with id ${job.id} has failed with error ${err.message}`);
});

export {
    spaceWorker
}