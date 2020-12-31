import { Ticket } from '../ticket';

it('Implements optimistic concurrency control', async (done) => {
  // Create ticket instance
  const ticket = Ticket.build({
    title: 'concert',
    price: 5,
    userId: '123',
  });

  // Save ticket to DB
  await ticket.save();

  // fetch ticket twice
  const firstInst = await Ticket.findById(ticket.id);
  const secondInst = await Ticket.findById(ticket.id);

  // Make two separate changes to tickets
  firstInst?.set({ price: 10 });
  secondInst?.set({ price: 15 });

  // Save first fetched ticket
  await firstInst?.save();

  // Save second fetched ticket and expect error
  try {
    await secondInst?.save();
  } catch (err) {
    done();
    return;
  }

  throw new Error('Should not reach');
});

it('Increments the version number on multiple saves', async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 15,
    userId: '123',
  });

  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
});
