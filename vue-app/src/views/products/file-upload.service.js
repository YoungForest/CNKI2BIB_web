import * as axios from 'axios';

let url = '';
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development')
    url = 'http://localhost:7071/api/HttpTrigger1';
else
    url = 'https://cnki2bib.azurewebsites.net/api/httptrigger1';
console.log(url);

function upload(data) {
    return axios.post(url, { 'cnki': data }).then((x) => {
            console.log(x);
            return x.data;
        });
}

export default upload;