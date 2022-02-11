import fetch from "node-fetch";
import { Semaphore } from "async-mutex";

const url = "https://challenges.qluv.io/items/"
const maxRequests = 5;
const semaphore = new Semaphore(maxRequests);

var args = process.argv.slice(2);

if(args.length > 1){
    console.log("Warning: More than 1 input parameters passed!");
}

var numberOfRequest = args[0];
if (isNaN(numberOfRequest)) {
    throw new Error("Error: Invalid input for number of requests. Please pass a integer!");
}

numberOfRequest = parseInt(numberOfRequest);

for(var i = 0; i < numberOfRequest; i++){
    var id = generateRandomId();
    var buf = Buffer.from(id);
    var base64 = buf.toString('base64');

    performRequest(url + id, base64);
}

async function performRequest(url, base64) {
    return await semaphore.runExclusive(async () => {
      await fetch(url,
        {
                method: 'GET',
                headers: {
                    'Authorization': base64
                }
            }).then(response => {
                if(response.status == 200){
                    response.text().then(data => console.log("data: " +data +" | response code: "+ response.status))
                } else if(response.status == 429){
                    console.log("Too Many Requests");
                }
            })
            .catch(error => {
                console.log(error);
            });
    });
  }

function generateRandomId() {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for ( var i = 0; i < 12; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
   return result;
}
