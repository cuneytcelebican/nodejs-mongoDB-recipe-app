var express     = require('express');
var router      = express.Router();
var qstring     = require('querystring');
var Recipe      = require('../models/recipe');

// home landing page render
router.get('/', function(req, res){
  res.render('landingPage', { title: 'FoodX | Login', bodyClass: 'registration', customNavbar: 'registration-navbar'});
});

// index render
router.get('/recipe', ensureAuthenticated, function(req, res){
  Recipe.find().then(function(doc){
    res.render('index', { items: doc, title: 'FoodX | Home Page', homeMenuClass: 'active', aboutMenuClass: '', username: req.user.username});
  })
});

// about page render
router.get('/about', ensureAuthenticated, function(req, res){
  res.render('about', { title: 'FoodX | About Project', homeMenuClass: '', aboutMenuClass: 'active', username: req.user.username});
});

// Search render with post / not using now
// https://stackoverflow.com/questions/38421664/fuzzy-searching-with-mongodb
router.post('/recipe?ingredients', ensureAuthenticated, function(req, res, next){
  const regex = new RegExp(escapeRegex(req.body.search), 'gi');
  console.log("POSTOBJ: ", regex);// sugar, salt
  Recipe.find({ "ingredients": regex }, function(err, searchDoc){
    if(err) {
      console.log(err);
    } else {
      res.render('search', { items: searchDoc, title: 'FoodX | Search Page', username: req.user.username});
    }
  })

});

// search render with get request
// I know this function looks ugly :)
router.get('/search*', ensureAuthenticated, function(req, res, next){
  var keyword, searchItem;

  console.log("spice is: ", req.query.spices)
  if (req.query.ingredients != undefined){
    searchItem = req.query.ingredients.split(",");
    keyword = req.query.ingredients;
  }
  else if (req.query.spices != undefined){
    searchItem = req.query.spices.split(",");
    keyword = req.query.spices;
  }
  else{
    req.flash('error_msg', 'You have to input something for search');
    res.redirect('/recipe');
  }
  
  keyword = keyword.split(",");
  console.log(keyword);
  for (i = 0; i < keyword.length; i++){
    keyword[i] = new RegExp(escapeRegex(keyword[i]), 'gi');
  }
  if (req.query.ingredients != undefined){
    Recipe.find(
      {'ingredients': {$in: keyword} 
      
      }, function(err, searchDoc){
        if(err) {
          console.log(err);
        } else {
          res.render('search', { items: searchDoc, title: 'FoodX | Search Page', searchKeywords: searchItem,  username: req.user.username});
        }
      });
  }
  else {
    Recipe.find(
      {'spices': {$in: keyword} 
      
      }, function(err, searchDoc){
        if(err) {
          console.log(err);
        } else {
          res.render('search', { items: searchDoc, title: 'FoodX | Search Page', searchKeywords: searchItem,  username: req.user.username});
        }
      });
  }
});

// Recipe details page with get method
router.get('/recipe/:recipeId', ensureAuthenticated, function(req, res, next){
  var id = req.params.recipeId;
  console.log("GETOBJ: ", id);
  Recipe.findOne({ "_id": id }, function(err, searchDoc){
    if(err) {
      console.log(err);
    } else {
      res.render('recipeDetails', { items: searchDoc, title: 'FoodX | Recipe Page', username: req.user.username});
    }
  })

});

// update data page get method
router.get('/update/:recipeId', ensureAuthenticated, function(req, res, next){
  var id = req.params.recipeId;
  console.log("GETOBJ: ", id);
  Recipe.findOne({ "_id": id }, function(err, searchDoc){
    if(err) {
      console.log(err);
    } else {
      res.render('update', { items: searchDoc, title: 'FoodX | Update Data', username: req.user.username});
    }
  });
});



// update recipe post method
router.post('/update/:recipeId', ensureAuthenticated, function(req, res, next){
  var id = req.params.recipeId;
  console.log("id: ", id);
  Recipe.findOneAndUpdate({"_id": id}, 
  { $set: {"recipeName"  : req.body.recipename, 
          "contributor"  : req.body.contributor,
          "category"     : req.body.category,
          "description"  : req.body.description,
          "ingredients"  : req.body.ingredients,
          "directions"   : req.body.directions,
          "spices"       : req.body.spices,
          "source"       : req.body.source,
          "rating"       : req.body.rating
          }
  },
  { new: true }, function(err, result){
    if(err) {
      console.log(err);
    } else {
      console.log("data updated");
      res.render('recipeDetails', { items: result, title: 'FoodX | Recipe Page', homeMenuClass: 'active', aboutMenuClass: '', username: req.user.username, success_msg: 'Data successfully updated'});
    }
  });
});

// insert page render get method
router.get('/insert', ensureAuthenticated, function(req, res){
  res.render('insert', { title: 'FoodX | Insert new recipe', username: req.user.username});
});

// insert recipe post method
router.post('/insert', function(req, res, next){
  var newRecipe = new Recipe({
    recipeName        : req.body.recipename,
    contributor       : req.body.contributor,
    category          : req.body.category,
    description       : req.body.description,
    spices            : req.body.spices,
    source            : req.body.source,
    ingredients       : req.body.ingredients,
    spices            : req.body.spices,
    directions        : req.body.directions,
    rating            : req.body.rating
  });
  newRecipe.save();
  req.flash('success_msg', 'A new recipe successfully added to database');
  res.redirect('/recipe');
});

// delete get method
router.get('/delete/:recipeId', ensureAuthenticated, function(req, res, next){
  var id = req.params.recipeId;
  console.log("GETOBJ: ", id);
  Recipe.deleteOne({ "_id": id }, function(err, searchDoc){
    if(err) {
      console.log(err);
    } else {
      req.flash('success_msg', 'A recipe successfully deleted from database');
      res.redirect('/recipe');
    }
  });
  
});


// junk render
router.get('/junk', ensureAuthenticated, function(req, res, next){
  console.log('Tried to access /junk');
  throw new Error('/junk does not exist');
});

// successful
router.all(function(request, response, next) {
  response.writeHead(200, {'Content-Type': 'text/plain'});
  next();
})

// handling error message
router.use(ensureAuthenticated, function(err, req, res, next){
  console.log("Error : " + err.message);
  next();
});

// cacth 404 error
router.use(ensureAuthenticated, function(req, res){
  res.type('text/html');
  res.status(404);
  res.render('404');
});

// cacth 500 server error
router.use(ensureAuthenticated, function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.render('500', {username: req.user.username});
});

function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  else{
    req.flash('error_msg', 'You are not logged in');
    res.redirect('/');
  }
}

// https://stackoverflow.com/questions/38421664/fuzzy-searching-with-mongodb
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;

