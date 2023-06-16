const express = require('express');
const router = express.Router();
const Joi = require("joi");
const fobj= require('fs');
const mongoose = require('mongoose');
const json2html = require('node-json2html');
const bodyParser = require('body-parser');
const pug = require('pug');
const ejs = require('ejs');

const studentFN = "./studentdata.txt";
var students = [];
var dbConnected = false;

router.use(express.json());
//router.set('view engine','ejs');
router.use(bodyParser.urlencoded({extended:false}));
router.use(bodyParser.json({type:'[html, json]'}));
//router.use(bodyParser.raw({type:'*/*'}));

const studentSchema = new mongoose.Schema({
    //{"name":"Nguyễn Bính","DayOfBirth":15,"MonthofBirth":9,"YearofBirth":1978}
    name: String,
    DayOfBirth: Number,
    MonthofBirth: Number,
    YearofBirth: Number
});

const myStuCollection = 'mystudent';
const StudentClass =  mongoose.model(myStuCollection,studentSchema);
//const docStudent = new StudentClass();

let template_table_header = {
    "<>": "tr", "html": [
        {"<>": "th", "html": "name"},
        {"<>": "th", "html": "DayOfBirth"},
        {"<>": "th", "html": "MonthofBirth"},
        {"<>": "th", "html": "YearofBirth"}
    ]
}

let template_table_body = {
    "<>": "tr", "html": [
        {"<>": "td", "html": "${name}"},
        {"<>": "td", "html": "${DayOfBirth}"},
        {"<>": "td", "html": "${MonthofBirth}"},
        {"<>": "td", "html": "${YearofBirth}"}
    ]
}

//Show the student page
router.get('',(req,res)=>{
    /*if (dbConnected==false)
        res.sendFile(__dirname+'/stuPage1.html');
    else  res.sendFile(__dirname+'/stuPage2.html');*/

    //res.sendFile(__dirname+'/stuPage.html');
   //ejs.renderFile(__dirname+'/students/view/stuPage.ejs',{dirname:__dirname,dbConnected: dbConnected})
    //.then((html)=>{
        //console.log(html);
        //res.send(html);
    //})

    ejs.renderFile(__dirname + '/stuPage.ejs',{statusA: dbConnected})
        .then((htmlStr)=>{
            //console.log(htmlStr);
            res.send(htmlStr);
        })
        .catch((err)=>{res.send(err.message)});
    
});


//try to connect to the database named "mystudents"
const username = encodeURIComponent('myfirstweb');
const password = encodeURIComponent('truc1234');
const cloudname = encodeURIComponent('atlascluster.xmbeqhq.mongodb.net');
const stuDatabase = 'Students';
router.get('/connectDB',(req,res)=>{
    const urlCluster0 = 'mongodb+srv://khai:<password>@cluster0.lxlsyxj.mongodb.net/mystudent';
    //mongoose.connect('mongodb://localhost:27017/mystudents')
    //mongodb+srv://myfirstweb:<password>@atlascluster.xmbeqhq.mongodb.net/
    //mongodb+srv://${username}:${password}@${cluster}/?authSource=${authSource}&authMechanism=${authMechanism}
    //mongoose.connect('mongodb+srv://myfirstweb:truc1234@m10cluster.xmbeqhq.mongodb.net/students?retryWrites=true&w=majority')//?authMechanism=DEFAULT')
    mongodb
    .then(()=> {
        //this.use('students');
        //console.log('The database is already connected');
        res.status(200).send('The database is already connected');
        //showpage();
        dbConnected = true;
    })
    .catch(err => {
        console.error('could not connect to MongoDB',err);
        res.status(400).send(`could not connect to MongoDB ${err}`);
    });

    //console.log('successfully creating the model');
    function showpage(){
        let restext = "<html> <body>";
        restext = restext + "The database is already connected and modeled";
        restext = restext + "<form action=\"/api/courses/students\" method=\"get\">";
        restext = restext + "<input type=\"submit\" value=\"Trở về Student Home Page\">";
        restext = restext + "</form> </body> </html>"
        res.status(200).send(restext);
    }
    
});

