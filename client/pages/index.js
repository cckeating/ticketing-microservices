import Link from 'next/link';
import buildClient from '../api/build-client';

const LandingPage = ({ currentUser, tickets }) => {
  const ticketRows = tickets.map((ticket) => (
    <tr key={ticket.id}>
      <td>{ticket.title}</td>
      <td>{ticket.price}</td>
      <td>
        <Link href={`/tickets/[ticketId]`} as={`/tickets/${ticket.id}`}>
          <a>View</a>
        </Link>
      </td>
    </tr>
  ));

  return (
    <div>
      <h2> Tickets </h2>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>{ticketRows}</tbody>
      </table>
    </div>
  );
};

LandingPage.getInitialProps = async (ctx, client, currentUser) => {
  const { data } = await client.get('/api/tickets');
  return {
    tickets: data,
  };
};

export default LandingPage;
