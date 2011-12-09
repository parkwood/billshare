/**
*   
*/    
Voltan.billManager.groupListStoresBuilderFn = function(groupList){    	
   	
    
    var groupMembersProxy = new Ext.ux.data.SeamRemotingProxy({
        remoteMethod: '/groupMembersList'
    });
    
    var groupProxy = new Ext.ux.data.SeamRemotingProxy({
        remoteMethod: '/userGroups'
    });

    var groupMembersReader = new Ext.ux.data.SeamRemotingJsonReader({id: 'id', root:'data'}, 
	[
		{name: 'id'},
        {name: 'name', mapping:'user.name'},
		{name: 'relationshipStatus'}, 
	] );

    var groupReader = new Ext.ux.data.SeamRemotingJsonReader({id: 'id', root:'data'}, 
    [
    	{name: 'id',mapping:'id'},
        {name: 'description', mapping:'houseDescription'},
        {name: 'name', mapping:'house.name'}  ,
        {name:'relationshipStatus'},
		{name:'houseId',mapping:'houseId'}               
    ]);
        
    	
    	return{
    		getNewGroupMembersStore:function(){
			    var groupMembersDataStore = new Ext.data.Store({
			        proxy: groupMembersProxy,
			        reader: groupMembersReader,
			        writer: {}
			    });    		    		
			    return groupMembersDataStore;    		
    		},
    		getNewUserGroupStore:function(){
    		    var groupDataStore = new Ext.data.Store({
			        proxy: groupProxy,
			        reader: groupReader
    			});
    			return groupDataStore;
    		}
    	
    	}
    
    };