
Wando.Role = {
    init: function(showSelect) {
        var closeWindow = function () { };
        var columns = [
            { header: "编号", sortable: true, dataIndex: 'title' }
        ];
        var actions = {
            list  :{ title: "用户组资料" },
            add   :{ title: "添加用户组资料" },
            edit  :{ title: "编辑用户组资料" },
            show  :{ title: "用户组资料" },
            select:{ title: "用户组资料" }
        }; 
        
        var Record = Wando.records.create({ 
            name  : "role",
            fields: ['id', 'title'],
            skip  : ['id']
        });

        this.module = new Wando.base.InfoModule({
            name    : "role",
            url     : "role",
            columns : columns,
            actions : actions,
            record  : Record,
            links   : { show:false, select:showSelect },
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
                { fieldLabel: '用户组名称', name: 'title' , xtype:"textfield" }, 
            ]
        });
    }
};
