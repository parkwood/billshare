//Ext.namespace('widd.industries');

widd.industries.testFormOnReady = function(){

	Ext.QuickTips.init();
	var sessionProxy = {
			groupList : Seam.Component.getInstance('groupList'),
			accountManager : Seam.Component.getInstance('accountManager'),
			taskManager : Seam.Component.getInstance('taskManager')
	};
	var groupListStoresBuilder = groupListStoresBuilderFn(sessionProxy.groupList);
	var userGroupManager = userGroupManagerFn({sessionProxy:sessionProxy,storesBuilder:groupListStoresBuilder});
	var userAccountsManager = userAccountsFn({sessionProxy:sessionProxy,groupListStoresBuilder:groupListStoresBuilder});

	var cfg = {sessionProxy:sessionProxy};

	var newBillPanel = new Ext.ux.form.SeamFormPanel({ 
		seamComponent: cfg.sessionProxy.accountManager,
		remoteMethod: cfg.sessionProxy.accountManager.createBill, 
		id: 'newBillForm',
		baseCls: 'x-plain',
		labelWidth: 120,
		defaults: {
			width: 200,
			validationEvent: false,
			allowBlank: false
		},
		frame: false,
		height: 70, 
		items:[
		       { 
		    	   xtype: 'textfield',
		    	   fieldLabel:'Bill Name',
		    	   inputType: 'text',
		    	   name: 'name',
		       },
		       { 
		    	   xtype: 'numberfield',
		    	   fieldLabel:'Bill Amount in $',
		    	   inputType: 'text',
		    	   allowDecimals:true,
		    	   //regex://g
		    	   name: 'amount'
		       },
		       { 
		    	   xtype: 'datefield',
		    	   fieldLabel:'Date of Bill',
		    	   showToday:true,
		    	   inputType: 'text',
		    	   //regex://g
		    	   name: 'amount'
		       }],


		       buttons: [{
		    	   text: 'Save'
		       },{
		    	   text: 'Cancel'
		       }]

	});

	newBillPanel.render(Ext.get('center1'));
}
