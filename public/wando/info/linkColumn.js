/*!
 * Ext JS Library 3.0.0
 * Copyright(c) 2006-2009 Ext JS, LLC
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
Ext.ns('Ext.ux.grid');

/**
    // create LinkColumn with links
    var linkColumn = new Wando.LinkColumn({
        header: 'Foo',
        // 还可以加入 Column 的任何参数，如 width:150 
        links:{ 
            "name1" : function(record, rowIndex, columnIndex){ ... }  
            "name2" : {
                click: function(record, rowIndex, columnIndex){ ... } ,
                condition : function(record){ ... }  // 返回 false，则不显示该链接
            }
            "default" : value   // 当最终的链接为空时，则使用该值
        } 
    });

    // create the grid with LinkColumn
    var grid = new Ext.grid.EditorGridPanel({
        ...
        columns:[
            ....,
            linkColumn
        ],
        plugins: [checkColumn], // include plugin
        ...
    });
    
**/
 
Ext.ux.grid.LinkColumn = function(config){
    Ext.apply(this, config);
    if(!this.id){
        this.id = Ext.id();
    }
    for (var name in this.links){
        if( typeof this.links[name] == "function"  ){
            this.links[name] = {
                click: this.links[name],
                condition: this.cbTrue
            };
        }
    }
    this.renderer = this.renderer.createDelegate(this);
    this.dataIndex = "#" ;
    
    Ext.ux.grid.LinkColumn.instanceCount++ ;
    this.linkClassName = Ext.ux.grid.LinkColumn.linkClassNamePrefix+Ext.ux.grid.LinkColumn.instanceCount ;
};
//  每个 LinkColumn 生成的 <a>，都会按照这种方式加入 class
//      linkClassNamePrefix + instanceCount
//  在出发事件时，会判断该链接的 class 是否与该LinkColumn一致，从而在多个LinkColumn时能够由正确的来处理
Ext.ux.grid.LinkColumn.instanceCount = 0 ;
Ext.ux.grid.LinkColumn.linkClassNamePrefix = "LinkColumn-" ;

Ext.ux.grid.LinkColumn.prototype ={
    init : function(grid){
        this.grid = grid;
        this.grid.on("cellclick",this.onCellClick,this);
    },

    onCellClick : function(gridPanel, rowIndex, columnIndex, e){
        if(e === undefined) return false ;
        var t = e.target ;
        if(t.className && t.className === this.linkClassName ){
            if(this.links[t.text]) {
                var record = gridPanel.getStore().getAt(rowIndex) ;
                this.links[t.text].click(record, rowIndex, columnIndex) ;
            }
            return false ;
        }
    },

    renderer : function(v, p, record){
        var strLinks = "" ;
        for (var name in this.links) {
            if( name != "default" && this.links[name].condition(record) ){
                if( this.links[name].click )
                    strLinks += ' <a href="#" class="'+ this.linkClassName +'">'+name+'</a> ' ;
                    // 在有 click 事件时才显示链接
                else
                    strLinks += name;
            }
        };
        // 对于空的列，则显示默认的文字
        if(strLinks.length === 0 && this.links["default"] ) strLinks = this.links["default"];
        return strLinks ;
    },
    
    cbTrue: function(){ return true ; }
};

// register ptype
Ext.preg('linkcolumn', Ext.ux.grid.LinkColumn);

// backwards compat
Wando.LinkColumn = Ext.ux.grid.LinkColumn;

// Helpers
// 删除记录
Wando.LinkColumn.deleteRecord = function(store,msg){
    return function(record, rowIndex, columnIndex) {
        Ext.Msg.confirm("确认", msg, function(btn){
            if (btn == 'yes')
                store.removeAt(rowIndex);
        });
    } ;
};
