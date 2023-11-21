import { CronJob } from "cron";
import "dotenv/config";
import { sendAxiomQuery } from "../../actions/axiom-query/send-axiom-query";

/**
 * Cron job to Send Axiom queries every 30 minutes
 */
export const jobSendAxiomQuery = new CronJob(
  "0 */30 * * * *", // cronTime
  async function () {
    console.log("Sending Axiom queries");
    await sendAxiomQuery();
  }, // onTick
  null, // onComplete
  true, // start
  "America/Los_Angeles", // timeZone
);
