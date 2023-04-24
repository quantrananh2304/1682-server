import { injectable } from "inversify";
import { IPaymentService } from "./interface";
import PaymentMethods, {
  PAYMENT_METHOD_STATUS,
  PaymentMethodModelInterface,
} from "@app-repositories/models/PaymentMethods";
import { Types } from "mongoose";
import Payments, {
  PAYMENT_STATUS,
  PaymentModelInterface,
} from "@app-repositories/models/Payments";

@injectable()
class PaymentService implements IPaymentService {
  async createPaymentMethod(
    userId: string,
    name: string,
    note: string
  ): Promise<PaymentMethodModelInterface> {
    const paymentMethod: PaymentMethodModelInterface =
      await PaymentMethods.create({
        name,
        note,
        status: PAYMENT_METHOD_STATUS.ACTIVE,
        discount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        updatedBy: Types.ObjectId(userId),
      });

    return paymentMethod;
  }

  async getPaymentMethod(): Promise<PaymentMethodModelInterface[]> {
    const paymentMethods: Array<PaymentMethodModelInterface> =
      await PaymentMethods.find({}).lean();

    return paymentMethods;
  }

  async getPaymentMethodByName(
    name: string
  ): Promise<PaymentMethodModelInterface> {
    const paymentMethod: PaymentMethodModelInterface =
      await PaymentMethods.findOne({ name });

    return paymentMethod;
  }

  async getAvailablePaymentMethod(): Promise<PaymentMethodModelInterface[]> {
    const paymentMethods: Array<PaymentMethodModelInterface> =
      await PaymentMethods.find({
        status: PAYMENT_METHOD_STATUS.ACTIVE,
      }).lean();

    return paymentMethods;
  }

  async createOrder(
    userId: string,
    method: string,
    amount: string
  ): Promise<PaymentModelInterface> {
    const payment: PaymentModelInterface = await Payments.create({
      method: Types.ObjectId(method),
      amount,
      status: PAYMENT_STATUS.PENDING,
      createdBy: Types.ObjectId(userId),
      createdAt: new Date(),
      updatedAt: new Date(),
      updatedBy: Types.ObjectId(userId),
    });

    return payment;
  }

  async getPaymentMethodById(
    paymentMethodId: string
  ): Promise<PaymentMethodModelInterface> {
    const paymentMethod: PaymentMethodModelInterface =
      await PaymentMethods.findById(paymentMethodId).lean();

    return paymentMethod;
  }

  async updateOrderStatus(
    paymentId: string,
    status: PAYMENT_STATUS,
    userId: string
  ): Promise<PaymentModelInterface> {
    const payment: PaymentModelInterface = await Payments.findByIdAndUpdate(
      paymentId,
      {
        $set: {
          status,
          updatedAt: new Date(),
          updatedBy: Types.ObjectId(userId),
        },
      },
      { new: true, useFindAndModify: false }
    );

    return payment;
  }
}

export default PaymentService;
