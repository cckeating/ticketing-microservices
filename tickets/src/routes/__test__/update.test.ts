import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';

describe('PUT /api/tickets/:id', () => {
  it('Returns a 404 if the provided ID does not exist', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
      .put(`/api/tickets/${id}`)
      .set('Cookie', global.signin())
      .send({
        title: 'title',
        price: 20,
      })
      .expect(404);
  });
  it('Returns a 401 if the user is not authenticated', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
      .put(`/api/tickets/${id}`)
      .send({
        title: 'title',
        price: 20,
      })
      .expect(401);
  });
  it('Returns a 401 if the user does not own the ticket', async () => {
    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({
        title: 'title',
        price: 20,
      });

    const updateResponse = await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', global.signin())
      .send({
        title: 'title',
        price: 30,
      })
      .expect(401);
  });
  it('Returns a 400 if the user provides an invalid title or price', async () => {
    const userCookie = global.signin();
    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', userCookie)
      .send({
        title: 'title',
        price: 20,
      });

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', userCookie)
      .send({
        title: '',
        price: 30,
      })
      .expect(400);

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', userCookie)
      .send({
        title: 'title',
        price: -30,
      })
      .expect(400);
  });

  it('Updates a ticket successfully', async () => {
    const userCookie = global.signin();
    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', userCookie)
      .send({
        title: 'title',
        price: 20,
      });

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', userCookie)
      .send({
        title: 'new title',
        price: 30,
      })
      .expect(200);

    const ticketResponse = await request(app)
      .get(`/api/tickets/${response.body.id}`)
      .send();

    expect(ticketResponse.body.title).toEqual('new title');
    expect(ticketResponse.body.price).toEqual(30);
  });

  it('Publishes an event', async () => {
    const userCookie = global.signin();
    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', userCookie)
      .send({
        title: 'title',
        price: 20,
      });

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', userCookie)
      .send({
        title: 'new title',
        price: 30,
      })
      .expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalledTimes(2);
  });
});
