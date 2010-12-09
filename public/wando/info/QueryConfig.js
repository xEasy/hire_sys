Wando.base.Query.config = { 
    urls: { 
        'department/number'   : '/query/for_query?model_name=department', 
        'supplier/number'     : '/query/for_query?model_name=supplier',
        'category/number'     : '/query/for_query?model_name=category',
        'user/name'           : '/query/for_query?model_name=user',
        'requisition/state_cn': '/requisitions/states_for_query',
        'progress/number'     : '/query/for_query?model_name=progress',
        'unit/number'         : '/query/for_query?model_name=unit',
        'department/name'     : '/query/for_query?model_name=department',
        'sew/name'            : '/query/for_query?model_name=sew',
        'hire_order/state_cn' : '/sew_hire_orders/states_for_query',
        'return_item/state_cn'  : '/return_items/states_for_query',
        'return_order/state_cn' : '/sew_return_orders/states_for_query'
    },

    valueField: { 
        //租车单
        'hireOrder' : function  () {
          var urls = Wando.base.Query.config.urls;
          return {
            'id'               : { editor: 'text' },
            'department/name'  : { editor: 'combo', url: urls[ 'department/name' ] },
            'hire_person'      : { editor: 'text' },
            'create_date'      : { editor: 'date' },
            'create_time'      : { editor: 'text' },
            'state_cn'         : { editor: 'combo' , url: urls[ 'hire_order/state_cn' ] },
            'remark'           : { editor: 'text' }
          };
        },
        //退车单
        //
        'returnOrder' : function  () {
        var urls  = Wando.base.Query.config.urls;
          return {
            'id'                : { editor: 'text' },
              'department/name'   : { editor: 'combo', url: urls[ 'department/name' ] },
              'return_person'     : { editor: 'text' },
              'sew_dealer'        : { editor: 'text' },
              'create_date'       : { editor: 'date' },
              'create_time'       : { editor: 'text' },
              'state_cn'          : { editor: 'combo', url: urls[ 'return_order/state_cn' ] },
              'remark'            : { editor: 'text' }
          };
        },
        //租车明细
        'hireOrderDetail' : function  () {
            var urls  = Wando.base.Query.config.urls;
            return {
                'id'                : { editor: 'text' },
                'sew_hire_order_id' : { editor: 'text' },
                'sew/name'          : { editor: 'combo', url: urls['sew/name'] },
                'count'             : { editor: 'text' },
                'cloth_number'      : { editor: 'text' },
                'sew_hire_order/department/name'   : { editor: 'combo', url: urls['department/name'] },
                'hire_date'         : { editor: 'date' },
                'expect_return_date': { editor: 'date' },
                'sew_hire_order/state_cn' : { editor: 'combo', url: urls['hire_order/state_cn'] },
                'garage'            : { editor: 'text' },
                'dep_remark'        : { editor: 'text' },
                'price'             : { editor: 'text' },
                'sew_hire_order/hire_person' : { editor: 'text' },
                'purchasing_remark' : { editor: 'text' }
            }
        },
        //退车详细
        //
        'returnOrderDetail': function  () {
          var urls  = Wando.base.Query.config.urls; 
          return {
            'id'                    : { editor: 'text' },
            'sew_return_order_id'   : { editor: 'text'},
            'hire_item/sew/name'    : { editor: 'combo',url: urls[ 'sew/name' ] },
            'hire_item/garage'      : { editor: 'text' },
            'hire_item/sew_hire_order/department/name' : { editor: 'text' },
            'count'                 : { editor: 'text' },
            'hire_item/hire_date'   : { editor: 'date' },
            'return_date'           : { editor: 'date' },
            'sew_return_order/return_person' : { editor: 'text' },
            'sew_return_order/sew_dealer'    : { editor: 'text' },
            'sew_return_order/state_cn'      : { editor: 'combo', url: urls[ 'return_order/state_cn' ] },
            'state_cn'              : { editor: 'combo', url: urls[ 'return_item/state_cn' ] },
            'hire_item/price'       : { editor: 'text' },
            'remark'                : { editor: 'text' },
            'hire_item/cloth_number' : { editor: 'text' }
          }
        },
        //主页
        'homepage': function() { 
            var urls = Wando.base.Query.config.urls;
            return { 
                'id'               : { editor: 'text' },
                'department/number': { editor: 'combo', url: urls['department/number']    },
                'user/name'        : { editor: 'combo', url: urls['user/name']            },
                'category/number'  : { editor: 'combo', url: urls['category/number']      },
                'created_at'       : { editor: 'date' },
                'state_cn'         : { editor: 'combo', url: urls['requisition/state_cn'] },
                'supplier/number'  : { editor: 'combo', url: urls['supplier/number']      , display_content: '供应商'},
                'progress/number'  : { editor: 'combo', url: urls['progress/number']      , display_content: '执行状态'},
                'finished_date'    : { editor: 'date' },
                'remark'           : { editor: 'text' }
            };
        },

        //请购单项
        'detailpage': function() { 
            var urls = Wando.base.Query.config.urls;
            return { 
                'requisition_id'               : { editor: 'text' },
                'requisition/department/number': { editor: 'combo', url: urls['department/number'] },
                'requisition/user/name'        : { editor: 'combo', url: urls['user/name'] },
                'requisition/supplier/number'  : { editor: 'combo', url: urls['supplier/number'] },
                'requisition/category/number'  : { editor: 'combo', url: urls['category/number'] },
                'required_date'                : { editor: 'date' },
                'requisition/state_cn'         : { editor: 'combo', url: urls['requisition/state_cn'] },
                'requisition/progress/number'  : { editor: 'combo', url: urls['progress/number'] } ,
                'brand'                        : { editor: 'text' },
                'standard'                     : { editor: 'text' },
                'count'                        : { editor: 'text' },
                'unit/number'                  : { editor: 'combo', url: urls['unit/number'] },
                'recycled_count'               : { editor: 'text' },
                'requisition/created_date'     : { editor: 'date' },
                'usage'                        : { editor: 'text' },
                'remark'                       : { editor: 'text' },
                'purchasing_remark'            : { editor: 'text' }
            };
        }
    }
};
