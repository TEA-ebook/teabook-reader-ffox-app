define("template/bookshelf/index", ["handlebars"], function(Handlebars) {
return Handlebars.default.template({"1":function(depth0,helpers,partials,data) {
  var lambda=this.lambda, escapeExpression=this.escapeExpression;
  return "    <div class=\"shelf-tab\" id=\"shelf-"
    + escapeExpression(lambda((depth0 != null ? depth0.id : depth0), depth0))
    + "\"></div>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1;
  stack1 = helpers.each.call(depth0, (depth0 != null ? depth0.shelves : depth0), {"name":"each","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { return stack1; }
  else { return ''; }
  },"useData":true}); });
