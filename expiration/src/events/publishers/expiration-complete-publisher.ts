import {
  Publisher,
  ExpirationCompleteEvent,
  Subjects,
} from '@ccktickets/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
