var mongoose        = require('mongoose');

var recipeSchema      = mongoose.Schema({
    recipeName: {
        type    : String,
        index   : true
    },
    contributor: {
        type    : String
    },
    category: {
        type    : String
    },
    description: {
        type    : String
    },
    spices: {
        type    : String
    },
    source: {
        type    : String
    },
    rating: {
        type    : String
    },
    ingredients: {
        type    : String
    },
    directions: {
        type    : String
    }
});

var Recipe = module.exports = mongoose.model('Recipe', recipeSchema);
