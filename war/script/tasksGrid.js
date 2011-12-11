
Voltan.billManager.userTasksFn = function(cfg){


	var comp = cfg.sessionProxy.taskManager;

	var tasksProxy = new Ext.ux.data.SeamRemotingProxy({
		remoteMethod: comp.getUserTasks, 
		seamComponent: comp
	});

	var recordContructor = Ext.data.Record.create([{name: 'id'},
	                                               {name: 'taskName'},
	                                               {name: 'shareOfBill',convert:Ext.util.Format.centRead},
	                                               {name: 'amountPreviouslyOwedToUser',convert:Ext.util.Format.centRead},
	                                               {name: 'userCreated', mapping: 'billPaid.account.user.name'},
	                                               {name: 'userCreatedId', mapping: 'billPaid.account.user.id'},
	                                               {name: 'amountNowOwingToUser',convert:Ext.util.Format.centRead},
	                                               {name: 'amountPreviouslyOwedToUser',convert:Ext.util.Format.centRead},
	                                               {name: 'billDetails', mapping: 'billPaid.name'}, 
	                                               {name: 'confirmedByte', mapping: 'confirmedByte'}      
	                                               ]);

	var reader = new Ext.ux.data.SeamRemotingJsonReader({id: 'id', root:'data'}, recordContructor );


	var tasksDataStore = new Ext.data.Store({
		proxy: tasksProxy,
		reader: reader
	});
//	create list of tasks
	var renderBoolean = function(confirmedByte){ 
		var result = confirmedByte?"Yes":"No"; 
		return result;
	}

	tasksDataStore.on('load',function(tasksDataStore){
		//tasksDataStore.filter('confirmedByte', 0); 
	})

	tasksDataStore.load();


	var grid = new Ext.grid.GridPanel({
		id:'tasksGrid',
		store: tasksDataStore,

		columns: [
		          {id:'ident',header: Voltan.i18ln.labels.id, width: 60, sortable: true, dataIndex: 'id'},
		          {header: Voltan.i18ln.labels.name, width: 80, sortable: true, dataIndex: 'taskName'},
		          {header: Voltan.i18ln.labels.amountToPay, width: 120, sortable: true, dataIndex: 'shareOfBill',renderer:Ext.util.Format.usMoney},
		          {header: Voltan.i18ln.labels.createdBy, width: 120, sortable: true, dataIndex: 'userCreated'},
		          {header: Voltan.i18ln.labels.amountNowOwingToUser, width: 120, sortable: true, dataIndex: 'amountNowOwingToUser',renderer:Ext.util.Format.usMoney},
		          {header: Voltan.i18ln.labels.amountPreviouslyOwing, width: 120, sortable: true, dataIndex: 'amountPreviouslyOwedToUser',renderer:Ext.util.Format.usMoney},
		          {header: Voltan.i18ln.labels.billDetails, width: 120, sortable: true, dataIndex: 'billDetails'},
		          {header: Voltan.i18ln.labels.acknowledged, width: 120, sortable: true,renderer:renderBoolean, dataIndex: 'confirmedByte'},			           
		          ],
		          sm: new Ext.grid.RowSelectionModel({singleSelect: true}),
		          stripeRows: true,

		          height:200,
		          width:850,
		          title:Voltan.i18ln.labels.outstandingTasks,
		          viewConfig: {
		        	  forceFit: true
		          }
	}); 


	grid.on('rowcontextmenu',function(grid,rowIndex,e ){
		e.stopEvent();
		var task = grid.getStore().getAt(rowIndex).data;

		grid.contextMenu = new Ext.menu.Menu({
			id:'tasksGridContextMenu',
			items: [{
				text: Voltan.i18ln.labels.makePayment,
				handler: function(){
					var amountOwed = cfg.owagesManager.getAmountOwing(task.userCreatedId);
					var showPaymentDialog = function(){									
						cfg.owagesManager.createActualPayment(task.userCreatedId,amountOwed);									
					}							
					if(amountOwed<=0){
						Ext.Msg.confirm('',Voltan.i18ln.labels.confirmPayWhenNoOwage,
								function(continuePayment){
							if (continuePayment === 'yes') {
								showPaymentDialog();
							}
						});
					}
					else{
						showPaymentDialog();
					}
					grid.contextMenu.destroy();
					//close this
				}
			},
			{
				text: 'acknowledge',
				disabled:task.confirmedByte,
				handler: function(){
					//create form
					comp.acknowledgeTask(task.id, 
							function(savedTask){
						var row = grid.getStore().getAt(rowIndex);
						row.data.confirmedByte = savedTask.confirmedByte;
						row.commit();
					});
					//viewPaymentHistory(rowIndex,owingGrid);							
					grid.contextMenu.destroy();
					//close this
				}
			},]

		});

		grid.contextMenu.showAt(e.getXY());


	});			



	grid.on({
		'mouseover' : {
			fn: cfg.helpManager.show,
			scope: Voltan.i18ln.labels.help.tasks
		}
	} );


	return{
		getTaskGrid:function(){

			return grid;
		}
	}

};


