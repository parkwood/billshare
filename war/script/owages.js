
Voltan.billManager.owagesManagerFn = function(cfg){
	
	var owedProxy = new Ext.ux.data.SeamRemotingProxy({
        remoteMethod: cfg.sessionProxy.taskManager.getOwed, 
        seamComponent: cfg.sessionProxy.taskManager
    });
	
	var owingProxy = new Ext.ux.data.SeamRemotingProxy({
        remoteMethod: cfg.sessionProxy.taskManager.getOwing, 
        seamComponent: cfg.sessionProxy.taskManager
    });
	
	var paymentHistoryProxy = new Ext.ux.data.SeamRemotingProxy({
        remoteMethod: cfg.sessionProxy.taskManager.getPaymentHistory, 
        seamComponent: cfg.sessionProxy.taskManager
    });
	
	var paymentHistoryRecordContructor = Ext.data.Record.create([	
		{name: 'payableType', mapping: 'payableType'},
    	{name: 'initiator', mapping: 'initiator.name'},
        {name: 'recipient', mapping: 'recipient.name'},
        {name:'paymentSize',mapping: 'paymentSize',convert:Ext.util.Format.centRead},
		{name:'entryDate',mapping: 'entryDate'},
		{name:'preBalance',mapping: 'preBalance',convert:Ext.util.Format.centRead},
		{name:'postBalance',mapping: 'postBalance',convert:Ext.util.Format.centRead},         
         ]);
		 
	var paymentHistoryReader = new Ext.ux.data.SeamRemotingJsonReader(
    	{id: 'entryDate', root:'data'}, paymentHistoryRecordContructor );
		 
	var paymentHistoryStore = new Ext.data.Store({
        proxy: paymentHistoryProxy,
        reader: paymentHistoryReader
    });
    
    var recordContructor = Ext.data.Record.create([
    	{name: 'id', mapping: 'user.id'},
        {name: 'name', mapping: 'user.name'},
        {name:'quantity',mapping: 'quantity.quantity',convert:Ext.util.Format.centRead },
		{name:'counterparty',mapping: 'user.id'}       
         ]);
        
    var reader = new Ext.ux.data.SeamRemotingJsonReader(
    {id: 'id', root:'data'}, recordContructor );
	
	var owedDataStore = new Ext.data.Store({
        proxy: owedProxy,
        reader: reader
    });
	//western 670014
	//670200 ollabrook
	
	var owingDataStore = new Ext.data.Store({
        proxy: owingProxy,
        reader: reader
    });
	
	owedDataStore.load();
	owingDataStore.load();
	//owedDataStorefilter('amount','-',false,true);
	
	    var owingGrid = new Ext.grid.GridPanel({
        store: owingDataStore,
		id:'owingGrid',
        columns: [
            {id:'ident',header: Voltan.i18ln.labels.id, width: 60, sortable: true, dataIndex: 'id'},
            {header: Voltan.i18ln.labels.name, width: 80, sortable: true, dataIndex: 'name'},
            {header: Voltan.i18ln.labels.quantity, width: 120, sortable: true, dataIndex: 'quantity',renderer:Ext.util.Format.usMoney} ,
			{header: Voltan.i18ln.labels.owingTo, width: 0, sortable: true, dataIndex: 'counterparty', hidden:true}            
        ],
		sm: new Ext.grid.RowSelectionModel({singleSelect: true}),
        stripeRows: true,
        
        height:200,
        width:850,
        title:Voltan.i18ln.labels.owingTab,
        viewConfig: {
				forceFit: true
			}
    }); 
	
	    owingGrid.getSelectionModel().on('rowselect', function(sm, rowIdx, r) {		 		 
		 owingGrid.selectedRow = r;		 
		});
		owingGrid.on('rowcontextmenu',function(grid,rowIndex,e ){
			e.stopEvent();
			if (!owingGrid.contextMenu) {
				owingGrid.contextMenu = new Ext.menu.Menu({
				
					items: [{
						text: Voltan.i18ln.labels.makePayment,
						handler: function(){
							//create form
							var recipient = grid.getStore().getAt(rowIndex).data.id;
							createActualPayment(recipient);							
							owingGrid.contextMenu.hide();
						//close this
						}
					},
					{
						text: Voltan.i18ln.labels.viewPaymentHistory,
						handler: function(){
							//create form
							viewPaymentHistory(rowIndex,owingGrid);							
							owingGrid.contextMenu.hide();
						//close this
						}
					},]
				
				});
			}
			owingGrid.contextMenu.showAt(e.getXY());

			
		});
		
		
		
var viewPaymentHistory = function(rowIndex, grid){
	
	paymentHistoryStore.load({params:{userId:grid.getStore().getAt(rowIndex).data.id}});
	var panel = new Ext.grid.GridPanel({
			store:paymentHistoryStore,
			title:'owages history with this other user',
		    columns: [		        
		        {header: Voltan.i18ln.labels.transactionType, width: 120, sortable: false, dataIndex: 'payableType'},
				{header: Voltan.i18ln.labels.initiator, width: 120, sortable: false, dataIndex: 'initiator'},
		        {header: Voltan.i18ln.labels.recipient, width: 120, sortable: false, dataIndex: 'recipient'},
		        {header: Voltan.i18ln.labels.amountOfMoney, width: 120, sortable: false, dataIndex: 'paymentSize',renderer:Ext.util.Format.usMoney},
				{header: Voltan.i18ln.labels.amountOwedBefore, width: 120, sortable: false, dataIndex: 'preBalance',renderer:Ext.util.Format.usMoney},
				{header: Voltan.i18ln.labels.amountOwedAfter, width: 120, sortable: false, dataIndex: 'postBalance',renderer:Ext.util.Format.usMoney},				
		        {header: Voltan.i18ln.labels.date, width: 135, sortable: false,  dataIndex: 'entryDate'}],				             
        height:200,
        width:850,
		sm: new Ext.grid.RowSelectionModel({singleSelect: true}),
        stripeRows: true,
        viewConfig: {
				forceFit: true
			}
	});
	
	 			var win = win ||  new Ext.Window({
				id:'paymentHistotyWindow',	
                closable:true,
                closeAction :'close',
				collapsible:false,
				modal:true,
				items:panel	
				});
				
				win.show();
	
}	 
		
var createActualPayment = function( recipient, initialAmount){
		
	var panel = new Ext.ux.form.SeamFormPanel({ 
	    seamComponent: cfg.sessionProxy.taskManager,
	    remoteMethod: cfg.sessionProxy.taskManager.createActualPayment, 
		reader:{},
		writer:{
				recipient: function(val){ var x = new Seam.Remoting.createType('org.domain.testSeam21a.entity.Users'); x.id = val; return x; },
				paymentSize:Ext.util.Format.centWrite
			},
		domainType:'org.domain.testSeam21a.entity.ActualPayment',
		useWriter:true,
	    id: 'makePaymentForm',
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
	        fieldLabel:Voltan.i18ln.labels.paymentName,
	        inputType: 'text',
	        name: 'name',
	    },
			{ 
	        xtype: 'numberfield',
	        fieldLabel:Voltan.i18ln.labels.paymentAmount,
	        inputType: 'text',
			allowDecimals:true,
			emptyText:initialAmount,
	        name: 'paymentSize'
	    },
		{ 
	        xtype: 'hidden',       		       
	        name: 'recipient',
			value: recipient
	    }]
});

		
 			var win = win ||  new Ext.Window({
				id:'makePaymentWindow',
                closable:true,
                closeAction :'close',
				collapsible:false,
				modal:true,
				items:panel,
				buttons: [{
	            text: Voltan.i18ln.labels.makePayment,
				handler:function(){ 
				 panel.form.submit({
				 	success: function(form, results){
						reload();		
					},
					failure: function(form, results){				
						Ext.Msg.alert('Status',Voltan.i18ln.labels.saveFailure);
					}
					
				 });				 
				 win.close();}
    		    },{
            	text: Voltan.i18ln.labels.cancel,
				handler:function(){ win.close();}
		        }]
					
				
				});
				
				win.show();
			
		}
		
