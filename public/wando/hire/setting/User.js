
Wando.User = {
    init: function(showSelect) {
        showSelect = (showSelect === undefined ? true : showSelect);
        var closeWindow = function () { };
        var columns = [
            { header: "用户名", sortable: true, dataIndex: 'login' },
            { header: "姓名", sortable: true, dataIndex: 'name' },
            { header: "部门", sortable: true, dataIndex: 'department_name' },
            { header: "用户组", sortable: true, dataIndex: 'role_title' }
        ];
        var actions = {
            list  :{ title: "用户资料" },
            add   :{ title: "添加用户资料" },
            edit  :{ title: "编辑用户资料" },
            show  :{ title: "用户资料" },
            select:{ title: "用户资料" }
        }; 
        
        var Record = Wando.records.create({ 
            name  : "user",
            fields: ['id', 'login', 'role_title', 'name', 'department_name'],
            skip  : ['id']
        });

 //     var pm = new Wando.PermissionManager(Wando.erbData.allPermitted);
 //     var deletable = pm.permittedTo("destroy", "users");
 //     var editable  = pm.permittedTo("edit", "users");
        var deletable = true;
        var editable  = true;

        this.module = new Wando.base.InfoModule({
            name    : "user",
            url     : "user",
            columns : columns,
            actions : actions,
            record  : Record,
            links   : { show: false, select: showSelect, edit: false, remove: deletable, edit: editable },
            formPanelCreator: this.createGroupFormPanel,  //传入创建formPanel的函数
            extraLinks: { "重置密码": this.resetSecret },
            customerActionsHandler: { 
                add : function()   { location.href = "/signup"; },
                edit: function(r)  { location.href = "/users/" + r.data.id + "/edit"; } 
            }
        });
    },
        
    createGroupFormPanel : function() {
        return new Ext.FormPanel({
            labelAlign: "top",
            frame :true,
            width :200,
            autoHeight:true,
            items: [
                { fieldLabel: '用户名称', name: 'number' , xtype:"textfield" }, 
            ]
        });
    },

    resetSecret: function(record) { 
        Ext.Msg.confirm("请确认：", "是否将用户密码重置为000000?<br />确认后将不能撤销", function(btnId) {
            if (btnId == 'yes') {
                Ext.Ajax.request({ 
                    url:    '/users/' + record.data.id + '.json',
                    method: 'PUT',
                    jsonData: { user: { password: '000000', password_confirmation: '000000' }, type: 'reset_secret' },
                    failure: function(response, opts) { Ext.Msg.alert('提示', '重置用户密码失败'); } 
                });
            }
        });
    }
};

