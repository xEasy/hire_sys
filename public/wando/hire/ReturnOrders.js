Wando.ReturnOrders = {
  init: function (){
    
    var scope = this;
    this.pm = new Wando.PermissionManager( Wando.erbData.allPermitted );
    
    this.initMapping();

    this.returnOrderGrid           = this.createReturnOrderGrid();
    this.returnOrdersStore      = this.returnOrderGrid.store;

    this.returnOrderItemGrid       = this.createReturnOrderItemGrid();
    this.returnOrderItemsStore     = this.returnOrderItemGrid.store;

    this.tree = this.createTree();
    
    var tmp = [{ content: "department/name" , condition: "equals", value: Wando.erbData.department_name }];
    var defaultCcv = this.pm.permittedTo('view_all', 'sew_return_orders') ? undefined : tmp;

    this.query = new Wando.base.Query({
            modelName : 'sew_return_order',
            outterGrid : this.returnOrderGrid,
            defaultCcv : defaultCcv,
            pagingToolbar  : this.pageToolbar,
            queryButtonClickHandler : function() { },
            valueFieldConfigKey  : 'returnOrder'
          });

    this.settingQuery();

    new Ext.Viewport({
        layout: 'border',
        frame: true,
        items:[
            Wando.menuStub,
            {
                region: 'center',
                layout: 'anchor',
                items: [ this.returnOrderGrid, this.returnOrderItemGrid ]
            },
            this.tree
        ]
    });

    this.tree.root.childNodes[0].events.click.fire();
  },

  initMapping: function() {
      var ps = this.pm.permissionsOf("sew_return_orders");
      this.stateAndLinkMapping = {
          "pending"      : Wando.__( ["approve","cancel"], ps ),
          "approved"     : Wando.__( [ ], ps ),
          "cancel"       : Wando.__( [ ], ps ),
          "all"          : Wando.__( [ ], ps )
      };
  },
  
  settingQuery: function  () {
      var extraParams = { sort:"id", dir:"DESC" };

      this.query.createQueryOptions(
        "pending",
        [{ content: "state_cn", condition: "equals", value: "待批准" }],
        extraParams
      );
      this.query.createQueryOptions(
        "approved",
        [{ content: "state_cn", condition: "equals", value: "已批准" }],
        extraParams
      );
      this.query.createQueryOptions(
        "cancel",
        [{ content: "state_cn", condition: "equals", value: "取消" }],
        extraParams
      );
      this.query.createQueryOptions( "all", [], extraParams )
  },

  setTbar: function(state) { 
      var scope = Wando.ReturnOrders;

      var hash = { 
          approve       : { text: '批准'  , handler: scope.onApprove    },
          cancel        : { text: '取消'      , handler: scope.onCancel     },
      };

      state = state || scope.currentState;
      var keys = scope.stateAndLinkMapping[state];
      var btns = [];

      for(i=0; i<keys.length; i++) {
          var key = keys[i];
          btns.push( '-' )
          btns.push( hash[key] );
      }

      var tbar = scope.returnOrderGrid.getTopToolbar();
      if(scope.addedBtnsCount) { 
          for(i=0; i<scope.addedBtnsCount; i++)
              tbar.remove(tbar.items.items.length - 1);
      }

      tbar.add(btns);
      tbar.doLayout();
      scope.addedBtnsCount = btns.length;
  },
  

  getPrintExtraParams: function() { 
      var scope = Wando.ReturnOrders;
      var selectedRecords = scope.returnOrderGrid.selModel.getSelections();
      var ids = []; 
      for(var i=0; i<selectedRecords.length; i++) { 
          var id = selectedRecords[i].get('id');
          ids.push(id);
      }

      return (ids.length == 0) ? {  } : { ids: ids };
  },

  printReturnOrder: function  () {
      scope = Wando.ReturnOrders;
      Wando.print(Wando.ReturnOrders.query,'/prints/print_return_orders',scope.getPrintExtraParams());
  },

  printReturnitems: function  () {
      scope = Wando.ReturnOrders;
      Wando.print(Wando.ReturnOrders.query,'/prints/print_return_order_titles',scope.getPrintExtraParams());
  },
  
//树的点击事件
  loadReturnOrder: function  (state) {
      this.currentState  = state;
      this.setTbar();

      this.query.work( this.query.findQueryOptions(state), null,{ success: this.updateNodesText } );

      this.returnOrderItemsStore.removeAll();
  },
  
  showQuery: function  () {
      Wando.ReturnOrders.query.showWin();
  },

//处理状态
  batchProcess: function  (action, remark) {
      var scope = Wando.ReturnOrders;
      var selections = scope.returnOrderGrid.getSelectionModel().getSelections();
      if( selections.length == 0 ) { Ext.Msg.alert( '提示', "未选取任何退车单" ); return; }

      var ids = [];
      for (var i = 0; i < selections.length; i++) {
          var record = selections[ i ];
          ids.push( record.get( "id" ) );
      };

      Ext.Ajax.request( {
          url: String.format( "/sew_return_orders/{0}.json",action ),
          method: 'PUT',
          jsonData: { id:ids },
          success: function( response, opts ){
              var scope = Wando.ReturnOrders;
              scope.loadReturnOrder(scope.currentState);
              scope.updateNodesText();
          },
          failure: function() {
              remark = remark || "";
              var msg = String.format( '操作失败，不能转变状态',remark );
              Ext.Msg.alert( '提示',msg );
          }
      } );
  
  },

  createTree: function  () {
      var _this = this;
      var root  = new Ext.tree.AsyncTreeNode({
                text: '状态',
                expanded: true,
                children: [{
                  text: '待批准(0)', leaf: true,
                  listeners: { click: function() { _this.loadReturnOrder( "pending" ); } }
                },{
                  text: '已批准(0)', leaf: true,
                  listeners: { click: function() { _this.loadReturnOrder( "approved" ); } }
                },{
                  text: '取消(0)', leaf: true,
                  listeners: { click: function() { _this.loadReturnOrder( "cancel" ); } }
                },{
                  text: '全部(0)', leaf: true,
                  listeners: { click: function() { _this.loadReturnOrder( "all" ); } }
                }]
              });

      return new Ext.tree.TreePanel({
          root   :  root,
          split  :  true,
          width  :  120,
          maxSize:  130,
          minSize:  70,
          title  :  '状态列表',
          region :  'west',
          collapsible : true
      });
  },

  createReturnOrderGrid: function() {
      var scope = Wando.ReturnOrders;

      var store = new Ext.data.JsonStore({
          fields: [
              "id",
              "number",
              "department/name",
              "return_person",
              "sew_dealer",
              "create_date",
              "create_time",
              "state_cn",
              "remark",
              "state_cn"
          ],
          proxy: new Ext.data.HttpProxy({ url: '/sew_return_orders.json', method:'GET' }),
          root: 'content'
      });
      
      this.pageToolbar = Wando.createPagingToolbar(store);

      var sm  = new Ext.grid.CheckboxSelectionModel();

      var columns = [
          sm,
          { header: "退车单ID" ,   sortable: true,  dataIndex: 'id', width:30 },
          { header: "部门",  sortable: true,  dataIndex: 'department/name', width: 60 },
          { header: "退车经手人", sortable: true, dataIndex: 'return_person', width:60 },
          { header: "车行经手人", sortable: true, dataIndex: 'sew_dealer', width: 60},
          { header: "退车单日期", sortable: true, dataIndex: 'create_date', width: 60 },
          { header: "时间", sortable: true, dataIndex: 'create_time', width: 60 }, 
          { header: "状态", sortable: true, dataIndex: 'state_cn', width: 60 },
          { header: "备注", sortable: true, dataIndex: 'remark' }
      ]

      var cm =  new Ext.grid.ColumnModel(columns);

      tbar = [
          { text: '添加', handler: function() { location.href='/sew_return_orders/new'; } },
          '-',
          { text: '打印表头', handler: this.printReturnitems },
          '-',
          { text: '打印退车申请单', id:'print', handler: this.printReturnOrder },
          '-',
          { text: '查询', id: 'query', handler: this.showQuery },
          '->'
      //    { text: '编辑' , handler: this.onEdit},
      //   '-',
      ];
      !this.pm.permittedTo("index", "prints") && tbar.splice(2, 4);
      !this.pm.permittedTo("new", "sew_return_orders") && tbar.splice(0, 2);
      

      return new Ext.grid.GridPanel({
                  id: "returnOrder",
                  title: "退车单列表", 
                  store : store,
                  anchor : '100% 60%',
                  viewConfig: { forceFit: true },
                  border: false,
                  cm : cm,
                  sm : sm,
                  tbar : tbar,
                  stripeRows: true,
                  bbar: this.pageToolbar,
                  listeners: {
                    cellclick: function( grid, rowIndex, columnIndex ) {
                      var scope = Wando.ReturnOrders;
                      var store = grid.getStore();
                      var record = store.getAt( rowIndex );
                      var id     = record.get( "id" );
                      scope.returnOrderItemsStore.loadByUrl( '/sew_return_orders/' + id + '/return_items.json' );
                    }
                  }
                });
  },

  createReturnOrderItemGrid: function  () {
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
    
    var cm = [
        { header: '衣车名称及类型', dataIndex: 'hire_item/sew/name', width: 80 },
        { header: '款号',           dataIndex: 'hire_item/cloth_number', width: 50 },
        { header: '退车数量',       dataIndex: 'return_count', width: 50 }, 
        { header: '未退数量',       dataIndex: 'hire_item/retain_count', width: 50 },
        { header: '租车日期',       dataIndex: 'hire_item/hire_date', width: 60 },
        { header: '预计退还日期',   dataIndex: 'hire_item/expect_return_date', width: 60 },
        { header: '实际退期',       dataIndex: 'return_date', width: 60 },
        { header: '车行',           dataIndex: 'hire_item/garage', width: 60 },
        { header: '单价',           dataIndex: 'hire_item/price',    width: 50 },
        { header: '总价',           dataIndex: 'total_price', width: 50 },
        { header: '付款状态',       dataIndex: 'state_cn', width: 50,renderer:renderColorState },
        { header: '备注',           dataIndex: 'remark' }
    ];
    ( !this.pm.permittedTo('view_pay_state','sew_return_orders') ) && cm.splice( 10,1 );
    ( !this.pm.permittedTo('view_total','sew_return_orders') ) && cm.splice( 9,1 );
    ( !this.pm.permittedTo('view_price','sew_return_orders') ) && cm.splice( 8,1 );
    ( !this.pm.permittedTo('view_garage','sew_return_orders') ) && cm.splice( 7,1 );

    var column =  new Ext.grid.ColumnModel(cm);

    var fields = [
        "hire_item/sew/name",
        "hire_item/garage",
        "hire_item/cloth_number",
        "return_count",
        "hire_item/retain_count",
        "hire_item/hire_date",
        "hire_item/expect_return_date",
        "return_date",
        "hire_item/price",
        "total_price",
        "state_cn",
        "remark",
    ];

    var store = new Ext.data.JsonStore({ fields: fields, url:'/' });

    return new Ext.grid.GridPanel({
        anchor: "100% 40%",
        stripeRows: true,
        layout: "fit",
        border: false,
        stripeRows: true,
        loadMask: { msg: "loading" },
        viewConfig: { forceFit:true },
        store: store,
        cm: column 
    });
  },

  getSelectedReturnOrder: function() {
      var scope = Wando.ReturnOrders;
      var record = scope.returnOrderGrid.selModel.getSelected();
      return record;
  },

  //按钮事件
  onEdit: function  () {
      var scope = Wando.ReturnOrders;
      var os = scope.getSelectedReturnOrder();
      if( os ) location.href = String.format( '/sew_return_orders/{0}/edit',os.get( 'id' ) );
  },

  onApprove: function() {
      var scope = Wando.ReturnOrders;
      scope.batchProcess('approve','批准');
  },

  onCancel: function  () {
      var scope = Wando.ReturnOrders;
      scope.batchProcess('cancel','取消');
  },
  
  updateNodesText: function() { 
      var scope = Wando.ReturnOrders;
      
      var queryOptionsArray = [];
      var array = ["pending", "approved", "cancel", "all"];

      for(var i=0; i<array.length; i++) { 
          queryOptionsArray.push( scope.query.findQueryOptions(array[i]) );
      }

      scope.query.allCount(queryOptionsArray, ["id"], { 
          success: function(response, opts) { 
              var obj = Ext.decode(response.responseText).content;
              for(var i=0; i<obj.length; i++) { 
                  var node = scope.tree.root.childNodes[i];
                  var text = node.text.replace(/\(\d*\)/, function(w){ return String.format("({0})", obj[i].id); });
                  node.setText(text);
              }
          },
          failure: function(response, opts) { 
              Ext.Msg.alert('', '计数失败');
          } 
      });
    }
}
