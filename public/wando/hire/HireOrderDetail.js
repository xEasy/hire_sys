
Wando.pageSize = 15;

Wando.HireOrderDatail = {
  init: function () {
    this.pm = new Wando.PermissionManager( Wando.erbData.allPermitted );

    this.grid =  this.createGrid();
    this.gridStore = this.grid.store;

    var tmp = [{ content: "sew_hire_order/department/name" , condition: "equals", value: Wando.erbData.department_name }];
    var defaultCcv = this.pm.permittedTo('view_all', 'sew_hire_orders') ? undefined : tmp;

    this.query = new Wando.base.Query({
        modelName      :  'hire_item',
        outterGrid     :  this.grid,
        pagingToolbar  :  this.pagingToolbar,
        queryHandler   :  this.queryHandler,
        valueFieldConfigKey : 'hireOrderDetail',
        defaultCcv     :  defaultCcv
    });

    new Ext.Viewport({
      layout: 'border',
      frame: true,
      items:[
        Wando.menuStub,
        {
          region: 'center',
          layout: 'anchor',
          items: [ this.grid ]
        }
      ]
    });

    var defaultOptions = this.query.createQueryOptions( "default", [], { sort: "sew_hire_order_id", dir: "DESC" } );
    this.query.work( defaultOptions,null,{ success: this.queryHandler } );
  },

  queryHandler: function(response, opts) { 
    var scope = Wando.HireOrderDatail;
    var queryOptions = scope.query.findQueryOptions('current');
    var queryContent = ['count'];
    //if(scope.pm.permittedTo('view_price', 'requisition_items')) queryContent.push('total');

      scope.query.sum(queryOptions, queryContent, { 
          success: function(response, opts) { 
              var content = Ext.decode(response.responseText).content;
              var b = '&nbsp&nbsp&nbsp&nbsp&nbsp';

              var html = String.format('<b>数量合计{0}{1}</b>', content.count, b);
              Ext.get('sumInfo').dom.innerHTML = html;
          }
      });
  },

  createGrid: function  () {
    var scope = this;

    var sm = new Ext.grid.CheckboxSelectionModel({});

    var cm = [
      { header: '租车单ID',       dataIndex: 'sew_hire_order_id', sortable: true, width: 100 },
      { header: 'ID',             dataIndex: 'id',sortable: true, width: 50 },
      { header: '衣车名称及类型', dataIndex: 'sew/name', sortable: true, width: 100 },
      { header: '数量',           dataIndex: 'count',    sortable: true, width: 60 },
      { header: '可退车数量',     dataIndex: 'retain_count', sortable: true, width: 60  },
      { header: '已退车数量',     dataIndex: 'returned_count', sortable:true, width: 60 },
      { header: '退车中数量',     dataIndex: 'returning_count', sortable: true, width: 60 },
      { header: '款号',           dataIndex: 'cloth_number',   sortable: true, width: 60 },
      { header: '租车部门',       dataIndex: 'sew_hire_order/department/name', sortable: true, width: 60 },
      { header: '租车人',         dataIndex: 'sew_hire_order/hire_person', sortable: true, width: 60 },
      { header: '需求日期',       dataIndex: 'hire_date',  sortable: true, width: 80 },
      { header: '实际租车日期',   dataIndex: 'actual_hire_date', sortable: true, width: 80 }, 
      { header: '预计退期',       dataIndex: 'expect_return_date', sortable: true, width: 80 },
      { header: '状态',           dataIndex: 'sew_hire_order/state_cn', sortable:true, width: 60 },
      { header: '车行',           dataIndex: 'garage',  sortable: true, width: 80 },
      { header: '部门备注',       dataIndex: 'dep_remark', sortable: true },
      { header: '价格',           dataIndex: 'price', sortable: true, width: 80 }, 
      { header: '采购备注',       dataIndex: 'purchasing_remark', sortable: true }
    ];
    ( !this.pm.permittedTo('view_p_remark','hire_items') ) && cm.splice( 14,1 );
    ( !this.pm.permittedTo('view_price','hire_items') ) && cm.splice( 13,1 );
    ( !this.pm.permittedTo('view_garage','hire_items') ) && cm.splice( 11,1 );

    tbar = [
      '-',
      { text: '查询', id: 'query', handler: this.showQuery },
      '-',
      { text: '打印',handler: this.printHireDetails },
      '->',
 //     { text: '退车', handler: this.addReturnSew }
    ];
    !this.pm.permittedTo("index", "prints") && tbar.splice(2, 2);
    

    var columns = new Ext.grid.ColumnModel(cm);

    var store = new Ext.data.JsonStore({
      fields: [
        "id",
        "sew_hire_order_id",
        "hire_number",
        "sew/name",
        "count",
        "retain_count",
        "returned_count",
        "returning_count",
        "sew_hire_order/hire_person",
        "cloth_number",
        "sew_hire_order/department/name",
        "actual_hire_date",
        "hire_date",
        "expect_return_date",
        "garage",
        "sew_hire_order/state_cn",
        "dep_remark",
        "price",
        "purchasing_remark"
      ],
      proxy: new Ext.data.HttpProxy({ url: 'hire_items.json', method: 'GET' }),
      root: 'content',
    });

    scope.pagingToolbar = Wando.createPagingToolbar( store, [
        "<div id='sumInfo'></div>"
    ] );

    var grid = new Ext.grid.GridPanel({
      store : store,
      cm : columns,
      layout : 'fit',
      anchor : "100% 100%",
      stripeRows: true,
      tbar : tbar,
      bbar : scope.pagingToolbar,
      viewConfig : { forceFit: true }
    });

    return grid;
  },

  showQuery:function  () {
    Wando.HireOrderDatail.query.showWin();
  },
  
  printHireDetails: function  () {
    Wando.print( Wando.HireOrderDatail.query,'prints/print_hire_items');
  }
};
