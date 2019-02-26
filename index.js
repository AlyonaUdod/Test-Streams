const fs = require('fs');
const { Transform } = require('stream');
const CombinedStream = require('combined-stream');
const Converter = require("csvtojson").Converter;
const csvConverter = new Converter( {constructResult:false, delimiter: ["||"] } ); 
const combinedStream = CombinedStream.create();
// const readStream = fs.createReadStream('./inputData/users1.csv');
const writeStream = fs.createWriteStream("outpuData.json", {flags:'a'});

const transformData = new Transform({
  transform(chunk, encoding, callback) {
    let user = JSON.parse(chunk.toString());
    let obj = {
        name: user.last_name+' '+user.first_name,
        phone: +user.phone.split(/\W/).join(''),
        person: {
            firstName: user.first_name,
            lastName: user.last_name
        },
        amount: +user.amount,
        date: user.date.split('/').map(el => el.length > 1 ? el : `0${el}`).reverse().join('-'),
        costCenterNum: user.cc.slice(3)
    };
    this.push(JSON.stringify(obj));
    callback();
  }
});


fs.readdirSync('./inputData')
    .forEach(el => combinedStream.append((next)=>{
            next(fs.createReadStream(`./inputData/${el}`));
        }));

combinedStream
    .pipe(csvConverter)
    .pipe(transformData)
    .on('error',(err) => console.log(err))
    .on('end', () => console.log('Transform Done'))
    .pipe(writeStream);