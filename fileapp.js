const fileobj = require('fs');

const filecontent = fileobj.readFile('./alice.txt',(err,data)=>{
    if (err) {
    console.log(`The application contains error: ${err.errno}, ${err.message}`);
    return;
    }
    console.log(`the application successfully read file. The content is ${data.toString()}`);
});

