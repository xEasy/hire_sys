/*
  var query = new Wando.base.Query({ 
      modelName                 : "requisition",
      outterGrid                : Wando.Homepage.grid,
      pagingToolbar             : Wando.Homepage.pagingToolbar,
      loadMask                  : true
      beforeQueryHandler        : function() {}
      queryHandler              : this.queryHandler,      //在点击查询按钮，进行查询后调用
      defaultCcv                : this.tmp,
      valueFieldConfigKey       : 'homepage'              //对应QueryConfig.js中的配置
  });
*/

Wando.base.Query = function(params) { 
    if(!params) params = {};
    
    this.loadMask                = params.loadMask || true;
    this.defaultCcv              = params.defaultCcv;
    this.modelName               = params.modelName;
    this.outterGrid              = params.outterGrid;
    this.outterStore             = params.outterGrid.store;
    this.pagingToolbar           = params.pagingToolbar;
    this.queryHandler            = params.queryHandler
    this.queryButtonClickHandler = params.queryButtonClickHandler;
    this.paramNames              = this.pagingToolbar.paramNames;
    this.valuePickers            = this._createValuePickers();

    var k = params.valueFieldConfigKey;
    this.valueFieldConfig = Wando.base.Query.config.valueField[k]();
    //valueFieldConfig结构：
    //  { { dataIndex: { editor: xx, url: xx } } }, 如
    //  { 
    //    'id'               : { editor: 'text' },
    //    'department/number': { editor: 'combo', url: urls['department/number'] },
    //  }

    
    //创建 内容列combo、条件列combo 和 值列combo
    this.contentsCombo = this._createLocalCombo({ 
        fields      : ['display_content', 'content'],
        data        : this._genContentsComboData(),
        displayField: 'display_content'
    });

    this.conditionsCombo = this._createLocalCombo({ 
        fields: ['display_condition', 'condition'],
        data  : [
            ['='     , 'equals'        ],
            ['>'     , 'greater_than'  ],
            ['<'     , 'less_than'     ],
            ['LIKE'  , 'like_any'      ],
            ['不等于', 'does_not_equal']
        ],
        displayField: 'display_condition'
    });

    this.valuesCombos = this._createValueCombos();
    ////
      

    this._setting();
    

    //用于记录查询参数
    //格式为：{ 标签: 查询参数 }，如
    //  queryOptionsCollection = { 
    //      "current": { model_name: 'x', ccv: 'x', fields: 'x', extra_params: 'x' },
    //      "tracy"  : { model_name: 'x', ccv: 'x', fields: 'x', extra_params: 'x' }
    //  }
    this.queryOptionsCollection = {};


    //查询窗口
    this.queryGrid   = this._createQueryGrid();
    this.queryWindow = this._createWindow({ items: [this.queryGrid], title: '查询', width: 300 });
};

