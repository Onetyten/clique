import axios from 'axios';


const baseURL =  import.meta.env.DEV?"http://localhost:3500":undefined;

const api = axios.create({
    baseURL
})


export default api