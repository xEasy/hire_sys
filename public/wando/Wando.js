// 全局变量和共用代码

Wando = { base: {}, records: {} };

//Hack JsonStore
Ext.apply(Ext.data.JsonStore.prototype, { 
    //JsonStore添加loadByUrl方法
    loadByUrl: function(url, maskID, options) { 
        if(!options) options = { params: {} };
        var oldURL = this.proxy.conn.url;
        this.proxy.setApi({ read: url });

        if(maskID) { 
            var mask = new Ext.LoadMask(Ext.get(maskID), { msg: "loading..." });
            mask.show();
        }

        this.load({ 
            params  : options.params, 
            callback: function() { 
                mask && mask.hide(); 
                options.callback && options.callback();
            },
            scope   : options.scope,
            add     : options.add
        });
        this.proxy.setApi({ read: oldURL });
    },

    autoSort: function(columnName) { 
        var basic = 1;
        this.each(function(record) {
            record.data[columnName] = basic;
            record.commit();
            basic ++;
        });
    },

    exportExcel: function() {
        if (this.totalLength == 0 ) {
          Ext.MessageBox.alert("提示：", "您要导出的数据为空");
          return ;
        }
        var params = this.previousLoadParams ? this.previousLoadParams.params : {} ;
        params.excel_type = this.excel_type ; 
        var loadUrl = this.loadUrl || this.proxy.url ;
        var exportUrl = Ext.data.JsonStore.prototype._railsUrlEncode(loadUrl, params) ;
        exportUrl = Ext.urlAppend( exportUrl, "exportTo=xls" ) ;
        window.open(Ext.urlAppend( '/exports/export', Ext.urlEncode({
          url   : exportUrl,
          count : this.totalLength
        })));
    },

     _railsUrlEncode :function(url, params) {
        var newParam = {} ;
        Ext.data.JsonStore.prototype._objectParams( newParam, params, "" ) ;
        return Ext.urlAppend( url, Ext.urlEncode(newParam) ) ;
    },

     _objectParams :function (newParam, params, paramPrefix){
        var noPrefix = (paramPrefix == '') ;
        for (var paramName in params) {
            var param = params[paramName] ;
            if (param == undefined) continue ;
            if( param instanceof Array  ) {
                var name = (noPrefix?'':paramPrefix)+paramName.replace(/\[\]$/,'')+(noPrefix?'':']')+'[]';
                newParam[name] = param ;
            }
            else if( param instanceof Object ) {
                var prefix = (noPrefix?'':paramPrefix)+paramName+(noPrefix?'':']')+'[' ;
                Ext.data.JsonStore.prototype._objectParams(newParam, param, prefix) ;
            }
            else{
                var name = (noPrefix?'':paramPrefix)+paramName+(noPrefix?"":"]");
                newParam[name] = param ;
            }
        };
    }
});


//Hack Ext.layout.BorderLayout.Region.prototype
Ext.layout.BorderLayout.Region.prototype.defaultEWCMargins.left = -1;



//Hack Array
Ext.apply(Array.prototype, { 
    each: function(handler) { 
        for(var i=0; i<this.length; i++) { 
            handler(this[i]);
        }
    }
});


//权限管理
/*
  参数:
    params = {
      "users"       :["create","destroy","edit","index","new"],
      "requisitions":["update_progress","cancel","approve","unapprove","index"]
    }
*/
Wando.PermissionManager = function(params) { 
    this.params = Wando.deepCopy(params || {});
}
Wando.PermissionManager.prototype = { 
    permittedTo: function(action, controller) { 
        if(!this.params[controller]) return false;
        return Wando.ifContain(this.params[controller], action);
    },

    //给定一个controller，返回当前用户在这个controller中的权限
    permissionsOf: function(controller) { 
        var rs = [];
        if(!this.params[controller]) return [];

        for(key in this.params[controller]) { 
            if(key !== "remove") rs.push( this.params[controller][key] );
        }
        return rs;
    }
};
//------------------------------------------------------------------------------