var owedGrid = new Ext.grid.GridPanel({
        store: owedDataStore,
		id:'owedGrid',
        columns: [
            {id:'ident',header: Voltan.i18ln.labels.id, width: 60, sortable: true, dataIndex: 'id'},
            {header: Voltan.i18ln.labels.name, width: 80, sortable: true, dataIndex: 'name'},
            {header: Voltan.i18ln.labels.quantity, width: 120, sortable: true, dataIndex: 'quantity',renderer:Ext.util.Format.usMoney}           
        ],
		sm: new Ext.grid.RowSelectionModel({singleSelect: true}),
        stripeRows: true,
        
        height:200,
        width:850,
        title:Voltan.i18ln.labels.owedTab,
        viewConfig: {
				forceFit: true
			}
    }); 
	
	    owedGrid.getSelectionModel().on('rowselect', function(sm, rowIdx, r) {		 		 
		 owedGrid.selectedRow = r;
		});
		
	var reload = function(){
		owedDataStore.reload();
		owingDataStore.reload();
	}
	
	var getAmountOwing = function(otherUserId){		
		var matchedId = owingDataStore.find('id',otherUserId);
		var amountOwing = 0;
		if(matchedId>=0){
			amountOwing = owingDataStore.getAt(matchedId).data.quantity;
		}
		return amountOwing;
	}
	
			
			owingGrid.on({
				'mouseover' : {
		  	 	fn: cfg.helpManager.show,
				scope: Voltan.i18ln.labels.help.owages
				}
			} );
			
			owedGrid.on({
				'mouseover' : {
		  	 	fn: cfg.helpManager.show,
				scope: Voltan.i18ln.labels.help.owages
				}
			} );			
 
return{
	getOwingGrid:function(){
		return owingGrid;
	},
	getOwedGrid:function(){
		return owedGrid;
	},
	reload:reload,
	createActualPayment:createActualPayment,
	getAmountOwing:getAmountOwing		
	
}
	
}
