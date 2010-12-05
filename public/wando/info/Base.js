/* 
 此模块用于创建 Wando 基础数据的 add、delete、edit、show、list、select 6个基本功能
 其中除了 delete 没有单独的窗口外，其余的5个操作都有对应的窗口可以显示，方法分别为：
     add  : showAdd()
     edit : showEdit( recordId )
     show : showInfo( recordId )
     list : showList( id )
     select : showSelect( [ handler ] )  
 上面的5个窗口的 title，button 以及 button的事件，都可以通过构建时传入的 action 属性中指定。

 创建模块的基本写法为：
      Wando.supplier = new Wando.base.InfoModule( params ) ;
 
 params 的参数包含：
    record              数据记录，定义在Records.js中
    storeUrl            可选，指定store的URL，而不是通过Record获取。设置后可以通过 setUrl重新修改
    formPanelCreator    回调函数，用于创建add,edit,show窗口显示时要显示得 FormPanel
    columns             显示 list 的列信息
    operationBase       设置4操作链接如何调用，默认是 name.showXX
    beforeSetRecord     在把form的值赋值给record之前触发
    beforeSetFormValue  在把record的值赋值给form之前触发
    links               配置是否显示操作链接，默认全部显示，参数格式为：{ show:false, edit:false, remove:false, select:false, add:false };
    forceFit            当列太多时，将此参数设为false，则可以让列指定宽度而不是自适应宽度。
    queryFields         查询工具条要查询的域，具体可以查看info/里各个文件的用法，或者参考 MiniQueryBar.js
                        若不指定该项，则默认不显示
    extraButtons        要额外显示在list上的按钮，参数同Ext的button参数，如：
                        [{ text: "分配" },{ text: "删除", handler :function(){...} }]
    extraItems          添加额外的面板,position(top和bottom)指定模板在panel的哪个位置
                        extraItems:new Ext.FormPanel({ 
                          anchor:"100% 8%",
                          labelAlign: 'right',
                          position : "top",
                          frame: true,
                          items: [
                              {  xtype: 'label', width: 100, fieldLabel: "待分配数:100" }
                          ]
                        }),
    action :
      基本格式为（其中的参数 buttons 都是可选的）：
      actions: {
        //列表窗口属性 
        list: {
            title: "客户列表" ,//只有 title
        },
        //添加窗口的属性
        add: {
            title: "添加客户资料",
            closeAction: "nonw",  //窗口的关闭操作，如果是none，则不关闭，如果是 close，则关闭，默认是关闭
            buttons: [{
                text: '添加',
                handler: closeWindow
            },{
                // handler 函数在按钮被点击时触发,触发后可以获取 
                // Wando.customer.form 来获得所填的数据
                text: '取消',
                handler: closeWindow
            }]
        },
        edit: {
            title: "编辑客户资料",
            buttons: [{
                text: '更新',
                handler: closeWindow
            },{
                text: '取消', handler: closeWindow
            }] 
        },
        show: {
            title: "客户资料",
            buttons: [{
                text: '关闭',
                handler: closeWindow
            }] //
        },
        select: {  title: "请选择客户"  },
            //下面是可选
            deleteRecord: {
                handler: function(record) {  返回 false 则不进行删除 }
            }
        }    
*/

//====================================  Constructor  ====================================
//

Wando.base.InfoModule = function (params) {                  //混合构造/原型继承方式
    this.links = params.links ? params.links : {show:true,edit:true,remove:true,select:false,add:true,excel:false,copy:false};
    if(typeof this.links.add == "undefined" ) this.links.add = true;
    this.name        = params.record.prototype.name;         
    this.actions     = this.assignDefaultValues(params.actions); 
    this.columns     = params.columns;
  	this.Record      = params.record;
  	this.forceFit    = params.forceFit != undefined ? params.forceFit : true;
    this.hookFinishCreating = params.hookFinishCreating;
    this.hookFinishEditing  = params.hookFinishEditing;
    this.formPanelCreator   = params.formPanelCreator;	
    this.beforeSetRecord    = params.beforeSetRecord;
    this.beforeSetFormValue = params.beforeSetFormValue;
    this.bCloseAfterSelect  = params.bCloseAfterSelect == undefined ? true : params.bCloseAfterSelect;
    this.extraButtons       = params.extraButtons || [];
    this.extraLinks         = params.extraLinks || {};
    var url = params.storeUrl ? params.storeUrl : '/' + this.name+'s.json';
    this.store = this.createStore(url);
    this.operationBase = params.operationBase ? params.operationBase : "Wando."+ this.name;
    this.extraItems = params.extraItems;
    this.customerActionsHandler = params.customerActionsHandler || { };
}; 

