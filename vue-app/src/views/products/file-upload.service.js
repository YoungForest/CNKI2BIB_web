import * as axios from 'axios';

let url = '';
if (process.env.NODE_ENV === 'development')
    url = 'http://localhost:7071/api/HttpTrigger1';
else
    url = 'https://cnki2bib.azurewebsites.net/api/httptrigger1';

function upload(data) {
    return axios.post(url, { 'cnki': data }).then((x) => {
            return x.data;
        });
}

export default upload;