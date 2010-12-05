Wando.AddSewReturnOrder = {
  init: function (actionCn) {
    this.scope = this;
 //   this.pm = new Wando.PermissionManeger( Wando.erbData.allPermitted );
    this.actionCn = actionCn;
    
    this.addWin   = this.createAddWin();
    
    this.isEditing = this.actionCn == "Edit";
   // this.isAdding  = this.actionCn == "Add";
   //
   //

    this.form = this.createForm();
    this.grid = this.createGrid();
    this.gridStore = this.grid.store;

    delete_item_ids = [];

    var tmp = [{ content: "sew_hire_order/department/name" , condition: "equals", value: Wando.erbData.department_name }];
    var defaultCcv   = tmp;
    //defaultCcv.push({content:"id",condition:"wantIds",value: ""  });

    this.query = new Wando.base.Query({
        modelName      :  'hire_item',
        outterGrid     :  this.winGrid,
        pagingToolbar  :  this.pageToolbar,
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
          items: [ this.form, this.grid ]
        }
      ]
    });

    if( this.isEditing ) {
        this.gridStore.loadByUrl( '/sew_return_orders/' + Wando.erbData.id + '/return_items.json', null,
            { callback: function () { Wando.AddSewReturnOrder.gridStore.autoSort( "ids" ); } }
        );
    }
    
  },

  createForm: function() {
    return new Ext.FormPanel({
      anchor     : '100% 15%',
      border     : false,
      frame      : true,
      layout     : 'column',
      labelAlign : 'right',
      items:[{
        height: 100, columnWidth: 0.23, layout: 'form',
        items: [{
          fieldLabel:'部门', id: 'department_name', xtype:'textfield', readOnly: true ,width:100, value: Wando.erbData.department_name 
        },{
          fieldLabel: '经手人', id: 'return_person', xtype: 'textfield', width: 100, value: Wando.erbData.return_person 
        }]
      },{
        layout: 'form', columnWidth: 0.23,
        items: [{
          fieldLabel: '退车单日期', id: 'create_date', xtype:'datefield', width:90, format: "Y-m-d", editable: false, value: Wando.erbData.create_date
        },{
          fieldLabel: '车行经手人', id: 'sew_dealer', xtype: 'textfield', width: 90, value: Wando.erbData.sew_dealer
        }]
      },{
        layout: 'form',
        items: [{
          fieldLabel:'备注', id: 'remark', xtype:'textarea', width:180, height: 50, value: Wando.erbData.remark
        }]
      }]
    })
  },

  deleteHandler: function() {
      var scope = Wando.AddSewReturnOrder;
      var grid = scope.grid;
      var selection = grid.selModel.selection;

      if( !selection ) return false;
      var record = selection.record;

      Ext.MessageBox.confirm( '确认', '是否要删除该记录',
          function( button,text ) {
              if ( button == 'yes' ) {
                  var store = scope.gridStore;

                  delete_item_ids.push( record.get( 'id' ) );
                  store.remove( record );
              }
          }
      );
  },

  createGrid: function() {
  var scope = this;

  //编辑与添加时field_name冲突。
  var sew_hire_order_id = "sew_hire_order_id"
  var sew_name          = "sew/name";
  var hire_count        = "count";
  var garage            = "garage";
  var hire_date         = "hire_date";
  var retain_count      = "retain_count";
  var cloth_number      = "cloth_number";

  if (scope.isEditing) {
      sew_hire_order_id = "hire_item/sew_hire_order_id";
      sew_name          = "hire_item/sew/name";
      hire_count        = "hire_item/count";
      garage            = "hire_item/garage";
      hire_date         = "hire_item/hire_date";
      retain_count      = "hire_item/retain_count";
      cloth_number      = "hire_item/cloth_number"
      };

  function renderMotif( data, cell,record, rowIndex, columnIndex, store ) {
    //改变列颜色
    return data;
  }
  
  var column = new Ext.grid.ColumnModel([
    { header: '租车单ID', dataIndex:  sew_hire_order_id,sortable: true, width: 60, renderer: renderMotif },
    { header: '衣车名称及类型', dataIndex: sew_name ,sortable: true, width: 60, renderer: renderMotif },
    { header: '车行名称', dataIndex:  garage ,sortable: true, width: 50, renderer: renderMotif },
    { header: '款号',     dataIndex:  cloth_number,sortable: true, width: 30, renderer: renderMotif },
    { header: '租车日期', dataIndex:  hire_date,sortable: true, width: 40, renderer: renderMotif },
    { header: '租车数量', dataIndex:  hire_count,sortable: true, width: 30, renderer: renderMotif }, 
    { header: '未退数量', dataIndex:  retain_count, width: 30, renderer: renderMotif },
    { header: '实退数量', dataIndex: 'return_count',sortable: true, width: 30, editor: new Ext.form.NumberField() },
    { header: '实退日期', dataIndex: 'return_date',sortable: true, width: 40, editor: Wando.dateEditor, renderer: Wando.dateRender },
    { header: '备注',     dataIndex: 'remark',sortable: true, editor: new Ext.form.TextField() }
  ]);

  var store = new Ext.data.JsonStore({
    fields: [
      { name: 'id' },
      { name: 'ids' },
      { name: sew_hire_order_id },
      { name: sew_name },
      { name: cloth_number},
      { name: hire_date },
      { name: retain_count },
      { name: hire_count },
      { name: garage },
      { name: 'return_count' },
      { name: 'return_date' },
      { name: 'remark' },
      { name: 'hire_item_id' }
    ],
    url: '/'
  });

  var grid = new Ext.grid.EditorGridPanel({
    id      : 'addGrid',
    layout  :  'fit',
    clickToEdit: 1,
    border  :  false ,
    cm      : column,
    store   : store,
    clickToEdit : 1,
    anchor  : '100% 80%',
    viewConfig: { forceFit: true },
    tbar:[
      { text: '添加', handler: scope.addHireItems  },'-',
      { text: '保存', handler: scope.saveHandler   },'-',
      { text: '删除', handler: scope.deleteHandler },'-',
    ]
  });
  return grid;
  },

  addHireItems: function  () {
    scope = Wando.AddSewReturnOrder;
    if (!scope.isEditing) {
        scope.addWin.show();
        var defaultOptions = scope.query.createQueryOptions( "default",[],{ sort:"sew_hire_order_id",dir:"DESC" } );
        scope.query.work(defaultOptions,null);
      }
    else{
        Ext.Msg.alert("提示","编辑状态不允许添加请填写新的退车申请");
      };
  },

  saveHandler: function() {
    var scope = Wando.AddSewReturnOrder;
    var msg = "";
    switch ( scope.actionCn ) {
      case 'Add' :
        msg = "确定要保存吗？";
        break;
      case 'Edit':
        msg = "确定要修改吗？";
    }

    Ext.Msg.confirm( "提示", msg, function( button ){
      if( button == "no" ) return false;
      var returnData = [];
      var store = Wando.AddSewReturnOrder.gridStore;

      for ( var i = 0; i < store.getCount(); i++ ) {
        var r = store.getAt(i);
        returnData[i] = {
          id                : scope.isEditing ? r.get( "id" ) : undefined,
          count             : r.get( "return_count" ),
          return_date       : r.get( "return_date" ),
          hire_item_id      : r.get( "hire_item_id" ),  //Win选择窗口传入的hire_item_id属性名称
          remark            : r.get( "remark" )
        }
      }

      var returnOrder = {
        delete_item_ids   :  delete_item_ids,
        //number            :  Ext.getCmp( "number" ).getValue(),
        create_date       :  Ext.getCmp( "create_date" ).getValue(),
        department_id     :  Wando.erbData.department_id,
        return_person     :  Ext.getCmp( "return_person" ).getValue(),
        sew_dealer        :  Ext.getCmp( "sew_dealer" ).getValue(),
        remark            :  Ext.getCmp( "remark" ).getValue(),
      
        return_items_attributes : returnData 
      };
      
      Ext.Ajax.request({
        url: scope.isEditing ? '/sew_return_orders/' + Wando.erbData.id + ".json" : '/sew_return_orders.json',

        method: scope.isEditing ? "PUT" : "POST",

        jsonData: { order: returnOrder },
        success: function() {
          store.removeAll();
          location.href = '/sew_return_orders';
        },
        failure: function( response, onpts ) {
          var msg = eval( response.responseText ).content.error_messages;
          Ext.Msg.alert( "提示",msg );
        }
      });

    } );
  },

  showQuery: function  () {
    Wando.AddSewReturnOrder.query.showWin();
  },

  createAddWin: function  () {
    var scope = this;

    var sm = new Ext.grid.CheckboxSelectionModel({ });

    var cm = [ 
        sm,
        { header: '租车单ID', dataIndex: 'sew_hire_order_id',sortable: true, width: 90},
        { header: '衣车名称及类型', dataIndex:'sew/name' ,sortable: true,width: 100 },
        { header: '款号',     dataIndex: 'cloth_number',sortable: true ,width: 60},
        { header: '数量',     dataIndex: 'count',sortable: true , width: 60},
        { header: '未退数量', dataIndex: 'retain_count',sortable: true , width: 60},
        { header: '租车部门', dataIndex: 'sew_hire_order/department/name',sortable: true ,width: 60},
        { header: '车行',     dataIndex: 'garage' ,sortable: true, width: 80 },
        { header: '租车人',   dataIndex: 'sew_hire_order/hire_person',sortable: true, width: 60 },
        { header: '租车日期', dataIndex: 'hire_date',sortable: true,width: 80 },
        { header: '预计退还日期', dataIndex: 'expect_return_date',sortable: true }
    ];

    var columns = new Ext.grid.ColumnModel(cm);

    tbar = [
      '-',
      { text: '查询', id: 'query', handler: this.showQuery },
      '-'
    ]

    var store = new Ext.data.JsonStore({
        fields: [
          "hire_item_id",
          "sew_hire_order_id",
          "sew/name",
          "cloth_number",
          "count",
          "retain_count",
          "hire_date",
          "expect_return_date",
          "garage",
          "sew_hire_order/department/name",
          "sew_hire_order/hire_person"
        ],
        proxy: new Ext.data.HttpProxy({ url: '/hire_items/can_return_hire_items', method:'GET' }),
        root: 'content',
        remoteSort: true
    });

    this.pageToolbar = Wando.createPagingToolbar(store);
    
    this.winGrid = new Ext.grid.GridPanel({
        id : "sgrid",
        store: store,
        cm : columns,
        sm : sm,
        layout : 'fit',
        tbar : tbar,
        bbar: this.pageToolbar
    });

    var win =  new Ext.Window({
        layout: 'fit',
        width : 650,
        height : 400,
        constrainHeader: true,
        closeAction : 'hide',
        items       : [this.winGrid],
        buttons     : [ {
          text: '添加', handler: scope.addReturnItems
        },'-',{
          text: '取消', handler: function() { win.hide(); }
        } ] 
    });

    return win;
  }, 

  addReturnItems: function  () {
      var grid  = Wando.AddSewReturnOrder.grid;
      var store = grid.store;
      var records   = Ext.getCmp("sgrid").getSelectionModel().getSelections();
      store.add( records );
      grid.view.refresh();
  }

};
