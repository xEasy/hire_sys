
Wando.HireOrders = {
  init: function() {

    var scope = this;
    this.pm = new Wando.PermissionManager(Wando.erbData.allPermitted);

    this.initMapping();

    this.hireOrderGrid       = this.createHireOrderGrid();
    this.hireOrderStroe      = this.hireOrderGrid.store;

    this.hireOrderItemsGrid  = this.createHireOrderItemsGrid();
    this.hireOrderItemsStore = this.hireOrderItemsGrid.store;
    this.tree                = this.createTree();

    var tmp = [{ content: "department/name" , condition: "equals", value: Wando.erbData.department_name }];
    var defaultCcv = this.pm.permittedTo('view_all', 'sew_hire_orders') ? undefined : tmp;

    this.query = new Wando.base.Query({
            modelName : 'sew_hire_order',
            outterGrid : this.hireOrderGrid,
            defaultCcv : defaultCcv,
            pagingToolbar  : this.pageToolbar,
            queryButtonClickHandler : function() { },
            valueFieldConfigKey  : 'hireOrder'
          });

    this.settingQuery();

    new Ext.Viewport({
      layout: 'border',
      frame: true,
      items: [
        Wando.menuStub,
        {
          region:'center',
          layout: 'anchor',
          items: [this.hireOrderGrid, this.hireOrderItemsGrid]
        },
        this.tree
      ]
    });

    this.tree.root.childNodes[0].events.click.fire();
  },

  initMapping: function() {
    var ps = this.pm.permissionsOf("sew_hire_orders");
    this.stateAndLinkMapping = {
      "pending"      : Wando.__( ["dep_approve","cancel","edit"], ps ),
      "dep_approved" : Wando.__( [ "approve", "cancel", "edit" ], ps ),
      "approved"     : Wando.__( [ "hire_complite"], ps ),
      "hire_complite": Wando.__( [ ], ps ),
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
        "dep_approved",
        [{ content: "state_cn", condition: "equals", value: "主管已批" }],
        extraParams
      );
      this.query.createQueryOptions(
        "approved",
        [{ content: "state_cn", condition: "equals", value: "部门租车中" }],
        extraParams
      );
      this.query.createQueryOptions(
        "hire_complite", 
        [{ content: "state_cn", condition: "equals", value: "租车完成" }],
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
      var scope = Wando.HireOrders;

      var hash = { 
          edit          : { text: '编辑'      , handler: scope.onEdit       },
          dep_approve   : { text: '主管批准'  , handler: scope.onDepApprove },
          approve       : { text: '采购批准'  , handler: scope.onApprove    },
          hire_complite : { text: '租车完成'  , handler: scope.onHireComplite },
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

      var tbar = scope.hireOrderGrid.getTopToolbar();
      if(scope.addedBtnsCount) { 
          for(i=0; i<scope.addedBtnsCount; i++)
              tbar.remove(tbar.items.items.length - 1);
      }

      tbar.add(btns);
      tbar.doLayout();
      scope.addedBtnsCount = btns.length;
  },

//setColumns: function(state) {
//  var scope = Wando.HireOrders;
//  state = state || scope.currentState;
//  
//  var cm = this.hireOrderItemsGrid.getColumnModel();
//  var pr = cm.config[ cm.findColumnIndex('price') ];
//  var ga = cm.config[ cm.findColumnIndex( 'garage' ) ];
//  if (state == 'approved' || state == 'cancel' || state == 'all') {
//    pr.editor = undefined;
//    ga.editor = undefined;
//  }else{
//    pr.editor = new Ext.form.NumberField();
//    ga.editor = new Ext.form.TextField();
//  };
//},
  
//树的状态点击事件
  loadHireOrder: function(state) {
    this.currentState = state;
    this.setTbar();
    //search
    this.query.work( this.query.findQueryOptions(state), null,{ success: this.updateNodesText } );

    this.hireOrderItemsStore.removeAll();
  },
  
  showQuery: function() {
      Wando.HireOrders.query.showWin();
  },

  createHireOrderGrid: function  () {
      var scope = Wando.HireOrders;

      var store = new Ext.data.JsonStore({
        fields:[
          "id",
          "number",
          "create_date",
          "create_time",
          "hire_person",
          "department/name",
          "state",
          "remark",
          "state_cn"
        ],
        proxy: new Ext.data.HttpProxy({ url:'/sew_hire_orders.json', method: 'GET' }),
        root: 'content'
      });

      this.pageToolbar = Wando.createPagingToolbar(store);

      var sm = new Ext.grid.CheckboxSelectionModel();
      var columns = [
        sm,
        { header: "租车单ID", sortable: true, dataIndex: 'id', width:20 },
        { header: "部门",     sortable: true, dataIndex: 'department/name', width:50 },
        { header: "租车人",   sortable: true, dataIndex: 'hire_person', width:50 },
        { header: "申请日期", sortable: true, dataIndex: 'create_date', width: 50 },
        { header: "时间",     sortable: true, dataIndex: 'create_time', width: 50 }, 
        { header: "状态",     sortable: true, dataIndex: 'state_cn', width:50 },
        { header: "备注",     sortable: true, dataIndex: 'remark' }
      ]

      var cm = new Ext.grid.ColumnModel(columns);

      tbar = [
        { text: '添加', handler: function() { location.href='/sew_hire_orders/new'; } },
        '-',
        { text: '打印表头', handler: this.printHireTitle },
        '-',
        { text: '打印租车申请单', id: 'print', handler: this.printHireOrder },
        '-',
        { text: '查询', id: 'query', handler: this.showQuery },
        '->'
      ];
      !this.pm.permittedTo("index", "prints") && tbar.splice(2, 4);
      !this.pm.permittedTo("new", "sew_hire_orders") && tbar.splice(0, 2);


     return new Ext.grid.GridPanel({
        title: "租车申请单列表",
        store: store,
        anchor: "100% 60%",
        viewConfig: { forceFit: true },
        border: false,
        cm: cm,
        sm: sm,
        tbar: tbar,
        stripeRows: true,
        bbar: this.pageToolbar,
        listeners: {
          cellclick: function(grid, rowIndex, columnIndex) {
            var scope  = Wando.HireOrders;
            var store  = grid.getStore();
            var record = store.getAt( rowIndex );
            var id     = record.get( "id" );
            scope.hireOrderItemsStore.loadByUrl( '/sew_hire_orders/' + id + '/hire_items.json' );
          }
        }
      });  
  },


  //保存采购修改的价格，车行及备注
  saveHandler: function () {

    var scope = Wando.HireOrders;
    var msg = "确定保存修改吗？";

    Ext.Msg.confirm( "提示", msg, function( button ) {

      if( button  == "no" ) return false;

      var returnData = [];
      var store = scope.hireOrderItemsStore;
      var upData = store.getModifiedRecords();
      var upCount = upData.length;

      if (upCount==0) {Ext.Msg.alert("提示","没有需要更新保存的数据！");return false;};

      for (var i = 0; i < store.getCount(); i++) {
        var r = store.getAt( i );
        returnData[i] = {
          id         :   r.get( "id" ),
          garage     :   r.get( "garage" ),
          price      :   r.get( "price" ),
          purchasing_remark : r.get( "purchasing_remark" )
        }
      }

      Ext.Ajax.request({
        url: '/hire_items/update_details.json',
        method: "PUT",
        jsonData : { items : returnData },
        success: function() {
          Ext.Msg.alert( "提示", "保存成功" );
        },
        failure: function( response, onpts ) {
          Ext.Msg.alert( "提示","无法保存" );
        }
      })
    });
  },

  createHireOrderItemsGrid: function  () {
    var scope = this;
    var priceAndGarageUpdatable = this.pm.permittedTo( 'update_hire_items','sew_hire_orders' );

    var cm = [
      { header: '衣车名称及类型', dataIndex: 'sew_name', width: 80 },
      { header: '款号',           dataIndex: 'cloth_number', width:50 },      
      { header: '数量',           dataIndex: 'count',    width: 50 },
      { header: '未退数量',       dataIndex: 'retain_count', width:50 },
      { header: '租车日期',       dataIndex: 'hire_date',    width:60 },
      { header: '预计退还日期',   dataIndex: 'expect_return_date', width:60 },
      { header: '部门备注',       dataIndex: 'dep_remark',   widht:80 },      
      { header: '车行名称',       dataIndex: 'garage',     width:60, editor:priceAndGarageUpdatable && new Ext.form.TextField() },
      { header: '价格',           dataIndex: 'price',        width:60, editor:priceAndGarageUpdatable && new Ext.form.NumberField() },
      { header: '采购备注',       dataIndex: 'purchasing_remark' ,editor: priceAndGarageUpdatable && new Ext.form.TextField()}
    ];

    ( !this.pm.permittedTo('view_price','sew_hire_orders') ) && cm.splice( 8,1 );
    ( !this.pm.permittedTo('view_garage','sew_hire_orders') ) && cm.splice( 7,1 );

    var column = new Ext.grid.ColumnModel(cm);

    var fields = [
      "id",
      "sew_name",
      "count",
      "cloth_number",
      "retain_count",
      "hire_date",
      "garage",
      "price",
      "dep_remark",
      "purchasing_remark",
      "expect_return_date",
      "sew_hire_order_id"
    ];

    var bar = ['->','-',{ text: '保存修改', handler: function() { scope.saveHandler(); } },'-'];
    var tbar = priceAndGarageUpdatable ? bar : undefined;

    var store = new Ext.data.JsonStore({ fields: fields, url:'/' });

    var grid = new Ext.grid.EditorGridPanel({
      id: "hireOrderItemsGrid",
      anchor: "100% 40%",
      stripeRows: true,
      layout: "fit",
      clickToEdit: 1,
      border: false,
      tbar: tbar,
      loadMask: { msg: "loading" },
      viewConfig: { forceFit: true },
      store:  store,
      cm: column
    });

    return grid;
  },
  

  createTree: function  () {
    var _this = this;
    var root = new Ext.tree.AsyncTreeNode({
      text: '状态',
      expanded: true,
      children: [{
        text: '待批准(0)', leaf: true,
        listeners: { click: function() { _this.loadHireOrder("pending"); } }
      },{
        text: '主管已批(0)', leaf: true,
        listeners: { click: function() { _this.loadHireOrder("dep_approved"); } }
      },{
        text: '部门租车中(0)', leaf: true,
        listeners: { click: function() { _this.loadHireOrder("approved"); } }
      },{
        text: '租车完成(0)', leaf: true,
        listeners: { click: function() { _this.loadHireOrder("hire_complite"); } }
      },{
        text: '取消(0)', leaf: true,
        listeners: { click: function() { _this.loadHireOrder("cancel"); } }
      },{
        text: '全部(0)', leaf: true,
        listeners: { click: function() { _this.loadHireOrder("all"); } }
      }]
    });

    return new Ext.tree.TreePanel({
      root   : root,
      split  : true,
      width  : 130,
      maxSize : 140,
      minSize : 80,
      title  : '状态列表',
      region : 'west',
      collapsible :true
    });
  },

  getPrintExtraParams: function() { 
      var scope = Wando.HireOrders;
      var selectedRecords = scope.hireOrderGrid.selModel.getSelections();
      var ids = [];
      for(var i=0; i<selectedRecords.length; i++) { 
          var id = selectedRecords[i].get('id');
          ids.push(id);
      }

      return (ids.length == 0) ? { } : { ids: ids };
  },

  printHireTitle: function() {
    scope = Wando.HireOrders;
    Wando.print(scope.query,'/prints/print_hire_order_titles',scope.getPrintExtraParams());
  },

  printHireOrder: function  () {
    scope = Wando.HireOrders;
    Wando.print(Wando.HireOrders.query,'/prints/print_hire_orders',scope.getPrintExtraParams());
  },

  //处理方法
  batchProcess: function( action, remark ) {
    var scope = Wando.HireOrders;
    var selections = scope.hireOrderGrid.getSelectionModel().getSelections();
    if( selections.length == 0 ) { Ext.Msg.alert( '提示', "未选取任何租车申请单" ); return; }

    var ids = [];
    for (var i = 0; i < selections.length; i++) {
      var record = selections[ i ];
      ids.push( record.get( "id" ) );
    };

    Ext.Ajax.request( {
      url: String.format( "/sew_hire_orders/{0}.json",action ),
      method: 'PUT',
      jsonData: { id:ids },
      success: function( response, opts ){
        var scope = Wando.HireOrders;
        scope.loadHireOrder(scope.currentState);
        scope.updateNodesText();
      },
      failure: function() {
        remark = remark || "";
        var msg = String.format( '操作失败，不能转变为{0}状态;',remark );
        Ext.Msg.alert( '提示',msg );
      }
    } );
  },
  
  getSelectedHireOrder: function() {
    var scope = Wando.HireOrders;
    var record = scope.hireOrderGrid.selModel.getSelected();
    return record;
  },

  //按钮事件
  onEdit: function  () {
    var scope = Wando.HireOrders;
    var os = scope.getSelectedHireOrder();
    if(os) location.href = String.format('/sew_hire_orders/{0}/edit',os.get('id'));
  },

  onDepApprove: function() {
    var scope = Wando.HireOrders;
    scope.batchProcess('dep_approve','批准');
  },

  onApprove: function() {
    var scope = Wando.HireOrders;
    scope.batchProcess('approve','批准');
  },

  onHireComplite: function  () {
    var scope = Wando.HireOrders;
    scope.batchProcess('hire_complite','租车完成');
  },

  onCancel: function() {
    var scope = Wando.HireOrders;
    scope.batchProcess('cancel','取消'); 
  },

  updateNodesText: function() { 
      var scope = Wando.HireOrders;
      
      var queryOptionsArray = [];
      var array = ["pending", "dep_approved", "approved","hire_complite", "cancel", "all"];

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
