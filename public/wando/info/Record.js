        
//  Wando.records.create({ name(必须), field(必须), skip(可选) }) 
//      从该Record生成的Record将获得额外的功能
//      name 是Record的名称，其后的Ajax操作将以此生成URL
//      field...
//      skip，在调用toJSON时不想转换的域
//      baseUrl:没定义时，以/[name]s.json的方式发送
//              定义时，以/[baseUrl].json的方式发送

Wando.records.create = function( config ) {
    var record = Ext.data.Record.create(config.fields);
    record.prototype.name        = config.name;                 
    record.prototype.root        = config.root ? config.root : config.name;
    record.prototype.baseUrl     = config.baseUrl ? config.baseUrl : config.name+'s' ; 
    record.prototype.skipFields  = config.skip ? config.skip : [] ;
    record.prototype.disableAjax = (config.name === undefined && config.baseUrl === undefined) ;
    return record ;
};

Ext.data.Record.prototype.validate = function(){
    if(this.disableAjax === undefined || this.disableAjax) 
        Ext.MessageBox.alert("错误", "record没有设置 name 或 baseUrl，所以不允许进行Ajax操作");
    return !this.disableAjax ;
};

// Record.setByForm  
//      从BasicForm中获取Record所需要的field。如果form中存在Record所无的属性，则忽略。如：
//       var form = formPanel.getForm(); //  form的name域 == "hello"
//       var cus = new Customer ;
//       cus.setByForm(form) ; //=> cus.data.name == "hello"
Ext.data.Record.prototype.setByForm = function(form, callback){
    if( !this.validate() ) return ;
	      var values = form.getValues();
    if(callback != undefined) callback(values);
	    for (var index in this.fields.items) {                        
            var name = this.fields.items[index].name ;            
            if( typeof values[name] != "undefined" )
                this.data[name] = values[name] ;
	    }
	    return this ;
};

//  Record.ajaxDestroy( handlers = { success(可选) : function, failure(可选) : function } )  
//      进行destroy请求，删除该Record所持有的id这条记录
Ext.data.Record.prototype.ajaxDestroy = function( handlers ) {
    if( !this.validate() ) return ;
    Ext.Ajax.request({ 
        url: '/'+this.baseUrl+'/'+this.id+".json",
        method:"delete",
        success: handlers.success,
        failure: handlers.failure ? handlers.failure : Wando.callbackAlertError
    });
};

//  Record.ajaxUpdate( handlers = { success(可选) : function, failure(可选) : function } )  
//      进行update请求，远程更新该记录的属性。这些属性保存在 Record.data中，用法为：
//       customer.data.name = "new name" ;
//       customer.ajaxUpdate();
Ext.data.Record.prototype.ajaxUpdate = function( handlers ) {
    if( !this.validate() ) return;
	var data = {} ;
    data[this.root] = this.toJSON();
    if(handlers.beforeUpdate) handlers.beforeUpdate(data, this);
	  Ext.Ajax.request({ 
          url: '/'+this.baseUrl +'/'+this.data.id+".json",
		  method: "put",
		  jsonData: data,
		  success: handlers.success,
		  failure: handlers.failure ? handlers.failure : Wando.callbackAlertError
	  });
};

//  Record.ajaxCreate( handlers = { success(可选) : function, failure(可选) : function } )  
//      进行create请求，用该记录的属性远程创建新记录、若创建成功，则会自动更新Record的id，例如
//       var customer = new Customer({},-1)  
//       customer.data.name = "new name" ;
//       customer.ajaxCreate();
//       customer.id = 创建后的新id
Ext.data.Record.prototype.ajaxCreate = function( handlers ) {
    if( !this.validate() ) return ;
	  var data = {};
    data[this.root] = this.toJSON();
	  var _this = this ;
	  Ext.Ajax.request({ 
	      url: '/'+this.baseUrl+'.json',
	      method:"post",
        jsonData:data,
        success: function(response,a) {
            _this.data.id = eval(response.responseText).content.id ;
            _this.commit(); 
            handlers.success(response,a) ;
        },
        failure: handlers.failure ? handlers.failure : Wando.callbackAlertError
	  });
};

//  Record.toJSON()  
//      将Record转为Object对象，并且忽略创建Record时给予的 skip 选项
//       customer.data.name = "new name" ;
//       customer.toJSON();  //=> { name : "new name" ... }
Ext.data.Record.prototype.toJSON = function( ) {
    var json = {};
    for (var i=0; i < this.fields.items.length; i++) {
        var name = this.fields.items[i].name ;
        if(this.skipFields.indexOf(name) != -1) continue ;
        json[name] = this.data[name] ;
    }
    return json ;
};

