const http = require("http");
const hostname = "localhost";
const dt = require("./mymodule");
const port = 4000;
const fapp = require('fs');

const server = http.createServer((req, res) => {
res.statusCode = 200;
res.setHeader("Content-Type", "text/html");
switch (req.url) {
case "/home":
res.writeHead(200);
res.end("<h1>This is Home page</h1>");
break;
case "/about":
res.writeHead(200);
res.end(`<h1>This is About page ${dt.calc(10,100,"*")}</h1>`);
break;
case "/literature":
res.writeHead(200, "Content-Type","text/plain");
const fcontent = fobj.readFileSync(alice.txt);
res.end(`${fcontent.toString()}`);
break;
default:
break;
}
});
server.listen(port, hostname, () => {
console.log(`Server running at http://${hostname}:${port}/`);
});