
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Collaborative Draw' });
};

exports.list = function(req, res){
  res.render('list', { title: 'List Available Images' });
};