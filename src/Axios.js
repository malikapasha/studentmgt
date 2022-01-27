import axios from 'axios';
//remote url
export default axios.create({
  baseURL: `http://192.168.0.106:1337/`,
  // baseURL: `http://192.168.43.157:1337/`,
  // baseURL: `http://192.168.100.62:1337/`,
});