Ext.apply(Wando, { 
    
    dateEditor: new Ext.grid.GridEditor( new Ext.form.DateField({ format:"Y-m-d", editable: false }) ),
  
    dateRender: function( value ){
       return ( value && value.constructor == Date ) ? value.dateFormat( "Y-m-d" ) : value;
     },

    //衣车ComboBox
    sewCombo: new Ext.form.ComboBox({
            typeAhead: true,
            triggerAction: 'all',
            enableKeyEvents: true,
            editable: false,
            lazyRender: true,
            store: new Ext.data.JsonStore({
              root: 'content',
              proxy: new Ext.data.HttpProxy({ url: '/sew/for_select.json',method: 'GET' }),
              fields: ['name','id']
            }),
            valueField: 'name',
            displayField: 'name',
            listeners: {
              select: function( combo, record, index ) {
                  r = record;
                  var scope = Wando.AddSewHireOrder;
                  var selectedRecord  = scope.grid.getSelectionModel().selection.record;
                  selectedRecord.data.sew_id = record.get( "id" );
                  selectedRecord.commit();
                  combo.fireEvent( 'blur' );
              }
            }
    }),
    //菜单栏占位
    menuStub: new Ext.Panel({ 
        region: 'north',
        border: false,
        split : false,
        height: 60
    }),

    //数组相与
    //Wando.__([1, 2, 3], [2, 5])  =>  [2]
    __: function(arr1, arr2) { 
        r = [];
        for(i=0; i<arr1.length; i++) { 
            if( arr2.indexOf(arr1[i]) != -1 ) r.push(arr1[i]);
        }
        return r;
    },

    //深复制
    deepCopy: function(obj) { 
        if(typeof obj == "object") { 
            var newObj = {};
            for(k in obj) { 
                newObj[k] = Wando.deepCopy(obj[k]);
            } 
            return newObj;
        } else { 
            return obj;
        }
    },

    //查询对象中(可理解为Json) 是否存在element
    ifContain: function(obj, element) { 
        for(k in obj) { 
            if(obj[k] == element) return true;
        }
        return false;
    },

    createPagingToolbar: function(store, items) {  
        var bar = new Ext.PagingToolbar({ 
            pageSize      : Wando.pageSize,
            beforePageText: "第",
            afterPageText : "/ {0}页",
            displayMsg    : "显示 {0} - {1} 总 {2} 条记录 ",
            emptyMsg      : "没有相关记录",
            displayInfo   : true,
            store         : store,
            items         : items
        });

        bar.paramNames = { 
            start: "offset", 
            limit: "limit", 
            sort : "sort",
            dir  : "dir"
        };
        return bar;
    },

    failureHandler: function(response, opts) { 
        var msg = Ext.decode(response.responseText).content.error_messages;
        Ext.Msg.alert("提示", msg);
    },

    //打印query当前搜索出来的内容
    print: function(query, request_url, extraParams) {
        var queryOptions = query.findQueryOptions("current"); 
        extraParams = extraParams || { };

        Ext.Ajax.request({ 
            url:    '/prints/set_session',
            method: 'POST',
            jsonData: { query_options: Ext.apply(extraParams, queryOptions) },
            success: function() { window.open(request_url) },
            failure: function() { Ext.Msg.alert('提示', '打印操作失败'); } 
        });
    },

  

    //编码成rails能够识别的url
    //{ name: 'tracy', sex: 'male' }        
    //    |
    //    url -> "name=tracy&sex=male"
    //        |
    //        rails -> { :name => 'tracy', :sex => 'male' }
    //----------------------------------------------------------
    //{ name: 'tracy', ids: [1, 2, 3, 4, 5] }
    //    |
    //    url -> "name=tracy&ids[]=1&ids[]=2&ids[]=3&ids[]=4&ids[]=5"
    //        |
    //        rails -> { :name => 'tracy', :ids => [1, 2, 3, 4, 5] }
    //----------------------------------------------------------
    //{ name: 'tracy', friend: { name: 'lucy', sex: 'female' } }
    //    |
    //    url -> "name=tracy&friend[name]=lucy&friend[sex]=female"
    //        |
    //        rails -> { :name => 'tracy', :friend => { :name => 'lucy', :sex => 'female' } }
    //----------------------------------------------------------
    //{ name: 'tracy', friends: [ { name: 'lucy', sex: 'female' }, { name: 'lili', sex: 'female' } ] }
    //    |
    //    url -> "name=tracy&friends[][name]=lucy&friends[][sex]=female&friends[][name]=lili&friends[][sex]=female"
    //        |
    //        rails -> { :name => 'tracy', :friends => [{ :name => 'lucy', :sex => 'female' }, { :name => 'lili' }] }
    //----------------------------------------------------------
    urlEncode: function(base, obj, postfix) { 
        var r = "";
        var isArray = obj instanceof Array;

        for(k in obj) { 
            var e = (obj[k] instanceof Date) ? obj[k].format('Y-m-d') : obj[k];
            var key = isArray ? '' : k;

            if(e instanceof Function) continue;
            if(e instanceof Object)
                r += arguments.callee( String.format('{0}[{1}]', base, key), e, true );
            else
                r += String.format('{0}[{1}]={2}&', base, key, e);
        }
        return postfix ? r : r.substring(0, r.length-1);
    },

    pageSize: 10,

    //A4纸高度像素
    pageHeight: 830,

    newTextArea: function(gridId) { 
        var textArea = new Ext.form.TextArea({
            listeners: { 
                show: function(textArea) { 
                    var grid = Ext.getCmp(textArea.gridId);
                    
                    try { 
                        var rowIndex = grid.selModel.selection.cell[0]; 
                    } catch(ex) { 
                        /*do something*/ 
                    }

                    var h = grid.view.getRow(rowIndex).offsetHeight;
                    var adjust = 2; //调整高度
                    textArea.setHeight(h - adjust);
                }
            }
        });
        textArea.gridId = gridId;
        return textArea;
    }

});



scope = function(obj, fun) {
    return fun.createDelegate(obj);
}

