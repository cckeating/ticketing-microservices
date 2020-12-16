import axios from 'axios';

export default ({ req }) => {
  if (typeof window === 'undefined') {
    // Server side

    return axios.create({
      baseURL: 'http://ingress-nginx-controller.kube-system.svc.cluster.local',
      headers: req.headers,
    });
  } else {
    // Browser Side

    return axios.create({ baseURL: '/' });
  }
};
