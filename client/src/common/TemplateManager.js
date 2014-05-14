TemplateManager = {
    templates : {},

    get : function(id, htVars, callback){
        var template = this.templates[id];

        if (template) {

            var result = _.template(template, htVars);
            callback(result);

        } else {
            var that = this;
            $.get("/views/" + id + ".html", function(template){
                that.templates[id] = template;

                var result = _.template(template, htVars);

                callback(result);
            });
        }
    }

};