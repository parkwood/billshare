
Voltan.billManager.userAccountManagerFn = function(cfg){
	
	var forgotPasswordPanel;
	var createAccountPanel;
	var loginPanel;
	
	var tabs = {'forgotPasswordWindow':0,'createAccountWindow':1,'loginWindow':2};

	
	var switchTo = function(panel){		
		win.getLayout().setActiveItem(tabs[panel]);
	}
	
	var usernameField = { 
        xtype: 'textfield',
        fieldLabel:Voltan.i18ln.labels.userName,
        inputType: 'text',
        name: 'username',
		value:'bama'
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
        name: 'email',
		value:'bama@companyname.local'
    };
	
	var panelDefaults = {
		seamComponent: cfg.sessionProxy.userAccountManager,		
		reader: {},
		writer: {},
		domainType: 'org.domain.testSeam21a.entity.Users',
		useWriter: true,
		baseCls: 'x-plain',
		labelWidth: 80,
		defaults: {
			width: 200,
			validationEvent: false,
			allowBlank: false
		},
		frame: false,
		height: 70
	};
	
	forgotPasswordPanel = new Ext.ux.form.SeamFormPanel(
	Ext.applyIf({     
    remoteMethod: cfg.sessionProxy.userAccountManager.forgotPassword,
	id:'forgotPasswordPanel', 	 
    items:[
	emailField
	],
	buttons: [{
					text:Voltan.i18ln.labels.getPasswordSentToYou,
					input:'getPasswordSentToYou',
					handler: function(){
						forgotPasswordPanel.form.submit({
							success:function(form,action){
								var user = action;
								Ext.Msg.alert('Status',Voltan.i18ln.labels.passwordEmailed);
								switchTo('loginWindow');
								//debugger;
							},
							failure:function(form, action){
									var user = action;
								Ext.Msg.alert('Error',Voltan.i18ln.labels.unableToSendEmailStub+user.message);
							}
							
						});
					}				
				},
				{
					text:'Login',
					cls:'login',
					handler: function(){
					 switchTo('loginWindow');
					}
				}],
},panelDefaults));

	//create login panel
	loginPanel = new Ext.ux.form.SeamFormPanel(
	Ext.applyIf({     
    remoteMethod: cfg.sessionProxy.userAccountManager.login,
	id:'loginPanel',	 	 
    items:[
	emailField,
	passwordField
	],
	buttons: [{
	            text: 'Login',
				cls:'login',
				handler: function(){
					loginPanel.form.submit(
					{
						success: function(form, action){								
								var user = action;
									window.location = 'userMain.seam';
							},
						failure: function(form, action){
								var user = action;
								Ext.Msg.alert('Error',Voltan.i18ln.labels.unableToLogInStub+user.message);
							}
						
					});
				}
    		    },
				{
					text:'register',
					cls:'register',
					handler: function(){
					switchTo('createAccountWindow');
					}
				},
				{
					text:'forgottenPassword',
					cls:'forgottenPassword',
					handler: function(){
					 switchTo('forgotPasswordWindow');
					}
				}],
},panelDefaults));
	 
	
		//create panel
	createAccountPanel = new Ext.ux.form.SeamFormPanel(
	Ext.applyIf({     
    remoteMethod: cfg.sessionProxy.userAccountManager.createAccount,
	id:'createAccountPanel', 	 
    items:[
	Ext.apply(usernameField,{value:'a'}),
	passwordField,
	emailField
	],
	buttons: [{
					text:Voltan.i18ln.labels.createUserAccount,
					input:'createAccount',
					handler: function(){
						createAccountPanel.form.submit({
							success: function(form, action){
								var user = action;
								//debugger;
								Ext.Msg.alert('Status', Voltan.i18ln.labels.welcomeStub+user.username+', you have been sent an email containing a link. please follow the link to complete registration');								
								switchTo('loginWindow');
							},
							failure: function(form, action){
								var user = action;
								Ext.Msg.alert('Error',Voltan.i18ln.labels.unableToCreateAccountStub+user.message);
							}
						});
					}				
				},
				{
					text:Voltan.i18ln.labels.login,
					input:'login',
					handler: function(){
					 switchTo('loginWindow');
					}
				}],
},panelDefaults));
	


    var win = new Ext.Panel({       
    			region:'east',         
                layout      : 'card',
                width       : 300,
				cls:'logoBack',
				activeItem:2,
                height      : 300,	
			    defaults: {        
        			border:false
    			},				
				items:[forgotPasswordPanel,createAccountPanel,loginPanel]
		});

	return {
		getWindow: function(){

			return win;
		}
		
	}
}
