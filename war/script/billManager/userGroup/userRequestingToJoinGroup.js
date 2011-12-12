Ext.namespace('billManager.userGroup.userRequestingToJoinGroup');

billManager.userGroup.userRequestingToJoinGroup.fn = function(cfg){

	var requestToJoinGroup = function(grid,groupMembersGrid){

		var userRequestingToJoinGroupProxy = new Ext.ux.data.SeamRemotingProxy({
			remoteMethod: cfg.sessionProxy.groupList.userRequestingToJoinGroup, 
			seamComponent: cfg.sessionProxy.groupList
		});

		var inviteUserPanel = new Ext.ux.form.SeamFormPanel({ 
			seamComponent: null,
			remoteMethod: null, 	
			id: 'new-account-form',
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
			    	   fieldLabel:Voltan.i18ln.labels.typeNameOfGroup,
			    	   inputType: 'text',
			    	   name: 'groupName',
			       }]
		});


		var win = win ||  new Ext.Window({
			closable:true,
			closeAction :'close',
			collapsible:false,
			modal:true,
			//x:e.getXY()[0],
			//y:e.getXY()[1],
			items:inviteUserPanel,
			buttons: [{
				text: 'Request Membership',
				handler: function(){
					inviteUserPanel.form.submit({
						proxy:userRequestingToJoinGroupProxy,
						success: function(form, action){
							//display success message and reload
							Ext.Msg.alert('Status', Voltan.i18ln.labels.requestMadeSuccessfully);							
							grid.getStore().reload();
							win.close();
						},
						failure: function(form, action){
							Ext.Msg.alert('Status', action.message);								
							win.close();
						}
					})
				}

			},
			{
				text: 'Cancel',
				handler:function(){ win.close();}
			}
			]


		});

		win.show();

	};

	return {'requestToJoinGroup':requestToJoinGroup}
};