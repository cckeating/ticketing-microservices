import Router from 'next/router';
import { useState } from 'react';
import useRequest from '../../hooks/use-request';

import doRequest from '../../hooks/use-request';

const NewTicket = () => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const { doRequest, errors } = useRequest({
    url: '/api/tickets',
    method: 'post',
    body: {
      title,
      price,
    },

    onSuccess: (ticket) => Router.push('/'),
  });

  const onSubmit = (event) => {
    event.preventDefault();

    doRequest();
  };

  const onBlur = () => {
    const currentPrice = parseFloat(price);
    if (isNaN(currentPrice)) {
      return;
    }

    setPrice(currentPrice.toFixed(2));
  };

  return (
    <div>
      Create Ticket
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label>Price</label>
          <input
            value={price}
            onBlur={onBlur}
            onChange={(event) => setPrice(event.target.value)}
            className="form-control"
          />
        </div>
        {errors}
        <button className="btn btn-primary"> Submit</button>
      </form>
    </div>
  );
};

export default NewTicket;
