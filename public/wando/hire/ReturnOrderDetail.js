
Wando.pageSize = 15;

Wando.ReturnOrderDetail = {
  init: function  () {
    this.pm = new Wando.PermissionManager( Wando.erbData.allPermitted );
    
    this.grid = this.createGrid();
    this.gridStore = this.grid.store;

    this.tree = this.createTree();

    var tmp = [{ content: "sew_return_order/department/name" , condition: "equals", value: Wando.erbData.department_name }];
    var defaultCcv = this.pm.permittedTo('view_all', 'sew_return_orders') ? undefined : tmp;
    
    
    this.query = new Wando.base.Query({
        modelName      :  'return_item',
        outterGrid     :  this.grid,
        pagingToolbar  :  this.pagingToolbar,
        queryHandler   :  this.queryHandler,
        valueFieldConfigKey : 'returnOrderDetail',
        defaultCcv     :  defaultCcv
    });

    this.settingQuery();

    new Ext.Viewport({
      layout : 'border',
      frame : true,
      items : [
        Wando.menuStub,
        {
          region : 'center',
          layout : 'anchor',
          items  : [ this.grid ]
        },
        this.tree
      ]
    });

    var defaultOptions = this.query.createQueryOptions( "default", [], { sort: "sew_return_order_id", dir: "DESC" } );
    this.query.work( defaultOptions,null,{ success: this.queryHandler } );
    this.tree.root.appendChild(new Ext.tree.TreeNode({
        text: "全部",
        leaf: true
      }));
  },

  queryHandler: function(response, opts) { 
      var scope = Wando.ReturnOrderDetail;
      if (!scope.pm.permittedTo( 'view_total','return_items' )) {return false;};
      var queryOptions = scope.query.findQueryOptions('current');
      var queryContent = ['count'];
      queryContent.push( 'total' );
      var currentQueryOptions = queryOptions;

      scope.query.sum(currentQueryOptions, queryContent, { 
          success: function(response, opts) { 
              var content = Ext.decode(response.responseText).content;
              var b = '&nbsp&nbsp&nbsp&nbsp&nbsp';

              var html = String.format('<b>数量合计:{0}{1}</b>', content.count, b);
              if(content.total) html += String.format('<b>总价:{0}</b>', content.total)

              Ext.get('sumInfo').dom.innerHTML = html;
          }
      });

      queryOptions.ccv.push( {content:"state_cn",condition:"equals",value:"未付款"} );
      
      scope.query.sum(queryOptions, queryContent, { 
          success: function(response, opts) { 
              var content = Ext.decode(response.responseText).content;
              var b = '&nbsp&nbsp&nbsp&nbsp&nbsp';

              var html = String.format('<b>未付款数量合计:{0}{1}</b>', content.count, b);
              if(content.total) html += String.format('<b>未付款总价:{0}</b>', content.total)

              Ext.get('sumInfo2').dom.innerHTML = html;
          }
      });
    queryOptions.ccv.pop();
  },
  
  printReturnDetails: function  () {
    Wando.print( Wando.ReturnOrderDetail.query,'prints/print_return_items');
  },

  batchProcess: function( action, remark, state_cn ) {
    var scope = Wando.ReturnOrderDetail;
    var selections = scope.grid.getSelectionModel().getSelections();
    if( selections.length == 0 ) { Ext.Msg.alert( '提示', "未选取任何退车记录" ); return; }

    var ids = [];
    for (var i = 0; i < selections.length; i++) {
      var record = selections[ i ];
      ids.push( record.get( "id" ) );
    };

    Ext.Ajax.request( {
      url: String.format( "/return_items/{0}.json",action ),
      method: 'PUT',
      jsonData: { id:ids },
      success: function( response, opts ){
        var scope = Wando.ReturnOrderDetail;
        scope.changePayStateValue(selections,state_cn);
      },
      failure: function() {
        remark = remark || "";
         // var msg = eval( response.responseText ).content.error_messages;
        var msg = String.format( '不能{0},请确认所选取的退车单状态。',remark );
        Ext.Msg.alert( '提示',msg );
      }
    } );
  },
  
  changePayStateValue: function  (selections,state_cn) {
    for (var i = 0; i < selections.length; i++) {
      var record = selections[i];
      record.set("state_cn",state_cn);
    };
  },

  createTree: function  () {
    var scope = this;

    if (!this.pm.permittedTo( 'view_garage','return_items' )) {
      return false;   //Or构造新的状态选择树？？默认为车行，没有车行查看权限时不构造此状态树。
    };

    this.root = new Ext.tree.AsyncTreeNode({
      text: '车行',
      expanded : true,
      draggable : false
    });
    
    return new Ext.tree.TreePanel({
      useArrows: true,
      autoScroll: true,
      root : this.root,
      width : 120,
      title : '车行',
      region : 'west',
      collapsible : true,
      loader: new Ext.tree.TreeLoader({ dataUrl: 'hire_items/garage_tree.json' }),
      listeners: {
        "click" : function( node ){
          //grid显示对应车行数据
          scope.loadReturnDetail(node.text);
        }
      }
    });
  },

  createGrid: function  () {
    var scope = this;

    function renderColorState(value) {
      if (value == '已付款') {
          return "<span style='color:green;'>已付款</span>";
      } else if( value == '未付款' ) {
          return "<span style='color:red;'>未付款</span>";
      } else {
          return value
      }
    };

    var sm = new Ext.grid.CheckboxSelectionModel({});

    var cm = [
      sm,
      { header: '退车单ID', dataIndex: 'sew_return_order_id', sortable: true, width: 50 },
      { header: 'ID',       dataIndex: 'id',                  sortable: true, width: 30 },
      { header: '退车单日期', dataIndex: 'sew_return_order/create_date', srotable: true, width: 80 },
      { header: '衣车名称及类型', dataIndex: 'hire_item/sew/name', sortable: true, width: 100 },
      { header: '款号', dataIndex: 'hire_item/cloth_number', sortable: true,width:80 },
      { header: '车行',     dataIndex: 'hire_item/garage', sortable: true, width: 100 },
      { header: '部门',     dataIndex: 'sew_return_order/department/name', sortable: true, width: 60 },
      { header: '退车数量', dataIndex: 'count', sortable: true, width: 60 },
      { header: '需求日期', dataIndex: 'hire_item/hire_date', sortable: true, width: 80 },
      { header: '实际租车日期', dateIndex: 'hire_item/actual_hire_date', sortable: true, width: 80 },
      { header: '预计退还日期', dataIndex: 'hire_item/expect_return_date' ,sortable: true, width: 80 },
      { header: '实际退期', dataIndex: 'return_date', sortable: true, width: 80 },
      { header: '经手人',   dataIndex: 'sew_return_order/return_person', sortable: true, width: 70 },
      { header: '车行经手人',dataIndex: 'sew_return_order/sew_dealer', sortable: true, width: 70 },
      { header: '退车状态', dataIndex: 'sew_return_order/state_cn', sortable: true,width: 70 },
      { header: '付款状态', dataIndex: 'state_cn', sortable: true, width: 80, renderer: renderColorState },
      { header: '价格',     dataIndex: 'hire_item/price', sortable: true, width: 70 },
      { header: '合计',     dataIndex: 'total_price', sortable: true, width:70 },
      { header: '备注',     dataIndex: 'remark', sortable: true }
    ];
    ( !this.pm.permittedTo('view_total_price','return_items') ) && cm.splice( 18,1 );
    ( !this.pm.permittedTo('view_price','return_items') ) && cm.splice( 17,1 );
    ( !this.pm.permittedTo('view_pay_state','sew_return_orders') ) && cm.splice( 16,1 );
    ( !this.pm.permittedTo('view_garage','return_items') ) && cm.splice( 6,1 );
    

    var columns = new Ext.grid.ColumnModel(cm);

    tbar = [
      '-',
      { text: '查询', id: 'query', handler: this.showQuery },
      '-',
      { text: '打印', handler: this.printReturnDetails },
      '->','-',
      { text: '付款',handler: this.onPay },
      '-',
      { text: '取消付款', handler: this.onCancel }
    ];
    ( !this.pm.permittedTo('cancel','return_items') ) && tbar.splice( 8,1 );
    ( !this.pm.permittedTo('pay','return_items') ) && tbar.splice( 5,3 );
   
    var store = new Ext.data.JsonStore({
      fields: [
        "id",
        "sew_return_order_id",
        "sew_return_order/create_date",
        "hire_item/sew/name",
        "hire_item/garage",
        "sew_return_order/department/name",
        "count",
        "hire_item/hire_date",
        "hire_item/expect_return_date",
        "return_date",
        "sew_return_order/return_person",
        "sew_return_order/sew_dealer",
        "sew_return_order/state_cn",
        "state_cn",
        "hire_item/price",
        "total_price",
        "remark",
        "hire_item/cloth_number",
        "hire_item/actual_hire_date"
      ],
      proxy: new Ext.data.HttpProxy({ url: 'return_items.json', method:'GET' }),
      root: 'content',
    });
    
    scope.pagingToolbar = Wando.createPagingToolbar(store, [
        '-','--',"<div id='sumInfo'></div>",'-','--',"<div id='sumInfo2'></div>"
    ]);

    var grid = new Ext.grid.GridPanel({
      store : store,
      cm : columns,
      sm : sm,
      layout : 'fit',
      anchor : "100% 100%",
      tbar : tbar,
      bbar : scope.pagingToolbar,
      viewConfig : { forceFit: true }
    });

    return grid;
  },

  settingQuery: function  () {
    var extraParams = { sort: "sew_return_order_id", dir: "DESC" };
    this.query.createQueryOptions( "all",[],extraParams )
  },

  loadReturnDetail: function (garage) {
    var scope = this;
    if (garage == "全部" || garage == "车行" ) {scope.query.work( scope.query.findQueryOptions( "all" ),null,{ success: scope.queryHandler } );}
    else{
      var extraParams = { sort: "sew_return_order_id", dir: "DESC" };
      scope.query.createQueryOptions(
          garage,
          [{ content: "hire_item/garage", condition: "equals", value: garage }],
          extraParams
          );
      scope.query.work( scope.query.findQueryOptions( garage ), null,{ success: scope.queryHandler } );
    };
  },

  onPay: function  () {
    var scope = Wando.ReturnOrderDetail;
    scope.batchProcess( 'pay','付款','已付款' );
  },
  onCancel: function  () {
    var scope = Wando.ReturnOrderDetail;
    scope.batchProcess( 'cancel','取消付款','取消付款' );
  },

  showQuery: function  () {
    Wando.ReturnOrderDetail.query.showWin();
  }
};
