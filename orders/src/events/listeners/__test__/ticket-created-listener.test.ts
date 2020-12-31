import mongoose from 'mongoose';
import { TicketCreatedEvent } from '@ccktickets/common';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketCreatedListener } from '../ticket-created-listener';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  // Create an instance of listener
  const listener = new TicketCreatedListener(natsWrapper.client);

  // Create fake data event
  const data: TicketCreatedEvent['data'] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  // Create fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return {
    listener,
    data,
    msg,
  };
};

it('Creates and saves a ticket', async () => {
  const { listener, data, msg } = await setup();

  // Call onmessage function with data object and message object
  await listener.onMessage(data, msg);

  // Write asserts to make sure ticket was created
  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket!.price).toEqual(data.price);
  expect(ticket!.title).toEqual(data.title);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  // Call onmessage function with data object and message object
  await listener.onMessage(data, msg);

  // Write asserts to make sure ack was called
  expect(msg.ack).toHaveBeenCalled();
});