Wando.base.Query.prototype = { 

    _genContentsComboData: function() { 
        var config = this.outterGrid.getColumnModel().config;
        var results = [];
        var c = this.valueFieldConfig;

        config.each(function(r) { 
            var dataIndex = r.dataIndex;
            //只有在QueryConfig.js中配置了的列才会作为查询列
            if(c[dataIndex]) results.push( [c[dataIndex]['display_content'] || r.header, dataIndex] );
            //结构:
            //results = [
            //    ['供应商', 'supplier/number'],
            //    ['状态'  , 'state_cn']
            //]
        });
        return results;
    },

    _createValuePickers: function() { 
        var text = new Ext.form.TextField();
        var date = new Ext.form.DateField({ format: 'Y/m/d' });

        var pickers = {
            combo: null,
            text : text,
            date : date
        };
        return pickers;
    },

    _createLocalCombo: function(params) { 
        var scope = this;
        var combo = new Ext.form.ComboBox({
            triggerAction : 'all',
            mode: 'local',
            editable: false,
            store: new Ext.data.ArrayStore({ fields: params.fields, data: params.data }),
            valueField  : params.displayField,
            displayField: params.displayField,
            listeners: { select: function(combo) { combo.fireEvent('blur'); } }
        });
        return combo;
    },

    //为value列中创建多个combo
    //输出：
    //  combos = { 
    //      'supplier/number'  : combo1,
    //      'department/number': combo2 
    //  }
    _createValueCombos: function() { 
        function createCombo(params) { 
            return new Ext.form.ComboBox({
                store: new Ext.data.JsonStore({ 
                    proxy :  new Ext.data.HttpProxy({ url: params.url, method: 'GET' }),
                    root  : 'content',
                    fields: [params.field]
                }),
                valueField  : params.field,
                displayField: params.field,
                editable: false, triggerAction : 'all',
                listeners: { select: function(combo) { combo.fireEvent('blur'); } }
            });
        }
        
        var scope=this, combos={}, store=this.contentsCombo.store, config=this.valueFieldConfig;

        store.each(function(r) { 
            var dataIndex = r.get('content');
            var c = config[dataIndex];
            if(c.editor == 'combo')  
                combos[dataIndex] = createCombo({ url: c.url, field: 'value' });
        });
        return combos;
    },

    _setting: function() { 
        this._setColumnModel();
        this._setGrid();
        this._setPagingToolbar();
        this._setCombo();
    },

    //Hack Extjs原有的排序
    //用sort参数代替sortable
    _setColumnModel: function() { 
        var cm = this.outterGrid.getColumnModel();
        var configs = cm.config;  //array

        configs.each(function(c) { 
            Ext.apply(c, { sort: c.sortable, sortable: false });
        });
    },

    _setGrid: function() { 
        var scope = this;
        
        function isColumnSortable(columnIndex) { 
            return scope.outterGrid.getColumnModel().config[columnIndex].sort
        }

        //添加grid的headerclick事件上默认监听器
        var headerclickHandler = function(grid, columnIndex, e) { 
            if(!isColumnSortable(columnIndex)) return false;

            //设置store的排序信息
            var store = grid.store;
            var field = grid.getColumnModel().getDataIndex(columnIndex);
            var orderInfo = store.orderInfo;

            var dir = (orderInfo && orderInfo.field == field) ? orderInfo.dir.toggle("ASC", "DESC") : "ASC";
            store.orderInfo = { 
                dir  : dir,
                field: field
            };
            //

            //构造extraParam
            var pn = scope.paramNames;
            var o = {}; 

            o[pn.start] = 0,
            o[pn.limit] = Wando.pageSize,
            o[pn.sort ] = field,
            o[pn.dir  ] = dir,

            //发送Ajax
            scope.work(scope.findQueryOptions('current'), o);
        }
        this.outterGrid.on("headerclick", headerclickHandler, this.outterGrid);
    },

    _setPagingToolbar: function() { 
        var scope = this;

        Ext.apply(scope.pagingToolbar, { 

            //此函数在点击 分页按钮(即 上一页 或 下一页) 时被调用
            //参照Ext.PagingToolbar.prototype.doLoad
            doLoad: function(start) { 
                var o = {}, pn = this.getParams();
                var orderInfo = this.store.orderInfo || {};

                o[pn.start] = start;
                o[pn.limit] = this.pageSize;
                o[pn.sort ] = orderInfo.field || undefined;
                o[pn.dir  ] = orderInfo.dir   || undefined;

                if(this.fireEvent('beforechange', this, o) !== false){
                    //被修改部分
                    scope.work(scope.findQueryOptions('current'), o);
                    //
                }
            }
        });
    },

    //添加combo select事件上的监听器
    _setCombo: function() { 
        var scope = this;

        this.contentsCombo.on('select', function(combo, record, index){ 
            var storeRecord = scope.queryGrid.getSelectionModel().selection.record;
            storeRecord.data.content = record.get('content');
        }); 

        this.conditionsCombo.on('select', function(combo, record, index){ 
            var storeRecord = scope.queryGrid.getSelectionModel().selection.record;
            storeRecord.data.condition = record.get('condition');
        });
    },



    _createQueryGrid: function() { 
        var scope = this;
        var store = new Ext.data.JsonStore({
            url : "/",
            root: "content",
            fields: ['id', 'display_content', 'content', 'display_condition', 'condition', 'value']
        });
    
        var formatDate = function(value, mataData, record, rowIndex, colIndex, store) { 
            if(value && value.constructor == Date) value = value.format("Y-m-d");
            return value;
        };

        var grid = new Ext.grid.EditorGridPanel({
            store : store,
            height: 350,
            tbar  : [{ 
                text: "添加", handler: function() { 
                    var selection = scope.queryGrid.getSelectionModel().selection;
                    var rowIndex = (selection && selection.cell[0]) || null;
                    scope._addRecord({ display_condition: '=', condition: 'equals' }, rowIndex); 
                } 
            }, '-', { 
                text: "清除", handler: function() { scope._removeRecord(); }
            
            }, '-', { 
                text: "清除全部", handler: function() { scope._removeRecords(); } 
            }, '-', { 
                text: '查询', handler: function() { scope._sendQuery(); }, icon: "/images/go-to-post.gif" 
            }, '->', { 
                text: '关闭', handler: function() { scope.queryWindow.hide(); }, 
            }],
            stripeRows: true,
            clicksToEdit: 1,
            columns: [
                { header: "内容", dataIndex: 'display_content'  , editor: this.contentsCombo, width: 80 },
                { header: "条件", dataIndex: 'display_condition', editor: this.conditionsCombo, width: 60 },
                { header: "值"  , dataIndex: 'value', renderer: formatDate, width: 80 }
            ],
            viewConfig: { forceFit: true },
            listeners: { 
                cellclick: function(grid, rowIndex, columnIndex) { 
                    if(columnIndex == 2) { 
                        var record = grid.store.getAt(rowIndex);
                        var k = record.get('content');
                        var c = scope.valueFieldConfig[k];

                        //更换editor
                        var columnConfig = scope.queryGrid.getColumnModel().config[2]; 
                        columnConfig.editor = c.editor == 'combo' ? scope.valuesCombos[k] : scope.valuePickers[c.editor];
                    }
                }
            }
        });
        return grid;
    },

    _createWindow: function(params) { 
        var scope = this;
        return new Ext.Window({ 
            title       : params.title,
            width       : params.width,
            resizable   : false,
            autoHeight  : true,
            constrain   :true,
            closeAction : 'hide',
            modal       : false,
            x           : 0,
            items       : params.items
        });
    },


    //更新排序信息 和 header图标
    _updateOrderInfo: function(queryOptions) { 
        var extraParams = queryOptions.extra_params;
        var pn   = this.paramNames;
        var sort = extraParams[pn.sort];
        var dir  = extraParams[pn.dir ];

        //清除header排序图标
        var view = this.outterGrid.getView();
        view.mainHd.select('td').removeClass(view.sortClasses);
        //
        
        if(sort && dir) { 
            this.outterStore.orderInfo = { field: sort, dir: dir };

            //更新header图标
            var columnIndex = this.outterGrid.getColumnModel().findColumnIndex(sort); 
            view.updateSortIcon(columnIndex, dir);
        } 
    },

    //Hack pagingToolbar的代价
    //此函数目的是设置pagingToolbar的cursor指针(可理解为设置offset参数)
    _storeLoadData: function(obj, append, queryOptions) { 
        var store = this.outterStore;
        var options = { 
            add: append, 
            params: queryOptions.extra_params 
        };
        
        //本可用loadData函数,但loadData是不能带上options参数的
        var r = store.reader.readRecords(obj);
        store.loadRecords(r, options, true);
    },

    _addRecord: function(params, rowIndex) { 
        if(!params) params = {};
        var store = this.queryGrid.store;
        var r = new store.recordType(params);
        rowIndex ? store.insert(rowIndex+1, r) : store.add(r)
    },

    _removeRecord: function() { 
        var record = this.queryGrid.getSelectionModel().selection.record;
        record.data.value = undefined;
        record.commit();
    },

    _removeRecords: function() { 
        this.queryGrid.store.removeAll();
        this._showDefaultRecords();
    },

    _showDefaultRecords: function() { 
        var scope = this;
        this.contentsCombo.store.each(function(r) { 
            var data = {
                display_content   : r.get('display_content'),
                content           : r.get('content'),
                display_condition : '=',
                condition         : 'equals',
                value             : undefined
            };

            scope._addRecord(data);
        });
    },
    
    _sendQuery: function() { 
        var scope = this;
        this.queryButtonClickHandler && this.queryButtonClickHandler();

        this.queryGrid.stopEditing();
        var store = this.queryGrid.store;

        //清除排序信息
        this.pagingToolbar.store.orderInfo = undefined; 

        var ccv = [];
        store.each(function(record) { 
            var dt = record.get("content");
            var dn = record.get("condition");
            var de = record.get("value");

            //三列均有取值
            if(dt && dn && de) {
                ccv.push({ 
                    content  : dt,    
                    condition: dn,
                    value    : de
                });
            }
        });

        var queryOptions = scope.createQueryOptions('_tmp_', ccv);
        scope.work(queryOptions, { offset: 0, limit: Wando.pageSize }, { success: this.queryHandler });
    },

    //保存一个查询参数queryOptions
    //参数：标签+参数
    _saveQueryOptions: function(tag, queryOptions) { 
        this.queryOptionsCollection[tag] = queryOptions;
    },


    /////////////////////////////////////////public methods/////////////////////////////////
    //参数格式：
    //  queryOptions: { 
    //      model_name  : 'xx',
    //      ccv         : [
    //          { content: 'xx', condition: 'xx', value: 'xx' },
    //          { content: 'xx', condition: 'xx', value: 'xx' }
    //      ]
    //      fields      : ["id", "department/number", "user/name"],
    //      extraParams : {}
    //  }
    //
    //  extraParams: { offset: 0, limit: 10, order: "id ASC" }
    work: function(queryOptions, extraParams, handler) { 
        var scope = this;
        if(scope.loadMask) { 
            var mask = new Ext.LoadMask(scope.outterGrid.body, { msg: "loading..." });
            mask.show();
        }
        if(!handler) handler = {};
        

        //如果给定extraParams，替换原来的extra_params
        if(extraParams)
            Ext.apply(queryOptions, { extra_params: extraParams });

        Ext.Ajax.request({ 
            url:    '/query/work',
            method: 'POST',
            jsonData: queryOptions,
            success: function(response, opts) { 
                mask && mask.hide();
                scope._saveQueryOptions("current", queryOptions);
                scope._updateOrderInfo(queryOptions);

                //导入数据
                scope._storeLoadData(Ext.decode(response.responseText), false, queryOptions);
                handler.success && handler.success(response, opts);
            },
            failure: function(response, opts) { 
                mask && mask.hide();
                handler.failure && handler.failure(response, opts);
            } 
        });
    },


    showWin: function() { 
        (this.queryGrid.store.getCount() == 0) && this._showDefaultRecords();
        this.queryWindow.show(); 
    },


    //创建一个查询参数queryOptions
    //提供ccv 和 extraParams,自动补全其他参数，然后保存查询参数
    //调用：
    //  this.query.createQueryOptions(
    //      "approved", [{ content: "state_cn", condition: "equals", value: "已批准" }]
    //  );
    createQueryOptions: function(tag, ccv, extra_params) { 
        if(!extra_params) extra_params = {};
        
        ccv = ccv || [];
        
        if(this.defaultCcv) ccv = ccv.concat(this.defaultCcv)

        //去除ccv中的 null 和 undefined
        for(var i=0; i<ccv.length; i++) { 
            if(!ccv[i]) ccv.splice(i, 1)
        }

        var queryOptions = {
            model_name  : this.modelName,
            fields      : this.outterStore.fields.keys,
            extra_params: Ext.apply({ offset: 0, limit: Wando.pageSize }, extra_params),
            ccv         : ccv
        };
        this._saveQueryOptions(tag, queryOptions);
        return queryOptions;
    },
    
    findQueryOptions: function(tag) { 
        return this.queryOptionsCollection[tag]; 
    }
};



