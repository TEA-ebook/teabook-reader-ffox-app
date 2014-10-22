define("template/bookshelf/book", ["handlebars"], function(Handlebars) {
return Handlebars.default.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var lambda=this.lambda, escapeExpression=this.escapeExpression;
  return escapeExpression(lambda((depth0 != null ? depth0.name : depth0), depth0))
    + "\n";
},"useData":true}); });
