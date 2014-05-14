app.tetris.AccountInfo = {
    userId :'',
    passwd : '',
    bAvail : false,
    listeners : [],

    setAccount : function(sUserId, sPasswd){
        this.userId = sUserId;
        this.passwd = sPasswd;
    },

    getAccount : function(){
        return {
            userId : this.userId,
            passwd : this.passwd
        }
    },
    
    on : function(sEvent, fn){
        this.listeners = _.filter(this.listeners, function(item){ return item.sEvent !== sEvent});
        this.listeners.push({ fn : fn, sEvent : sEvent});
        return this;
    },

    save : function(){
        if(this.userId === '' || this.userId === ''){
            return;
        }
        
        window.localStorage.setItem('account', JSON.stringify({
            userId : this.userId,
            passwd : this.passwd
        }));
    },
    
    load : function(){
        var sAccount = window.localStorage.getItem('account');
        var htAccount = JSON.parse(sAccount) || {}; 
        this.userId = htAccount.userId;
        this.passwd = htAccount.passwd;
    },
    
    clear : function(){
        window.localStorage.removeItem('account');
        this.userId = '';
        this.passwd = '';
        this.bAvail = false;
    },
    
    broadcast : function(sEvent){
        _.each(this.listeners, function(evt){
            if(evt.sEvent === sEvent){
                evt.fn();
            }
        });
        return this;
    },

    isAuthenticated : function(){
        return this.bAvail;
    }
};