import cron = require("node-cron");
import PaymentService from "@app-services/PaymentService";

function cronJob() {
  const paymentService: PaymentService = new PaymentService();

  cron.schedule("0 * * * * *", () => {
    // every minute
    paymentService.updateOverduePayment();
  });
}

export default cronJob;
