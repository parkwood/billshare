Voltan.billManager.userMainOnReady = function(language){
	
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
    var helpManager = Voltan.billManager.helpManagerFn();
    var userRequestingToJoinGroupDialog = Voltan.billManager.userRequestingToJoinGroupFn({sessionProxy:sessionProxy});
    var inviteUserToGroupDialog = Voltan.billManager.inviteUserToGroupDialogFn({sessionProxy:sessionProxy});
    var groupListStoresBuilder = Voltan.billManager.groupListStoresBuilderFn(sessionProxy.groupList);
    var userGroupManager = Voltan.billManager.userGroupManagerFn({sessionProxy:sessionProxy,storesBuilder:groupListStoresBuilder,inviteUserToGroupDialog:inviteUserToGroupDialog,userRequestingToJoinGroupDialog:userRequestingToJoinGroupDialog,helpManager:helpManager});   	   	
    var owagesManager = Voltan.billManager.owagesManagerFn({sessionProxy: sessionProxy,helpManager:helpManager	});
	var accountsManager = Voltan.billManager.accountsFn({sessionProxy:sessionProxy,
										groupListStoresBuilder:groupListStoresBuilder,
										owagesManager:owagesManager,
										helpManager:helpManager});
	var userTasksManager = Voltan.billManager.userTasksFn({sessionProxy:sessionProxy,owagesManager:owagesManager,helpManager:helpManager});
    var userDetailsMananger = Voltan.billManager.userDetailsFn({sessionProxy: sessionProxy,helpManager:helpManager	});	
		  
    Voltan.billManager.createNewView({
		userGroupManager:userGroupManager,
		accountsManager:accountsManager,
		owagesManager:owagesManager,
		userTasksManager:userTasksManager,
		helpManager:helpManager,
		userDetailsMananger:userDetailsMananger
		},language);

	
}

Ext.onReady(function(){
	Voltan.billManager.userMainOnReady('en');
	});

