Voltan.billManager.userDetailsFn = function(cfg){

	var usernameField = { 
			xtype: 'textfield',
			fieldLabel:Voltan.i18ln.labels.userName,
			inputType: 'text',
			name: 'username'
	};
	var nameField = { 
			xtype: 'textfield',
			fieldLabel:Voltan.i18ln.labels.name,
			inputType: 'text',
			name: 'name'
	};
	var idField = { 
			xtype: 'hidden',      
			name: 'id'
	};
	var passwordField = 	{ 
			xtype: 'textfield',
			fieldLabel:Voltan.i18ln.labels.password,
			inputType: 'password',
			allowDecimals:false,
			name: 'password'
	};

	var emailField = { 
			xtype: 'textfield',
			fieldLabel:Voltan.i18ln.labels.email,
			inputType: 'text',
			allowDecimals:false,
			//regex://g
			name: 'email'
				//value:'bama@companyname.local'
	};

	var panelDefaults = {
			seamComponent: cfg.sessionProxy.userDetailsManager,		
			reader: {},
			writer: {},		
			domainType: 'org.domain.testSeam21a.entity.Users',
			useWriter: true,
			baseCls: 'x-plain',
			labelWidth: 120,
			defaults: {
				width: 200,
				validationEvent: false,
				allowBlank: false
			},
			frame: false,
			height: 200
	};


	var userDetailsForm = new Ext.form.FormPanel(
			Ext.applyIf({     
				remoteMethod: cfg.sessionProxy.userDetailsManager.saveUserDetails,
				loadMethod: cfg.sessionProxy.userDetailsManager.loadUserDetails,
				id:'userDetailsForm',	 	 
				items:[	
				       passwordField,
				       usernameField,
				       nameField,
				       idField
				       ],
				       buttons: [{
				    	   text: 'Save',
				    	   handler: function(){
				    		   userDetailsForm.form.isValid() && userDetailsForm.form.submit(
				    				   {
				    					   success: function(form, action){								
				    						   var user = action;
				    						   Ext.Msg.alert('Info',Voltan.i18ln.labels.saveSuccess);

				    					   },
				    					   failure: function(form, action){
				    						   var user = action;
				    						   Ext.Msg.alert('Error',Voltan.i18ln.labels.failedSaveStub+user.message);
				    					   }

				    				   });
				    	   }
				       }],
			},panelDefaults));


	var userDetailsPanel = new Ext.Panel({
		title:Voltan.i18ln.labels.myDetails,
		items:[
		       userDetailsForm
		       ]
	});

	userDetailsPanel.on('render',function(){
		userDetailsForm.load();
	});
	return{
		getUserDetailsPanel:function(){
			return userDetailsPanel;
		}
	};
};
