import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import http from 'k6/http';
import { check } from 'k6';
import { Trend, Rate } from 'k6/metrics';


export const getUsersDuration = new Trend('get_users', true);
export const RateContentOK = new Rate('content_OK');

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.30'],   
    get_users: ['p(95)<5700'],        
    content_OK: ['rate>0.95']         
  },
  stages: [
    { duration: '20s', target: 10 },    
    { duration: '20s', target: 30 },
    { duration: '20s', target: 50 },
    { duration: '20s', target: 60 },
    { duration: '90s',  target: 50 },    
    { duration: '40s', target: 150 },  
    { duration: '40s', target: 150 },  
    { duration: '30s', target: 300 },   
    { duration: '20s', target: 300}      
  ]
};

export function handleSummary(data) {
  return {
    './src/output/index.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true })
  };
}

export default function () {
  const res = http.get('https://jsonplaceholder.typicode.com/users', {
    headers: { 'Content-Type': 'application/json' }
  });

  getUsersDuration.add(res.timings.duration);
  RateContentOK.add(res.status === 200);

  check(res, {
    'GET Users - Status 200': () => res.status === 200
  });
}
