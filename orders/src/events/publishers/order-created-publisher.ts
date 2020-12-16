import { Publisher, Subjects } from '@ccktickets/common';

import { OrderCreatedEvent } from '@ccktickets/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
