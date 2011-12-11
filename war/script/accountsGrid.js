
Voltan.billManager.accountsFn = function(cfg){


	var proxy = new Ext.ux.data.SeamRemotingProxy({
		remoteMethod: cfg.sessionProxy.accountManager.getUserAccounts,
		writeMethod: cfg.sessionProxy.accountManager.persistAccounts
	});

	var recordContructor = Ext.data.Record.create([{
		name: 'id'
	}, {
		name: 'name'
	}, {
		name: 'activeStatus',
		defaultValue:'ACTIVE'
	}, {
		name: 'house'
			//mapping: 'house.id'
	}]);

	var reader = new Ext.ux.data.SeamRemotingJsonReader({
		id: 'id',
		root: 'data'
	}, recordContructor);


	/*var writer = {
		house: function(val){
			var x = new Seam.Remoting.createType('org.domain.testSeam21a.entity.Houses');
			x.id = val;
			return x;
		}
	};*/

	var dataStore = new Ext.data.Store({
		proxy: proxy,
		reader: reader
		//writer: writer
	});



	// somehow this doesnt work, but it does if you call it after grid rendered
	// even then, the grid filter is not on
	dataStore.on('load', function(dataStore){
		//dataStore.filter('activeStatus','ACTIVE');
	});
	dataStore.load();
	//create list of tasks

	var groupStore = cfg.groupListStoresBuilder.getNewUserGroupStore();

	groupStore.on('load',function(groupStore){
		groupStore.filter('relationshipStatus', 'ACTIVE');	
	});
	groupStore.load();

	var getAccountComboChooser = function(){
		return {
			id:'getAccountComboChooser',
			typeAhead: true,
			mode: 'local',
			allowBlank: false,
			triggerAction: 'all',			
			//By enabling lazyRender this prevents the combo box
			//from rendering until requested
			lazyRender: true,//should always be true for editor
			//where to get the data for our combobox
			store: dataStore,
			//the underlying data field name to bind to this
			//ComboBox (defaults to undefined if mode = 'remote'
			//or 'text' if transforming a select)
			displayField: 'name',
			//the underlying value field name to bind to this
			//ComboBox
			valueField: 'id'
		};
	};


	var getGroupComboChooser = function(){

		return new Ext.form.ComboBox({
			//if we enable typeAhead it will be querying database
			//so we may not want typeahead consuming resources
			id:'groupComboChooser',			
			typeAhead: true,
			mode: 'local',
			allowBlank: false,
			triggerAction: 'all',

			//By enabling lazyRender this prevents the combo box
			//from rendering until requested
			lazyRender: true,//should always be true for editor
			//where to get the data for our combobox
			store: groupStore,

			//the underlying data field name to bind to this
			//ComboBox (defaults to undefined if mode = 'remote'
			//or 'text' if transforming a select)
			displayField: 'name',
			//the underlying value field name to bind to this
			//ComboBox
			valueField: 'houseId'
		});
	}



	var getNewActiveStatusStore = function(){		
		return new Ext.data.SimpleStore({
			data: [['ACTIVE'], ['INACTIVE']],
			fields: ['activeStatus'],
			id: 0
		});
	}
	var getActiveStatusComboChooser = function(){

		return new Ext.form.ComboBox({
			//if we enable typeAhead it will be querying database
			//so we may not want typeahead consuming resources
			typeAhead: false,
			mode: 'local',
			allowBlank: false,
			triggerAction: 'all',		
			lazyRender: true,//should always be true for editor
			//where to get the data for our combobox
			store: getNewActiveStatusStore(),

			//the underlying data field name to bind to this
			//ComboBox (defaults to undefined if mode = 'remote'
			//or 'text' if transforming a select)
			displayField: 'activeStatus',
			//the underlying value field name to bind to this
			//ComboBox
			valueField: 'activeStatus'
		});
	}						

	var colModel = new Ext.grid.ColumnModel([
	                                         {header: Voltan.i18ln.labels.id, width: 60, sortable: true, dataIndex: 'id'},
	                                         {header: Voltan.i18ln.labels.name, width: 80, sortable: true, dataIndex: 'name',
	                                        	 editor: new Ext.form.TextField({ 
	                                        		 //specify options
	                                        		 allowBlank: false 
	                                        	 })
	                                         },
	                                         {  
	                                        	 header:Voltan.i18ln.labels.accountStatus, 
	                                        	 width:80,
	                                        	 sortable:true,
	                                        	 dataIndex: 'activeStatus',				
	                                        	 editor:getActiveStatusComboChooser()		
	                                         },
	                                         {
	                                        	 dataIndex: 'house',
	                                        	 header: Voltan.i18ln.labels.house,
	                                        	 sortable: true,
	                                        	 width: 50,

	                                        	 //create a dropdown based on server side data (from db)
	                                        	 editor: getGroupComboChooser(),
	                                        	 renderer:  //custom rendering specified inline
	                                        		 function(data) {
	                                        		 var index = groupStore.find('houseId',data);
	                                        		 var record = groupStore.getAt(index);
	                                        		 if(record) {
	                                        			 return record.data.name;
	                                        		 } else {
	                                        			 //return data;
	                                        			 return 'missing data';
	                                        		 }
	                                        	 }
	                                         }

	                                         //{header: "linked to group", width: 320, sortable: true, dataIndex: 'group'  } 
	                                         ]);

	/* var filters = new Ext.grid.GridFilters({
41 filters:[
42 {type: 'numeric', dataIndex: 'id'},
43 {type: 'string', dataIndex: 'company'},
44 {type: 'numeric', dataIndex: 'price'},
45 {type: 'date', dataIndex: 'date'},
46 {
47 type: 'list',
48 dataIndex: 'size',
49 options: ['small', 'medium', 'large', 'extra large'],
50 phpMode: true
51 },
52 {type: 'boolean', dataIndex: 'visible'}
53 ]});
http://127.0.0.1/examples/grid-filtering/grid-filter.html
	 */
//	getStore().getAt(x).
//	css= td > div:contains('missing data')

	var filters = new Ext.grid.GridFilters({
		filters:[
		         {
		        	 type: 'list',
		        	 dataIndex: 'activeStatus',
		        	 options: ['ACTIVE','INACTIVE']//,
		         //active:true
		         }
		         ],
		         local:true});

	var grid = Voltan.extExtension.util.editorGridBuilder.buildGrid({
		id:'accountsGrid',                
		persistUrl: '/persistAccounts',        
		store: dataStore,        
		colModel: colModel,
		plugins: filters,
		editOnAddCol:'name',
		loadMask: true,
		sm: new Ext.grid.RowSelectionModel({singleSelect: true}),
		stripeRows: true,
		clicksToEdit:2,
		editOnAddCol:true,
		height:200,
		width:700,
		title:'Your Accounts',
		viewConfig: {
			forceFit: true
		}
	});


	grid.getSelectionModel().on('rowselect', function(sm, rowIdx, r) {		 		 
		grid.selectedRow = r;
		//r.data;
	});
	grid.on('rowcontextmenu',function(grid,rowIndex,e ){
		e.stopEvent();
		//if (!grid.contextMenu) {
		var account = grid.getStore().getAt(rowIndex).data;
		grid.contextMenu = new Ext.menu.Menu({
			//id:'accountsGridContextMenu',
			items: [{
				text: Voltan.i18ln.labels.createBill,
				disabled:account.activeStatus==='ACTIVE'?false:true,
						handler: function(){
							//create form
							var accountId = account.id
							createNewBill(accountId);							
							grid.contextMenu.hide();
							//close this
						}
			}, {
				text:Voltan.i18ln.labels.viewBillsSummary,
				handler: function(){
					viewBillsHistory(rowIndex,grid);
					//create form														
					grid.contextMenu.hide();
					//close this
				}
			}]

		});

		grid.contextMenu.showAt(e.getXY());


	}); 


	var createNewBill = function(accountId){

		var accountField = null;
		if(accountId){
			accountField = { 
					xtype: 'hidden',       		       
					name: 'account',
					value: accountId
			}
		}
		else{
			var accountFieldConfig = getAccountComboChooser();
			accountFieldConfig.name= 'account';
			accountFieldConfig.fieldLabel='Account';
			accountField = new Ext.form.ComboBox(accountFieldConfig);
			//value= accountId;
		}


		var newBillPanel = new Ext.ux.form.SeamFormPanel({ 
			seamComponent: cfg.sessionProxy.accountManager,
			remoteMethod: cfg.sessionProxy.accountManager.createBill, 
			reader:{},
			writer:{account: function(val){ var x = new Seam.Remoting.createType('org.domain.testSeam21a.entity.Account'); x.id = val; return x; },
				billdate: function(val){
					return null;//val.getTime();
				},
				amount: Ext.util.Format.centWrite			
			},
			domainType:'org.domain.testSeam21a.entity.Bill',
			useWriter:true,
			id: 'createBillForm',
			baseCls: 'x-plain',
			labelWidth: 120,
			defaults: {
				width: 200,
				validationEvent: false,
				allowBlank: false
			},
			frame: false,
			height: 100, 
			items:[
			       accountField,
			       { 
			    	   xtype: 'textfield',
			    	   fieldLabel:'Bill Name',
			    	   inputType: 'text',
			    	   name: 'name'
			       },
			       { 
			    	   xtype: 'numberfield',
			    	   fieldLabel:'Bill Amount in $',
			    	   //Ext.util.Format.centMoney
			    	   inputType: 'text',
			    	   allowNegative:false,
			    	   //allowBlank:false,
			    	   name: 'amount',
			    	   listeners:{

			    	   }
			       },
			       { 
			    	   xtype: 'datefield',
			    	   fieldLabel:'Date of Bill',
			    	   showToday:true,
			    	   inputType: 'text',		
			    	   name: 'billdate',
			    	   value:new Date()
			       }
			       ]
		});


		var win = win ||  new Ext.Window({
			closable:true,
			id:'createAccountWindow',
			closeAction :'close',
			collapsible:false,
			modal:true,
			//x:e.getXY()[0],
			//y:e.getXY()[1],
			items:newBillPanel,
			buttons: [{
				text: 'Create',
				handler:function(){
					if(!newBillPanel.form.isValid()){
						newBillPanel.form.markInvalid();
						return;
					} 	 
					newBillPanel.form.submit({
						success: function(form, results){
							cfg.owagesManager.reload();
						},
						failure: function(form, results){							
							Ext.Msg.alert('Status', Voltan.i18ln.labels.saveFailure);
						}
					});				 
					win.close();}
			},{
				text: 'Cancel',
				handler:function(){ win.close();}
			}]


		});

		win.show();

	}

	var billHistoryProxy = new Ext.ux.data.SeamRemotingProxy({
		remoteMethod: cfg.sessionProxy.accountManager.getBillHistory, 
		seamComponent: cfg.sessionProxy.accountManager
	});

	var billHistoryRecordContructor = Ext.data.Record.create([	
	                                                          {name: 'name', mapping: 'name'},
	                                                          {name: 'amount', mapping: 'amount',convert:Ext.util.Format.centRead},
	                                                          {name: 'amountPerPerson', mapping: 'amountPerPerson',convert:Ext.util.Format.centRead},
	                                                          {name:'message',mapping: 'message'},
	                                                          {name:'created',mapping: 'created'},
	                                                          {name:'personsOnBill',mapping: 'personsOnBill'}       
	                                                          ]);

	var billHistoryReader = new Ext.ux.data.SeamRemotingJsonReader(
			{id: 'created', root:'data'}, billHistoryRecordContructor );

	var billHistoryStore = new Ext.data.Store({
		proxy: billHistoryProxy,
		reader: billHistoryReader
	});		

	var viewBillsHistory = function(rowIndex, grid){
		var account = grid.getStore().getAt(rowIndex).data;
		billHistoryStore.load({params:{accountId:account.id}});
		var panel = new Ext.grid.GridPanel({
			//id:'accountsGrid',
			store:billHistoryStore,
			title:'Summary of bills for account '+account.name,
			columns: [		        
			          {header: Voltan.i18ln.labels.name, width: 120, sortable: false, dataIndex: 'name'},				
			          {header: Voltan.i18ln.labels.amountOfMoney, width: 120, sortable: false, dataIndex: 'amount',renderer:Ext.util.Format.usMoney},
			          {header: Voltan.i18ln.labels.amountPerPerson, width: 120, sortable: false, dataIndex: 'amountPerPerson',renderer:Ext.util.Format.usMoney},				
			          {header: Voltan.i18ln.labels.message, width: 120, sortable: false, dataIndex: 'message'},
			          {header: Voltan.i18ln.labels.personsOnBill, width: 120, sortable: false, dataIndex: 'personsOnBill'},
			          {header: Voltan.i18ln.labels.date, width: 120, sortable: false, dataIndex: 'created'}
			          ],				             
			          height:200,
			          width:850,
			          sm: new Ext.grid.RowSelectionModel({singleSelect: true}),
			          stripeRows: true,
			          viewConfig: {
			        	  forceFit: true
			          }
		});

		var win = win ||  new Ext.Window({
			id:'billSummaryWindow',	
			closable:true,
			closeAction :'close',
			collapsible:false,
			modal:true,
			items:panel	
		});

		win.show();

	}	



	grid.on({
		'mouseover' : {
			fn: cfg.helpManager.show,
			scope: Voltan.i18ln.labels.help.accounts
		}
	} ); 


	return{
		getGrid:function(){
			return grid;
		},
		createNewBill:createNewBill
	}

};


