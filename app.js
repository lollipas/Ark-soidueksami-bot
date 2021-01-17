const cheerio = require('cheerio');
const axios = require('axios');
const url = 'https://eteenindus.mnt.ee/public/vabadSoidueksamiajad.xhtml';
const twitter = require('twitter-lite');
const fs = require('fs');
// let data = fs.readFileSync('times.json');
// let parsedData = JSON.parse(data);
const config = require('./config');
let numData = [];
const client = new twitter(config);

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
                Link:
                    'https://eteenindus.mnt.ee/public/vabadSoidueksamiajad.xhtml',
            };
            scrapedData.push(tableRow);
        });

        let r = Math.floor(Math.random() * scrapedData.length);
        numData.push(r);
        

        client
            .post('statuses/update', {
                status: `${scrapedData[r].Asukoht}
                ${scrapedData[r].Esimene}
                ${scrapedData[r].Teine}
                ${scrapedData[r].Kolmas}
                ${scrapedData[r].Link}`,
            })
            .then((result) => {
                console.log(
                    'You successfully tweeted this : "' + result.text + '"'
                );
            })
            .catch((e) => {
                if (e.errors[0].code == 187) {
                    console.log('duplikaat');
                    setTimeout(scrapMnt, 20000);
                } else {
                    console.log(e);
                }
            });
    } catch (error) {
        console.log(error);
    }
}
setInterval(scrapMnt, 40000);
