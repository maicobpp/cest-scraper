const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

console.log('Starting scraping CESTs');

scrapCESTs().then((amount) => {
  console.log(`Job Done! ${amount} were found`);
  console.log(`Don't forget to search for "Capítulos" and check them out!`);
  console.log(`Before upload, conver file to ANSI`);
});

async function scrapCESTs() {
  const browser = await puppeteer.launch({ ignoreHTTPSErrors : true });
  const page = await browser.newPage();
  await page.goto('https://www.confaz.fazenda.gov.br/legislacao/convenios/2018/CV142_18');
  const hmtl = await page.evaluate(() => {
    return document.querySelector('*').innerHTML;
  });
  await browser.close();

  const $ = cheerio.load(hmtl);
  const list = ['CEST|NCM/SH|DESCRICAO'];
  let cestsAmount = 0;

  $('tbody').find('tr').each(function(i) {
    let line = '';
    let column = 0;
    $(this).find('td').each(function (i) {
      if (column > 0) {
        let count = 0;
        $(this).find('p').each(function (i) {
          let temp = $(this).text().trim();
          if (!isNaN(temp.replaceAll('.', '').replaceAll(',', '').replaceAll(' ', ''))) {
            temp = temp.replaceAll('.', '').replaceAll(',', '').replaceAll(' ', ';');
          }
          if (temp) {
            if (count > 0) { temp = ';' + temp; }
            line += temp;
            count++;
          }
        });
        line += '|';
      }
      column++;
    });
    if (line && !isNaN(line.substring(0, 7)) && line.toLowerCase().indexOf('revogado') === -1) {
      list.push(line);
      cestsAmount++;
    }
  });

  list.map((line) => {
    fs.appendFileSync('/d/CEST.txt', line + `\n`);
  });

  return cestsAmount;
}



