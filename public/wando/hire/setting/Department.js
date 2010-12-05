
Wando.Department = {
    init: function(showSelect) {
        showSelect = (showSelect === undefined ? true : showSelect);
        var closeWindow = function () { };
        var columns = [
            //{ header: "id"  , sortable: true, dataIndex: 'id' },
            { header: "名称", sortable: true, dataIndex: 'name' }
        ];
        var actions = {
            list  :{ title: "部门资料" },
            add   :{ title: "添加部门资料" },
            edit  :{ title: "编辑部门资料" },
            show  :{ title: "部门资料" },
            select:{ title: "部门资料" }
        }; 
        
        var Record = Wando.records.create({ 
            name  : "department",
            fields: ['id', 'name'],
            skip  : ['id']
        });

        this.module = new Wando.base.InfoModule({
            name    : "departments",
            url     : "departments",
            columns : columns,
            actions : actions,
            record  : Record,
            links   : { show:false, select:showSelect },
            extraItems: new Ext.FormPanel({ 
                labelAlign: 'right',
                position  : "top",
                frame     : true,
                items: [
                    { 
                        id:"pending-count-label", xtype: 'displayfield', width: 100, fieldLabel: "待分配数", value:0, 
                        labelStyle: 'font-weight:bold;', style: 'margin-top:5px;font-weight:bold;'
                    }
                ]
            }),
            formPanelCreator: this.createGroupFormPanel  //传入创建formPanel的函数
        });
    },
        
    createGroupFormPanel : function() {
        return new Ext.FormPanel({
            labelAlign: "top",
            frame :true,
            width :200,
            autoHeight:true,
            items: [
                { fieldLabel: '部门名称', name: 'name' , xtype:"textfield" }, 
            ]
        });
    }
};
