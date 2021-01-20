const cheerio = require('cheerio');
const axios = require('axios');
const url = 'https://eteenindus.mnt.ee/public/vabadSoidueksamiajad.xhtml';
const twitter = require('twitter-lite');
const fs = require('fs');
// let data = fs.readFileSync('times.json');
// let parsedData = JSON.parse(data);
const config = require('./config');
const { formatDate } = require('tough-cookie');
let numData = [];
const client = new twitter(config);

async function sendTweet(scraped) {
    let r = Math.floor(Math.random() * scraped.length);
    numData.push(r);
    let d = new Date();

    client
        .post('statuses/update', {
            status: `${scraped[r].Asukoht}           
                    ${scraped[r].Esimene}
                    ${scraped[r].Teine}
                    ${scraped[r].Kolmas}
                    ${scraped[r].Link}`,
        })
        .then((result) => {
            console.log(
                'You successfully tweeted this : "' + result.text + '"'
            );
        })
        .catch((e) => {
            if (e.errors[0].code == 187) {
                console.log(`${scraped[r].Asukoht} duplikaat`);
            } else {
                console.log(e);
            }
        });
}

async function scrapMnt() {
    let scrapedData = [];
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        let timeTable = $(
            '.ui-datatable-tablewrapper > table > tbody > tr'
        ).each((i, el) => {
            const tds = $(el).find('td');
            const location = $(tds[0]).text();

            const firstAvailable = $(tds[2]).text();
            const secondAvailable = $(tds[3]).text();
            const thirdAvailable = $(tds[4]).text();
            const tableRow = {
                Asukoht: location,
                Esimene: firstAvailable,
                Teine: secondAvailable,
                Kolmas: thirdAvailable,
                Link: 'eteenindus.mnt.ee/main.jsf',
            };
            scrapedData.push(tableRow);
        });

        sendTweet(scrapedData);
    } catch (error) {
        console.log(error);
    }
}
setInterval(scrapMnt, 40000);
