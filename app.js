// Get Requirements and instances of them
const express= require('express');
const cors= require('cors');
const bodyParser= require('body-parser');
const mongoose= require('mongoose');
const shortUrl=require('./models/shortUrl')
const app = express();
app.use(bodyParser.json());
app.use(cors());

mongoose.connect('mongodb+srv://loukdev:cheloulou04@cluster0-n0gfx.mongodb.net/urlShotner?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log('MongoDB Connected...'))
    .catch((err) => console.log(err))
//Allows node to find the content
app.use(express.static(__dirname + '/public'));

//Create the database entry
app.get('/new/:UrlToShorten(*)', (req,res,next)=>{
    var {UrlToShorten} = req.params;
    //Regex for url

    var expression= /[-a-zA-z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-z0-9@:%_\+.~#?&//=]*)?/gi;
    var regex= expression;
    if(regex.test(UrlToShorten)==true){
        var short= Math.floor(Math.random()*1000000).toString();

        var data= new shortUrl(
            {
                originalUrl: UrlToShorten,
                shorterUrl: short
            }
        );

        data.save(err=>{
            if (err){
                return res.send('error savaing to database');
            }
        });

       return res.json({data})
    }
    var data= new shortUrl({
        originalUrl: 'urltoshorten does not match standard format',
        shorterUrl: 'InvalideUrl'
    });
    return res.json(data);
});

// query database and forward to originalUrl
app.get('/:urlToFoward', (req,res, next)=>{
    var shorterUrl= req.params.urlToFoward;
    shortUrl.findOne({'shorterUrl': shorterUrl}, (err,data)=>{
        if(err) return res.send('error reading database');
        var re = new RegExp("^(http|https://", "i");
        var strToCheck = data.originalUrl;
        if(re.test(strToCheck)){
            res.redirect(301, data.originalUrl);
        }
        else{
            res.redirect(301,'http://' + data.originalUrl);
        }
    });
});





//Verify if everything is working
app.listen(process.env.PORT || 3000, ()=>{
    console.log('Everything is working');
});