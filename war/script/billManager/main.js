Ext.namespace('billManager.main');
billManager.main.fn = function(language){

	Ext.QuickTips.init();
	Ext.state.Manager.setProvider(new Ext.state.CookieProvider({
		expires: new Date(new Date().getTime()+(1000*60*60*24*300000))
	}));
	//component.restoreState()  - cant find that method

	var sessionProxy = {
			groupList : {groupList: '/groupList'},//Seam.Component.getInstance('groupList'),
			accountManager : {getUserAccounts: '/getUserAccounts', persistAccounts:'/persistAccounts'},//Seam.Component.getInstance('accountManager'),
			taskManager : {},//Seam.Component.getInstance('taskManager'),
			userDetailsManager:{} //Seam.Component.getInstance('userDetailsManager')
	};
	var helpManager = billManager.helpManager.fn();
	var userRequestingToJoinGroupDialog = billManager.userGroup.userRequestingToJoinGroup.fn({sessionProxy:sessionProxy});
	var inviteUserToGroupDialog = billManager.userGroup.inviteUserToGroup.dialogFn({sessionProxy:sessionProxy});
	var groupListStoresBuilder = billManager.groupListStores.builderFn(sessionProxy.groupList);
	var userGroupManager = billManager.userGroupManager.fn({sessionProxy:sessionProxy,storesBuilder:groupListStoresBuilder,inviteUserToGroupDialog:inviteUserToGroupDialog,userRequestingToJoinGroupDialog:userRequestingToJoinGroupDialog,helpManager:helpManager});   	   	
	var owagesManager = billManager.owages.fn({sessionProxy: sessionProxy,helpManager:helpManager	});
	var accountsManager = billManager.accountsGrid.accountsFn({sessionProxy:sessionProxy,
		groupListStoresBuilder:groupListStoresBuilder,
		owagesManager:owagesManager,
		helpManager:helpManager});
	var userTasksManager = billManager.userTasks.fn({sessionProxy:sessionProxy,owagesManager:owagesManager,helpManager:helpManager});
	var userDetailsMananger = billManager.userAccount.userDetails.fn({sessionProxy: sessionProxy,helpManager:helpManager	});	

	billManager.layout.fn({
		userGroupManager:userGroupManager,
		accountsManager:accountsManager,
		owagesManager:owagesManager,
		userTasksManager:userTasksManager,
		helpManager:helpManager,
		userDetailsMananger:userDetailsMananger
	},language);


}

Ext.onReady(function(){
	billManager.main.fn('en');
});

