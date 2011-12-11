
Voltan.billManager.createNewView = function(viewManagers,language){


	var	userGroupManager = viewManagers.userGroupManager;
	var accountsManager = viewManagers.accountsManager;
	var	owagesManager = viewManagers.owagesManager;
	var	userTasksManager = viewManagers.userTasksManager;
	var helpManager  = viewManagers.helpManager;
	var userDetailsMananger = viewManagers.userDetailsMananger;	

	var mainTabPanel =   new Ext.TabPanel({
		region:'center',
		deferredRender:false,
		activeTab:0,
		items:[
		       {
		    	   title: Voltan.i18ln.labels.myTasks,
		    	   xtype:'panel',
		    	   layout:'fit',                     	                    	
		    	   //xtype:'tabpanel',
		    	   items:[
		    	          //taskList
		    	          userTasksManager.getTaskGrid()							

		    	          ]                  
		       },
		       userDetailsMananger.getUserDetailsPanel()
		       ]
	});

	var actionButtons = [
new Ext.Button({
	text:'manage groups',
	cls:'manageGroups',
	minWidth:200,
	handler: function(){  
		var x = userGroupManager.getGrid('g');
		var y =         userGroupManager.getGrid()
		x.region = 'north';
		y.region = 'center';
		var newComponent =     new Ext.Panel({
			title: 'Group Management',
			layout:'border'  ,    	
			items:[x,y                  		
			       ]                    
		});

		mainTabPanel.add(newComponent);
		mainTabPanel.setActiveTab(newComponent);
		this.disable();
	}
}),
new Ext.Button({
	text:'manage accounts',
	cls:'manageAccounts',
	minWidth:200,
	handler: function(){  
		var x = accountsManager.getGrid();
		x.region = 'center';
		var newComponent =     new Ext.Panel({
			title: Voltan.i18ln.labels.myAccounts,
			layout:'border'  ,                     	
			items:[x                  			
			       ]                    
		});

		mainTabPanel.add(newComponent);
		mainTabPanel.setActiveTab(newComponent);
		this.disable();				}
}),
new Ext.Button({
	text:Voltan.i18ln.labels.createNewBillPayment,
	cls:'newBillPayment',
	minWidth:200,
	handler: function(){
		accountsManager.createNewBill();
	}
})

];

	var viewport = new Ext.Viewport({
		layout:'border',			
		items:[
		       { // raw
		    	   region:'north',	
		    	   layout:'border',			                    
		    	   items:[
		    	          {
		    	        	  region:'center',
		    	        	  el:'banner'
		    	          },				
		    	          {
		    	        	  region:'east',
		    	        	  renderTo:'localeEl',
		    	        	  items:[
		    	        	         Voltan.i18ln.localeSelectorFunction(language)
		    	        	         ]

		    	          }	
		    	          ],
		    	          height:82
		       },{
		    	   region:'south',      
		    	   id:'south',              
		    	   split:true,
		    	   height: 110,
		    	   minSize: 100,
		    	   maxSize: 400,
		    	   collapsible: true,
		    	   collapsed:false,
		    	   title:'Help',
		    	   layout:'fit',
		    	   margins:'0 0 0 0',
		    	   items:helpManager.getHelpPanel()
		       }, {
		    	   region:'east',
		    	   title: 'Advertisement',
		    	   html:'',//'<span style="font-size:700%">YOUR<br/>AD<br/>HERE</span>',
		    	   collapsible: false,
		    	   split:true,
		    	   width: 225,					
		    	   minSize: 175,
		    	   maxSize: 400,
		    	   layout:'fit',
		    	   margins:'0 5 0 0',
		       },{
		    	   region:'west',
		    	   id:'west-panel',
		    	   title:'Admin',
		    	   split:true,
		    	   width: 200,
		    	   minSize: 175,
		    	   maxSize: 100,
		    	   collapsible: true,
		    	   margins:'0 0 0 5',
		    	   layout:'table',
		    	   layoutConfig:{
		    		   animate:true,
		    		   columns:1,
		    		   rows:2
		    	   },
		    	   items: [{
		    		   /*contentEl: 'west',*/
		    		   title:'Actions',
		    		   id:'actionButtons',
		    		   border:false,
		    		   iconCls:'nav',
		    		   items: actionButtons                    

		    	   },{
		    		   title:'Current Balances',
		    		   border:false,
		    		   split:true,
		    		   width: 225,
		    		   minSize: 175,
		    		   layout:'fit',
		    		   margins:'0 5 0 0',
		    		   items:  new Ext.TabPanel({
		    			   border:false,							
		    			   activeTab:0,
		    			   tabPosition:'bottom',
		    			   items:[
		    			          owagesManager.getOwingGrid(),
		    			          owagesManager.getOwedGrid()
		    			          ]
		    		   }),
		    		   border:false,
		    		   iconCls:'nav'
		    	   }]
		       },
		       mainTabPanel
		       ]
	});


}