router.get('/load', (req,res)=>{

    //eq = equal
    //ne = not equal
    //gt = greater than 
    //gte = greater than or equal to
    //lt = less then
    //lte = less then or equal to
    //in = in
    //nin = not in
 
    try{
        //const buf = fobj.readFileSync(studentFN);
        //students = JSON.parse(buf);

         
        //StudentClass.find({YearofBirth: {$lt: 2004, $gt: 1980}, MonthofBirth: 5})
        StudentClass.find().lean()
          .then((dbStudent)=>{
            console.log(dbStudent);
            const html = writeHtmlFromScoresJson(dbStudent,'./showstudent.html');
            res.send(html);
            /*ejs.renderFile(__dirname + '/student/view/loadStudent.ejs',{headers:dbStudent})
                .then((html)=>{
                    //console.log("2344554");
                    res.send(html);
                    fobj.writeFileSync(__dirname + '/student/view/loadStudent.html',html);
                    //res.sendFile(__dirname + '/student/view/loadStudent.html');
                })
                .catch((error=> {
                    console.log("1234");
                    console.log(error.message);}));
            res.send(html);
        })
        .catch((error)=> res.send(error.message));*/
    })}
    catch(err){
        res.status(400).send('Student File does not exists.');
    }
});

router.get('/newsave', (req,res)=>{
    try{
        fobj.writeFileSync(studentFN,JSON.stringify(students));
        res.status(200).send(`The student data is successfully stored to the file ${studentFN}`);
    }
    catch(err){
        res.status(400).send('Error Ocurred!!!!');
    }

});

router.get('/',(req,res)=>{
    res.status(200).send(students);
})

router.get('/append',(req,res)=>{
    res.status(200).sendFile(__dirname + '/appendPage.html');
}); 

router.post('/append',(req,res) => {
    //validate the student information
    console.log(req.headers['content-type']);
    console.log(req.body);
    const student = {
        name: req.body.name,
        DayOfBirth: req.body.dob,
        MonthofBirth: req.body.mob,
        YearofBirth: req.body.yob
    };
    const {error} = checkValidation2(student);
    if (error) return res.status(400).send('Bad Json input!!!'); 
    else{
        //res.status(200).send('The JSON input is ok.');
    }
    StudentClass
        .find(student)
        .then((dupstudent)=>{
            if (dupstudent.length == 0){
                const studentdata = new StudentClass(student);
                studentdata.save()
                           .then(result => console.log(result));
                res.status(200).send('Successfully Input Student' +  JSON.stringify(student) + 
                                               'to the Data!!');
            }
            else{
                res.status(400).send('this student alreadry existed :' + dupstudent);
            }
        })

    
})

function checkValidation2(student){
    const schema = {
        name: Joi.string().min(3).max(30).required(),
        DayOfBirth: Joi.number().integer().min(1).max(31).required(),
        MonthofBirth: Joi.number().integer().min(1).max(12).required(),
        YearofBirth: Joi.number().integer().min(1951).max(2023).required()
    }
    
    const result = Joi.validate(student,schema);
    if (result.error) return result; 
    
    const schema2 = {
        date: Joi.date().required()
    }
    
    const result2 = Joi.validate({"date": Date.parse(`${student.YearofBirth}-${student.MonthofBirth}-${student.DayOfBirth}`)},schema2);
    return result2;
 }

function writeHtmlFromScoresJson(jsonFile, htmlTableFile) {
    // let data = fs.readJsonSync(jsonFile);
    let data = jsonFile;

    let table_header = json2html.transform(data[0], template_table_header);
    let table_body = json2html.transform(data, template_table_body);

    let header = '<!DOCTYPE html>' + '<html lang="en">\n' + '<head><title>Lighthouse Report</title></head>'
    let body = '<h1>My Report</h1><br><table id="my_table">\n<thead>' + table_header + '\n</thead>\n<tbody>\n' + table_body + '\n</tbody>\n</table>'
    body = '<body>' + body + '</body>'

    let html = header + body + '</html>';

    return html;
}

function convertJS2HTML(jsarr){

}
module.exports = router;
module.exports.chkValidDate = checkValidation2;

