TemplateManager = {
    templates : {},

    get : function(id, htVars, callback){
        var template = this.templates[id];

        if (template) {

            var result = _.template(template, htVars);

            i18nVars = {
            
                ko : {
                    sLabel : '이름'
                },
                
                en : {
                    sLabel : 'Name'
                }
            };
            
            
            _.templateSettings = {
                interpolate: /\{\{(.+?)\}\}/g
            };
            
            result2 = _.template(template, i18nVars['en']);
            
            callback(result2);

        } else {
            var that = this;
            $.get("/views/" + id + ".html", function(template){
                that.templates[id] = template;

                i18nVars = {

                    ko : {
                        CHAT : {
                            TALK_TO_MEMBER : '멤버에게 대화 <%=sName%> 요청수'
                        }
                    },

                    en : {
                        CHAT : {
                            TALK_TO_MEMBER : 'talk to member'
                        }
                    }
                };


                _.templateSettings = {
                    interpolate: /\{\{(.+?)\}\}/g
                };

                var result = _.template(template, i18nVars['ko']);

                
                _.templateSettings = {
                    interpolate: /<%=([\s\S]+?)%>/g
                };
                var result2 = _.template(result, htVars);
                
                callback(result2);
            });
        }
    }

};