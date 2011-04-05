
Wando.AddSewHireOrder = {
  
  init: function( actionCn ){
    this.actionCn = actionCn;

    this.isEditing = this.actionCn == "Edit";
    this.isCopying = this.actionCn == "Copy";
    this.isAdding  = this.actionCn == "Add";

    this.form = this.createForm();
    this.grid = this.createGrid();
    this.gridStore = this.grid.store;

    delete_item_ids = [];
    
    new Ext.Viewport( {
      layout: 'border',
      frame: true,
      items: [
        Wando.menuStub,
        {
          region: 'center',
          layout: 'anchor',
          items: [this.form, this.grid]
        }
      ]
    });

    if( this.isEditing || this.isCopying ) {
        this.gridStore.loadByUrl( '/sew_hire_orders/' + Wando.erbData.id + '/hire_items.json',null,
            { callback:function () { Wando.AddSewHireOrder.gridStore.autoSort( "ids" ); } }
            );
    }
  },

  createForm: function()  {
      return new Ext.FormPanel({
        anchor      : '100% 15%',
        border      : false,
        frame       : true,
        layout      : 'column',
        labelAlign  : 'right',
        items: [{
          layout: 'form', columnWidth: 0.20,
          items: [{
              fieldLabel:'部门', id:'department_name', xtype: 'textfield', width:100,value: Wando.erbData.department_name,
              readOnly:true
          },{
              fieldLabel: '租车人', id:'hire_person', xtype: 'textfield', width: 100, value: Wando.erbData.hire_person
          }]
          },{
            height: 100, columnWidth: 0.20, layout: 'form',
            items: [ {
                fieldLabel: '申请日期', id: 'create_date', xtype: 'datefield',format: "Y-m-d H:i", width: 130, value: Wando.erbData.create_date,
                readOnly: true
            },{
                id: 'create_time', xtype: 'timefield', format: "H:i", width: 110,value:Wando.erbData.create_date,hidden: true,
                readOnly: true
            } ]
          },{
          layout: 'form',
          items: [{
            fieldLabel: '备注', id: 'remark', xtype: 'textarea', width: 200, height: 50, value: Wando.erbData.remark
          }]
        }]
    });
  },

  deleteHandler: function() {
      var scope = Wando.AddSewHireOrder;
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
                  store.autoSort( "ids" );
              }
          }
      );
  },

  addHandler:function() {
      var grid = Wando.AddSewHireOrder.grid;
      var store = grid.store;

      var r = new store.recordType({});
      grid.stopEditing(  );
      store.insert( store.getCount(), r );
      store.autoSort( "ids" );
      grid.startEditing( store.getCount()-1,1 );
  },

  createGrid: function  () {
    var scope = this;

/*    var sewCombo = new Ext.form.ComboBox({
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
     });
*/
    var column = new Ext.grid.ColumnModel([
      { header: '序号'  ,dataIndex: 'ids', width:15 },
      { header: '衣车名称及型号', dataIndex: 'sew_name',editor: Wando.sewCombo, width: 60 },
      { header: '数量', dataIndex: 'count', editor: new Ext.form.NumberField(  ), width:30 },
      { header: '款号', dataIndex: 'cloth_number', editor: new Ext.form.TextField(), width: 30 }, 
      { header: '需求日期', dataIndex: 'hire_date', type: "datefield" ,width: 40,
          editor: Wando.dateEditor,
          renderer: Wando.dateRender
      },
      { header: '预计退还日期', dataIndex: 'expect_return_date', type:"datefield", width: 40,
          editor: Wando.dateEditor,
          renderer: Wando.dateRender
      },
      { header: '部门备注', dataIndex: 'dep_remark', editor: new Ext.form.TextField(  ) }
    ]);

    var store = new Ext.data.JsonStore({
      fields: [
        { name: 'id' },
        { name: 'ids' },
        { name: 'sew_id' },
        { name: 'sew_name' },
        { name: 'sew_id' },
        { name: 'count' },
        { name: 'cloth_number' },
        { name: 'hire_date' },
        { name: 'expect_return_date' },
        { name: 'dep_remark' },
        { name: '#' }
      ],
      url: '/'
    });
     
    var grid = new Ext.grid.EditorGridPanel({
      layout : 'fit', 
      border : false,
      cm     : column,
      store  : store,
      anchor : '100% 80%',
      viewConfig: { forceFit: true },
      clicksToEdit: 1,
      tbar: [
        { text: '添加', handler: scope.addHandler },'-',
        { text: '保存', handler: scope.saveHandler },'-',
        { text: '删除', handler: scope.deleteHandler },'-',
        { text: '返回(不保存)', handler: scope.backTo }
      ]
    });

    return grid;
  },

  backTo: function  () {
    location.href = '/';
  },

  saveHandler: function() {
    var scope = Wando.AddSewHireOrder;
    var msg = "";
    switch(scope.actionCn) {
      case 'Add':
          msg = "确定要保存吗？";
        break;
      case 'Edit':
          msg = "确定要修改吗？";
        break;
      case 'Copy':
          msg = "确定要生成新的采购单吗？";
    }

    Ext.Msg.confirm( "提示", msg, function( button ){
      if( button == "no" ) return false;
      var hireDate = [];
      var store = Wando.AddSewHireOrder.gridStore;

      for (var i = 0; i < store.getCount(); i++) {
           var r = store.getAt(i);
           hireDate[i] = {
            id                 : scope.isEditing ? r.get( "id" ) : undefined,
            sew_id             : r.get( "sew_id" ),
            count              : r.get( "count" ),
            cloth_number       : r.get( "cloth_number" ),
            hire_date          : r.get( "hire_date" ),
            expect_return_date : r.get( "expect_return_date" ),
            dep_remark         : r.get( "dep_remark" )
           }
      }

      var hireOrder  = {
          delete_item_ids  : delete_item_ids,
          create_date      : Ext.getCmp( "create_date" ).getValue(),
          create_time      :  Ext.getCmp( "create_time" ).getValue(),
          department_id    : Wando.erbData.department_id,
          hire_person      : Ext.getCmp( "hire_person" ).getValue(),
          remark           : Ext.getCmp( "remark" ).getValue(),

          hire_items_attributes: hireDate
      };

      Ext.Ajax.request({
          url: scope.isEditing ? '/sew_hire_orders/' + Wando.erbData.id + '.json' : '/sew_hire_orders.json',
          
          method: scope.isEditing ? "PUT" : "POST",
          
          jsonData: { order: hireOrder },
          success: function() {
              store.removeAll();
              location.href = '/';
          },
          failure: function( response, onpts ) {
              var msg = eval( response.responseText ).content.error_messages;
              Ext.Msg.alert( "提示",msg );
          }
      });
    });
  }
};
