const axios = require('axios');
const instance = axios.create({ baseURL: 'http://localhost:6587/api/v1' });
console.log(instance.getUri({ url: 'superadmin/getAllAdmins' }));
