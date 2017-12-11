let http              = require('http');
let url               = require('url');
var path              = require('path');
var express           = require('express');
var expressValidator  = require('express-validator');
var flash             = require('connect-flash');
var session           = require('express-session')
var passport          = require('passport');
var LocalStrategy     = require('passport-local').Strategy;
var logger            = require('morgan');
var qstring           = require('querystring');
var cookieParser      = require('cookie-parser');
var bodyParser        = require('body-parser');
var favicon           = require('serve-favicon')
var convert           = require('xml-js');
var handlebars        = require('express-handlebars')
var routes            = require('./routes/index');
var users             = require('./routes/users');
var Recipe            = require('./models/recipe');
var fs                = require('fs');
var inputFilePath     = "data/aLaCarteData_rev3.xml";
var app               = express();

var mongodb           = require('mongodb');
var mongoose          = require('mongoose');
mongoose.connect('mongodb://localhost/myapplication', {
  useMongoClient      : true,
});
var db                = mongoose.connection;


// view engine setup
//var handlebars = require('express-handlebars').create({defaultLayout:'layout'});
app.engine('handlebars', handlebars({extname: 'handlebars', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layouts/'}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');

// Favicon
app.use(favicon(path.join(__dirname, 'public/img', 'favicon.ico')));

// Bodyparser middleware
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Set static
app.use(express.static(__dirname + '/public'));

// Express session
app.use(session({
  secret            : 'secret',
  saveUninitialized : true,
  resave            : true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
    var namespace = param.split('.'),
    root          = namespace.shift(),
    formParam     = root;

    while(namespace.lenght) {
      formParam += '[' + namespace.shift() + ']';
    }

    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Connect flash
app.use(flash());

app.use(function(req, res, next){
  res.locals.success_msg  = req.flash('success_msg');
  res.locals.error_msg    = req.flash('error_msg');
  res.locals.error        = req.flash('error');
  res.locals.user         = req.user || null;
  next();
});



app.use('/users', users);
app.use('/', routes);

app.use(function(req, res, next){
  console.log("Looking for URL : " + req.url);
  next();
});

// Set port
app.set('port', process.env.PORT || 3000);

// Start server
app.listen(app.get('port'), function(){
  console.log("Express started on http://localhost:" + app.get('port') + ' press Ctrl+C to terminate');
});






// reading xml file (Given by prof)
fs.readFile(inputFilePath , function(err, data) {
  var result = convert.xml2json(data, {compact: true, trim: true, ignoreInstruction: true, spaces: 4});
  result = JSON.parse(result)
  for(var i = 0; i < result.recipes_xml.recipe.length; i++) {
    var obj = result.recipes_xml.recipe[i];
    var newRecipe = new Recipe({
      recipeName        : obj.recipe_name._text, 
      contributor       : obj.contributor._text, 
      category          : obj.category._text,
      description       : obj.description._text, 
      spices            : obj.spices._text,
      source            : obj.source._text,
      ingredients       : obj.ingredients._text,
      spices            : obj.spices._text,
      directions        : obj.directions._text,
      rating            : obj.rating._text
    });
    newRecipe.save();

  }
});
