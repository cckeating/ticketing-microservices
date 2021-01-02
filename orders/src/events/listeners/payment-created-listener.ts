import {
  Listener,
  OrderStatus,
  PaymentCreatedEvent,
  Subjects,
} from '@ccktickets/common';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';
import { queueGroupName } from './queue-group-name';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId);

    if (!order) {
      throw new Error('Order does not exist');
    }

    order.set({
      status: OrderStatus.Complete,
    });
    await order.save();

    // Could maybe send an Order Updated event to let servies know of update, but not neccessary

    msg.ack();
  }
}
