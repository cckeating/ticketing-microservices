import mongoose from 'mongoose';
import { TicketUpdatedEvent } from '@ccktickets/common';
import { natsWrapper } from '../../../nats-wrapper';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';
import { TicketUpdatedListener } from '../ticket-updated-listener';

const setup = async () => {
  // Create an instance of listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  // Create and save a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 15,
  });
  await ticket.save();

  // Create fake data event
  const data: TicketUpdatedEvent['data'] = {
    version: ticket.version + 1,
    id: ticket.id,
    title: 'Updated concert',
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
    ticket,
  };
};

it('Finds, updates, and saves a ticket', async () => {
  const { listener, data, msg, ticket } = await setup();

  // Call onmessage function with data object and message object
  await listener.onMessage(data, msg);

  // Write asserts to make sure ticket was created
  const foundTicket = await Ticket.findById(ticket.id);

  expect(foundTicket).toBeDefined();
  expect(foundTicket!.version).toEqual(data.version);
  expect(foundTicket!.price).toEqual(data.price);
  expect(foundTicket!.title).toEqual(data.title);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  // Call onmessage function with data object and message object
  await listener.onMessage(data, msg);

  // Write asserts to make sure ack was called
  expect(msg.ack).toHaveBeenCalled();
});

it('Does not call ack if the event has skipped a version number', async () => {
  const { listener, data, msg, ticket } = await setup();

  // Put the version into the future
  data.version = data.version + 4;

  try {
    await listener.onMessage(data, msg);
  } catch (err) {}

  expect(msg.ack).not.toHaveBeenCalled();
});