//
//====================================  List Add Edit Show  ====================================
//
//
//==================================== begin of Wando.base.InfoModule.prototype
Wando.base.InfoModule.prototype = {
    
    // 获取 gridPanel，用于其他显示之用
    getListPanel : function() {
        if( this.gridPanel === undefined ){
            this.gridPanel = this.createGridPanel();
            //this.store.load({ params:{ offset: 0, limit: Wando.pageSize } });
            this.store.load();
        }
        return this.gridPanel ;
    },

    showList : function(id, loadStore) {   //如果不给予ID，则只进行了初始化工作。一把不给ID是用于初始化之用。
        loadStore = (loadStore == undefined ?  true : loadStore) ;
        this.gridPanel = this.createGridPanel();
        //if(loadStore) this.store.load({ params:{ offset: 0, limit: Wando.pageSize } });
        if(loadStore) this.store.load();
        //if (id) this.gridPanel.render(id);
    },

    showAdd : function() {
        var action = this.actions.add;
        this.showFormWin("add", action);
        this.form.reset();
    },

    showInfo : function(record) {
        this.showFormWin("info",this.actions.show);
        this.form.reset();
        this.form.setValues(record.data);
        if (this.beforeSetFormValue) this.beforeSetFormValue(record.data);
        this.form.items.each(function(item) {
            if (item.isXType("field")) item.setDisabled(true);
        });
    },

    showEdit : function(record) {
		    this.actions.editingRecord = record;                 
        this.showFormWin("edit", this.actions.edit);
        if (this.beforeSetFormValue) this.beforeSetFormValue(record.data);
        this.form.setValues(record.data);
    },

    deleteRecord : function(record) {
		var _this = this ;                          
        Ext.Msg.confirm("请确认：", "是否要删除该记录？删除后将无法恢复！",function(btnId) {
            if (btnId == 'yes') {
                if ( !_this.actions.deleteRecord.handler || _this.actions.deleteRecord.handler(r) == true )
                    record.ajaxDestroy({ 
                        success : function(){ _this.store.remove(record); },
                        failure : function(r){ Ext.Msg.alert('提示', Ext.decode(r.responseText).content.error_messages); }
                    
                    });
            }
        });
   },

    showSelect : function(handler, showSelectLink) {
        this.showSelectLink = showSelectLink == undefined ? true : showSelectLink ;
        this.actions.select.handler = handler;
        if( this.selectWin == undefined )
            this.selectWin = this.createSelectionWin();
        //this.store.load({ params: { offset: 0, limit: Wando.pageSize } });  
        this.store.load();
        this.selectWin.show();
        return this.selectWin;
    },

    selectHandler : function(record) {
        this.actions.select.handler(record);
        if ( this.bCloseAfterSelect && this.selectWin ) this.selectWin.hide();
    },
    
    copyHandler : function(record) {
        this.actions.copy.handler(record);
        if (  this.selectWin ) this.selectWin.destroy();
    },

    // 设置store的url
    setUrl: function(url, handler){
        this.store = this.createStore(url);
        //this.store.load({ params: { offset: 0, limit: Wando.pageSize } });  
        this.store.load();
        if(handler != undefined){
            this.store.on("load",function(store,records,options){ handler(store); });
        }
    },
    
    createStore: function(url){
        return new Ext.data.JsonStore({
            url: url,
            fields: this.Record,
            root: 'content'
    	  });
    },

    //==================================== Creation ====================================
    //
    createGridPanel : function() {
        var _this = this;
        var base = this.operationBase;

        var links = {};
        if ( _this.links.select )
            links["选择"] = scope(this,this.selectHandler) ;
        if ( typeof _this.links.show == "undefined" || _this.links.show )
            links["查看"] = scope(this,this.showInfo);
        if ( _this.links.copy )
            links["复制"] = scope(this,this.copyHandler ) ;
        if ( typeof _this.links.edit == "undefined" || _this.links.edit )
            links["编辑"] = this.customerActionsHandler.edit || scope(this,this.showEdit);
        if ( typeof _this.links.remove == "undefined" || _this.links.remove )
            links["删除"] = scope(this,this.deleteRecord) ;

        Ext.apply(links, this.extraLinks);
        var linkColumn = new Wando.LinkColumn({ header: "操作", width: 150, links:links }) ;
        
        return new Ext.Viewport({
            layout: "border",
            items: [
                Wando.menuStub,
                this.generatePanelItems(linkColumn)
            ]
        });
    },
    
    generatePanelItems: function(linkColumn){
        var _this = this;
        var result = [] ;
        
        var buttons = [];
        if(this.links.add) 
            buttons.push({ text: "添加", handler: this.customerActionsHandler.add || function() { _this.showAdd();} });
        buttons = buttons.concat(this.extraButtons);
        
        var grid = new Ext.grid.GridPanel({
            region: 'center',
            border: true,
            store: this.store,
            stripeRows: true,
            autoWidth: true,
            loadMask: {msg:"读取中..."},
            title: this.actions.list.title,
            tbar: buttons,
            columns: this.columns.concat([linkColumn]),
            plugins:[linkColumn],
            //bbar: new Wando.paginate.toolbar(this.store),
            viewConfig: { forceFit: this.forceFit }
        });
        result.push( grid ) ;
        
        return result ;
    },

    createSelectionWin : function() {
        var bbarHeight = 5;
        var name = this.name;
        var linkColumn = new Wando.LinkColumn({ header: "操作", width: 50, links:{
            "选择" : scope(this,this.selectHandler)
        }}) ;
        
        var items = [] ;
   
        var winItems,itemsHeightPer;

        if(this.extraItems != undefined)
            itemsHeightPer = 100 - Number(this.extraItems.anchor.split("% ")[1].split("%")[0]) - bbarHeight;
        else
            itemsHeightPer = 100 - bbarHeight;
        
        items.push(new Ext.grid.GridPanel({
            autoWidth: true,
            anchor:"100% " + itemsHeightPer.toString() + "%",
            store: this.store,
            plugins:[linkColumn],
            columns: (this.showSelectLink ? [linkColumn] : []).concat(this.columns),
            //bbar: Wando.paginate.toolbar(this.store),
            viewConfig: { forceFit: this.forceFit }
        })) ;

        if (this.extraItems != undefined && this.extraItems.position == "top")
            winItems = [this.extraItems,items];
        else if (this.extraItems != undefined && this.extraItems.position == "bottom")
            winItems = [items,this.extraItems];
        else
            winItems = [items];

        return new Ext.Window({
            title: this.actions.select.title,
            closeAction: 'hide',
            width: 600,
            height: 450,
            modal: false,
            layout: "anchor",
            items: [winItems]
        });
    },

    showFormWin : function(type, actions) {
        var formPanel = this.formPanelCreator(type);
        this.formWin  = new Ext.Window({
            title: actions.title,
            buttons: actions.buttons,
            layout: 'fit',
            closeAction: 'hide',
            closable : false,
            modal: true,
            items: formPanel
        });
        this.form = formPanel.form;
        this.formWin.show();
        this.formWin.center();
    },

    assignDefaultValues: function(actions){
        var _this = this ;                                    
        function closeWindow(action){ 
            if( action != undefined && _this.actions[action] != undefined && 
                    _this.actions[action].closeAction != undefined && _this.actions[action].closeAction === "none") 
            {
                _this.form.reset();
                return ;
            } 
            _this.formWin.hide(); 
            _this.formWin = undefined ;
            _this.form = undefined ;
    }
		
    function finishEditing() {
        if (_this.hookFinishEditing) 
            _this.hookFinishEditing();
        else {
            var record = _this.actions.editingRecord ;        
            record.setByForm(_this.form, _this.beforeSetRecord);                     
            record.ajaxUpdate({ 
                success: function(){ 
                    record.commit(); 
                    closeWindow("edit");
                },
                failure: function(response, opts) { 
                    var msg = Ext.decode(response.responseText).content.error_messages;
                    Ext.Msg.alert("提示", msg);
                }
		        });
        } 
        _this.store.reload();
		}

		function finishCreating() {
        if (_this.hookFinishCreating) 
            _this.hookFinishCreating();
        else {
            var record = new _this.Record({}) ;
            record.setByForm(_this.form, _this.beforeSetRecord);
            record.ajaxCreate({ 
                success : function(){ 
                    //_this.store.add(record);
                    //_this.store.load({ params: { offset: 0, limit: Wando.pageSize } }); 
                    _this.store.load();
                    closeWindow("add");
                },
                failure: function(response, opts) { 
                    var msg = Ext.decode(response.responseText).content.error_messages;
                    Ext.Msg.alert("提示", msg);
                }
            });
        }
    }
	
		if(!actions.deleteRecord) actions.deleteRecord = {handler:null};
		if(!actions.add.buttons) 
			  actions.add.buttons = [
            { text: '添加', handler: finishCreating },
            { text: '取消', handler: function() { closeWindow(); }}
        ];
        if(!actions.edit.buttons) 
            actions.edit.buttons = [
                { text: '更新', handler: finishEditing },
                { text: '取消', handler: function() { closeWindow(); }}
            ];
        if(!actions.show.buttons) 
            actions.show.buttons = [{ text: '关闭', handler: closeWindow }] ;
        return actions ;
    }
};
