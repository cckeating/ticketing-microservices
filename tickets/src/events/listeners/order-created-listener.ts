import {
  Listener,
  OrderCreatedEvent,
  OrderStatus,
  Subjects,
} from '@ccktickets/common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';
import { queueGroupName } from './queue-group-name';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    // Get ticket from order
    const ticket = await Ticket.findById(data.ticket.id);

    // if no ticket, throw
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // Mark ticket as reserved
    ticket.set({ orderId: data.id });

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
