import { Listener, OrderCancelledEvent, Subjects } from '@ccktickets/common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';
import { queueGroupName } from './queue-group-name';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    // Get ticket from order
    const ticket = await Ticket.findById(data.ticket.id);

    // if no ticket, throw
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // Open ticket
    ticket.set({ orderId: undefined });

    // Save ticket
    await ticket.save();

    // Notify ticket update
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      orderId: ticket.orderId,
    });

    // Ack message
    msg.ack();
  }
}
