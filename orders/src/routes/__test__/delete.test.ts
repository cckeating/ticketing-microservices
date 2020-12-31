import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { Order, OrderStatus } from '../../models/order';
import { natsWrapper } from '../../nats-wrapper';

describe('DELETE /api/orders/:orderId', () => {
  it('Marks an order as cancelled', async () => {
    // Create ticket
    const ticket = Ticket.build({
      id: mongoose.Types.ObjectId().toHexString(),
      title: 'concert',
      price: 20,
    });
    await ticket.save();

    const user = global.signin();

    // Make request to make order
    const { body: order } = await request(app)
      .post('/api/orders')
      .set('Cookie', user)
      .send({
        ticketId: ticket.id,
      })
      .expect(201);

    // Make request to cancel order
    await request(app)
      .delete(`/api/orders/${order.id}`)
      .set('Cookie', user)
      .send()
      .expect(204);

    // Expect order was cancelled
    const updatedOrder = await Order.findById(order.id);
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
  });

  it('Emits an order cancelled event', async () => {
    // Create ticket
    const ticket = Ticket.build({
      id: mongoose.Types.ObjectId().toHexString(),

      title: 'concert',
      price: 20,
    });
    await ticket.save();

    const user = global.signin();

    // Make request to make order
    const { body: order } = await request(app)
      .post('/api/orders')
      .set('Cookie', user)
      .send({
        ticketId: ticket.id,
      })
      .expect(201);

    // Make request to cancel order
    await request(app)
      .delete(`/api/orders/${order.id}`)
      .set('Cookie', user)
      .send()
      .expect(204);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });
});