//汇总sum & 计数count 相关
Ext.apply(Wando.base.Query.prototype, { 

    _calculate: function(type, queryOptions, fields, handler) { 
        var o = { 
            model_name: queryOptions.model_name,
            ccv       : queryOptions.ccv,
            fields    : fields
        }; 

        Ext.Ajax.request({ 
            url:    String.format('/query/{0}', type),
            method: 'POST',
            jsonData: o,
            success: handler && handler.success,
            failure: handler && handler.failure 
        });
    },

    //fields 要统计的列，如 ["department/number"]
    sum: function(queryOptions, fields, handler) { 
        this._calculate('sum', queryOptions, fields, handler);
    }, 

    //fields 要计数的列
    count: function(queryOptions, fields, handler) { 
        this._calculate('count', queryOptions, fields, handler)
    },

    allCount: function(queryOptionsArray, fields, handler) { 
        var os = [];
        
        queryOptionsArray.each(function(queryOptions) { 
            var o = { 
                model_name: queryOptions.model_name,
                fields    : fields,
                ccv       : queryOptions.ccv
            };
            os.push(o);
        });

        Ext.Ajax.request({ 
            url:    '/query/all_count',
            method: 'POST',
            jsonData: { all_count: os },
            success: handler && handler.success,
            failure: handler && handler.failure
        });
    }
});
