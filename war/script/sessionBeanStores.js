/**
 *   
 */    
Voltan.billManager.groupListStoresBuilderFn = function(groupList){    	

	return{
		getNewGroupMembersStore:function(){
			var groupMembersDataStore = new Ext.data.Store({
				url: '/groupMembersList',
				root:'data',
				fields: 	[
				        	 {name: 'id'},
				        	 {name: 'name', mapping:'user.name'},
				        	 {name: 'relationshipStatus'}, 
				        	 ],
				        	 writer: {}
			});    		    		
			return groupMembersDataStore;    		
		},
		getNewUserGroupStore:function(){
			var groupDataStore = new Ext.data.JsonStore({
				url: '/userGroups',   			        
				root: 'data',
				fields: [
				         {name: 'id'},
				         {name: 'description'},
				         {name: 'name'}  ,
				         {name:'relationshipStatus'}
				         //{name:'houseId',mapping:'houseId'}               
				         ]
			});
			return groupDataStore;
		}

	}

};