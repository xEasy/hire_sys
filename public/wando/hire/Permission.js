
Wando.Permission = { 

    init: function() { 

        this.form = this.createFormPanel();

        new Ext.Viewport({
            layout: 'border',
            frame: true,
            items: [
                Wando.menuStub,
                { 
                    region: 'center',
                    split : false,
                    layout: 'anchor',
                    items : [this.form]
                }
            ]
        });
    },

    createFormPanel: function() { 
        return new Ext.FormPanel({
            title : '权限管理',
            frame : true,
            border: false,
            height: 800,
            items : this.createContainers()
        });
    },

    createContainers: function() { 
        var scope = this;
        var records  = Wando.erbData.records;
        var stubHtml = "<div style='height: 20px'></div>";
        var containers = [];
        this.combo = this.createCombo();

        containers.push(this.combo);
        containers.push({ html: stubHtml });
        
        for(var i=0; i<records.length; i++) { 
            containers.push({
                layout: 'column',
                border: false,
                defaults: {
                    columnWidth: '.1',
                    border: false
                },            
                defaultType: 'checkbox',
                html: String.format("<span class='permission'>{0}:</span>", records[i].controller_zh),
                items: this.createCheckboxes(records[i].actions)
            });

            containers.push({ html: stubHtml });
        }

        containers.push({ html: stubHtml });
        containers.push({ xtype: 'button', text : '保存', width: 50, handler: function(){ scope.save(); } });
        return containers; 
    },

    createCheckboxes: function(actions) { 
        var items = [];
        for(var i=0; i<actions.length; i++) { 
            items.push({ 
                boxLabel: actions[i].action_zh,
                id      : actions[i].id, 
                name    : 'action'
            });
        }
        return items;
    },


    createCombo: function() { 
        var scope = this;
        return new Ext.form.ComboBox({
            typeAhead: true,
            triggerAction: 'all',
            editable: false,
            width: 100,
            fieldLabel: "<span class='permission'>选择用户组</span>",
            store: new Ext.data.JsonStore({
                root: 'content',
                url: '/roles/for_ext_select',
                fields: ['id', 'value']
            }),
            valueField: 'value',
            displayField: 'value',
            style: { margin: '0 0 0 -10px' },
            listeners: { 
                select: function(combo, record, index) { 
                    scope.roleId = record.get('id');
                    Ext.Ajax.request({ 
                        url:    String.format('/roles/{0}/permission_ids', record.get('id')),
                        method: 'GET',
                        success: function(response, opts) { 
                            var ids = Ext.decode(response.responseText).content;

                            var cbs = Ext.query('[type=checkbox]');
                            for(var i=0; i<cbs.length; i++) { 
                                cbs[i].checked = false;
                            }

                            for(var i=0; i<ids.length; i++) { 
                                var id = ids[i];
                                Ext.getCmp(id).setValue(true);
                            }
                        },
                        failure: function(response, opts) { 
                            Ext.Msg.alert('提示', '读取权限失败');
                        } 
                    });
                }
            }
        });
    },

    save: function() { 
        if(!this.roleId) return false;

        var cbs = Ext.query('*[name=action]');
        var ids = [];
        for(var i=0; i<cbs.length; i++) { 
            if(cbs[i].checked) ids.push(cbs[i].id);
        }

        Ext.Ajax.request({ 
            url:    String.format('/roles/{0}/update_permission_ids', this.roleId),
            method: 'PUT',
            jsonData: { ids: ids },
            success: function(response, opts) { 
                Ext.Msg.alert('提示', '更新成功');
            },
            failure: function(response, opts) { 
                Ext.Msg.alert("提示", Ext.decode(response.responseText).content.error_messages);
            } 
        });
    }

};
