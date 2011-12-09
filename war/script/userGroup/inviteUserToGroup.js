
Voltan.billManager.inviteUserToGroupDialogFn = function(cfg){
    
	var persistInvitationsProxy = new Ext.ux.data.SeamRemotingProxy({
        remoteMethod: cfg.sessionProxy.groupList.persistInvitations, 
        seamComponent: cfg.sessionProxy.groupList
    });
	
	var verifyActionProxy = new Ext.ux.data.SeamRemotingProxy({
        remoteMethod: cfg.sessionProxy.groupList.validateInviteUsers, 
        seamComponent: cfg.sessionProxy.groupList
    });
    
    var inviteUserToGroup = function(rowIndex,grid,groupMembersGrid){
		
var inviteUserPanel = new Ext.ux.form.SeamFormPanel({
	 autoScroll :true,
	useMap:true, 
    seamComponent: null,
	remoteMethod:null,     	
    id: 'inviteUserForm',
	title:Voltan.i18ln.labels.typeEmailOfInvitee,
    baseCls: 'x-plain',
    labelWidth: 120,
    defaults: {
        width: 200,
        validationEvent: false,
        allowBlank: false
    },
    frame: false,
    height: 130, 
    items:[
	
    	{ 
	        xtype: 'hidden',       		       
	        name: 'groupId',
			value: grid.getStore().getAt(rowIndex).json.house.id
    	},
	{ 
        xtype: 'textfield',
        fieldLabel:Voltan.i18ln.labels.email+' 1',
        inputType: 'text',
        name: 'userEmail1',
    }]
});
var userInviteCount = 2;

var addEmailButton = new Ext.Button({
	text:'add another user to the list of invites',
	 handler:function(){
	 	var newField = new Ext.form.Field({
			name: 'userEmail'+userInviteCount,
			fieldLabel:Voltan.i18ln.labels.email+' '+userInviteCount
		});
	 	inviteUserPanel.add(newField);
		inviteUserPanel.doLayout();
		userInviteCount++;
	 }
	
});

var submitButton = new Ext.Button(
{
					text:Voltan.i18ln.labels.sendInvites,
					disabled:true,
					handler: function(){
						inviteUserPanel.form.submit({
							proxy:persistInvitationsProxy,
							success: function(form, results){
								results = results.data;
								var keys = results.keySet();
								groupMembersGrid.getStore().reload();
								Ext.Msg.alert('Status', Voltan.i18ln.labels.invitesHaveBeenEmailed);
								win.close();
							},
							failure: function(form, results){
								var keys = results.keySet();
								Ext.Msg.alert('Status', Voltan.i18ln.labels.saveFailure);
							}
						}
						
						);
						
						
					}
				});

var validateButton = new Ext.Button(
{
					text: Voltan.i18ln.labels.validate,					
					handler: function(){											
						inviteUserPanel.form.submit({
							proxy:verifyActionProxy,
							/**
							 * we just tell user the outcome of the validation
							 * @param {Object} form
							 * @param {Object} results
							 */
							success: function(form, results){
								results = results.data;
								var keys = results.keySet();
								var atLeastOneSuccessful = false;
								for(var i=0; i<keys.length;++i){
									var fieldName = keys[i];
									var current = results.get(fieldName);
									var field  = form.form.findField(fieldName);
									field.removeClass('existingUserNotInGroup');
									field.removeClass('newUser');
									field.removeClass('existingUserInGroup');
									if(current.success){
										atLeastOneSuccessful  = true;
									} 
									if(current.success && current.message==='exists'){
										field.addClass('existingUserNotInGroup');
									}
									else if(current.success && current.message==='does not exist'){
										field.addClass('newUser');
									}
									else if(!current.success && current.message==='exists'){
										field.addClass('existingUserInGroup');
									}									
								}
								if (atLeastOneSuccessful) {
									//show info
									//
									validateButton.disable();
									submitButton.enable();
								}
								else{
									Ext.Msg.alert('Status', Voltan.i18ln.labels.noneOfYourSelectionsWereValid);
								}
							},
							failure: function(form, action){								
								Ext.Msg.alert('Error', Voltan.i18ln.labels.problemValidatingUsers);
								win.close();
							}
							
						});
					}
					
				});
		
 			var win = win ||  new Ext.Window({
				id:'inviteUserToGroupWindow',
                closable:true,
                closeAction :'close',
				collapsible:false,
				modal:true,
				//x:e.getXY()[0],
				//y:e.getXY()[1],
				items:[
					addEmailButton,
					inviteUserPanel
					  ],
				buttons: [
					validateButton,
					submitButton,
				{
            	text: 'Cancel',
				handler:function(){ win.close();}
		        }
				]
					
				
				});
				
				win.show();
			
		}
		
		
		return {'inviteUserToGroup':inviteUserToGroup}		
	};