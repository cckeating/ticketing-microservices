import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';

describe('GET /api/orders/:orderId', () => {
  it('Fetches the order', async () => {
    // Create ticket
    const ticket = Ticket.build({
      id: mongoose.Types.ObjectId().toHexString(),

      title: 'concert',
      price: 20,
    });
    await ticket.save();

    const user = global.signin();

    // Make request to build order with ticket
    const { body: order } = await request(app)
      .post('/api/orders')
      .set('Cookie', user)
      .send({ ticketId: ticket.id })
      .expect(201);

    // make request to fetch order
    const { body: expectedOrder } = await request(app)
      .get(`/api/orders/${order.id}`)
      .set('Cookie', user)
      .send()
      .expect(200);

    expect(expectedOrder.id).toEqual(order.id);
  });

  it('Should throw an error if the ticket is not owned by the user', async () => {
    // Create ticket
    const ticket = Ticket.build({
      id: mongoose.Types.ObjectId().toHexString(),
      title: 'concert',
      price: 20,
    });
    await ticket.save();

    const user = global.signin();

    // Make request to build order with ticket
    const { body: order } = await request(app)
      .post('/api/orders')
      .set('Cookie', user)
      .send({ ticketId: ticket.id })
      .expect(201);

    // Make request to fetch order from different user
    await request(app)
      .get(`/api/orders/${order.id}`)
      .set('Cookie', global.signin())
      .send()
      .expect(401);
  });
});
