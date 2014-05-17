
app.tetris.TemplateManager = {
    templates : {},

    get : function(id, htVars){
        var template = this.templates[id];

        if (template) {

            var result = _.template(template, htVars);
            return(result);

        } else {

            template = $.ajax({
                url : "./views/" + id + ".html",
                async : false
            }).responseText;

            this.templates[id] = template;
            var result = _.template(template, htVars);
            return(result);
        }
    }

};