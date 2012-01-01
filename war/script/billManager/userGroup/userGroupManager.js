
Ext.namespace('billManager.userGroupManager');

billManager.userGroupManager.fn = function(cfg){

	var groupMembersGrid;
	var groupGrid;

	var getGroupGrid = function(){

		var groupColModel = new Ext.grid.ColumnModel([{
			id: 'ident',
			header: Voltan.i18ln.labels.id,
			width: 60,
			sortable: true,
			dataIndex: 'id'
		}, {
			header: Voltan.i18ln.labels.name,
			width: 80,
			sortable: true,
			dataIndex: 'name',
			editor: new Ext.form.TextField({
				//specify options
				allowBlank: false //default is true (nothing entered)
			})
		}, {
			header: Voltan.i18ln.labels.description,
			width: 320,
			sortable: true,
			dataIndex: 'description',
			editor: new Ext.form.TextField({
				//specify options
				allowBlank: false //default is true (nothing entered)
			})
		}, {
			header: Voltan.i18ln.labels.groupStatus,
			width: 80,
			sortable: true,
			dataIndex: 'relationshipStatus'
		}]);



		var groupDataStore = cfg.storesBuilder.getNewUserGroupStore();

		groupDataStore.on('load', function(groupDataStore){
			//temp remove until filter sorted
			//groupDataStore.filter('relationshipStatus','ACTIVE');
		});

		groupDataStore.load();

		var groupFilters = new Ext.grid.GridFilters({
			filters: [{
				type: 'list',
				dataIndex: 'relationshipStatus',
				options: ['ACTIVE', 'INACTIVE', 'AWAITING_USER', 'AWAITING_HOUSE']//,
			//active:true
			}],
			local: true
		});

		groupGrid = billManager.util.grid.editorGridBuilder.buildGrid({
			id: 'groupGrid',
			persistUrl:'/persistGroups',		
			store: groupDataStore,
			//plugins:groupFilters,
			colModel: groupColModel,
			editOnAddCol: 'name',
			loadMask: true,
			sm: new Ext.grid.RowSelectionModel({
				singleSelect: true
			}),
			stripeRows: true,
			clicksToEdit: 2,
			editOnAddCol: true,
			height: 200,
			width: 450,
			title: Voltan.i18ln.labels.myGroups,
			viewConfig: {
				forceFit: true
			},
			tbar: [{
				text: Voltan.i18ln.labels.requestToJoin,
				tooltip: Voltan.i18ln.labels.requestToJoinToolTip,
				handler: function(){
					cfg.userRequestingToJoinGroupDialog.requestToJoinGroup(groupGrid);
				}
			}]
		});

		groupGrid.on('beforeedit', function(container){
			if (container.record.json && container.record.json.relationshipStatus !== 'ACTIVE') {
				container.cancel = true;
			}
		});

		var groupMembersDataStore = cfg.storesBuilder.getNewGroupMembersStore();
		groupMembersDataStore.on('load', function(store){
			store.filter('relationshipStatus', 'ACTIVE');
		});

		groupGrid.getSelectionModel().on('rowselect', function(sm, rowIdx, r){
			var groupId = r.json && r.json.id ;
			groupMembersDataStore.load({
				params: {
					groupId: groupId
				}
			});
			groupGrid.selectedRow = r;
		});

		groupGrid.on('rowcontextmenu', function(grid, rowIndex, e){
			e.stopEvent();
			if (grid.contextMenu) {
				grid.contextMenu.destroy();
			}

			var userRelation = grid.getStore().getAt(rowIndex).data;
			var items = [];
			switch (userRelation.relationshipStatus) {
			case 'ACTIVE':
				items.push({
					text: Voltan.i18ln.labels.inviteOthers,
					handler: function(){
						//create form
						cfg.inviteUserToGroupDialog.inviteUserToGroup(rowIndex, grid, groupMembersGrid);						
						grid.contextMenu.hide();
						//close this
					}
				});
				break;
			case 'AWAITING_USER':
				items.push({
					text: Voltan.i18ln.labels.activateRelationship,
					handler: function(){
						userRelation.relationshipStatus = 'ACTIVE';
						saveUserHouseRelationshipAndUpdateGrid(userRelation, grid);
						grid.contextMenu.hide();
					}
				});
				break;
			case 'AWAITING_HOUSE':
				items.push({
					text: Voltan.i18ln.labels.promptToActivate,
					handler: function(){
						//send email?
						grid.contextMenu.hide();
						//close this
					}
				});
				break;
			case 'INACTIVE':
				items.push({
					text: Voltan.i18ln.labels.noActionAvailable,
					handler: function(){
						//send email?
						grid.contextMenu.hide();
						//close this
					}
				});
				break;

			}

			grid.contextMenu = new Ext.menu.Menu({
				id: 'groupGridContextMenu',
				items: items

			});

			grid.contextMenu.showAt(e.getXY());


		});

		var groupMembersFilters = new Ext.grid.GridFilters({
			filters: [{
				type: 'list',
				dataIndex: 'relationshipStatus',
				options: ['ACTIVE', 'INACTIVE', 'AWAITING_USER', 'AWAITING_HOUSE']//,
			//active:true
			}],
			local: true
		});


		groupMembersGrid = new Ext.grid.GridPanel({
			id: 'groupMembersGrid',
			store: groupMembersDataStore,
			columns: [{
				id: 'ident',
				header: Voltan.i18ln.labels.id,
				width: 60,
				sortable: true,
				dataIndex: 'id'
			}, {
				header: Voltan.i18ln.labels.name,
				width: 60,
				sortable: true,
				dataIndex: 'name'
			}, {
				header: Voltan.i18ln.labels.status,
				width: 80,
				sortable: true,
				dataIndex: 'relationshipStatus'
			}],
			sm: new Ext.grid.RowSelectionModel({
				singleSelect: true
			}),
			stripeRows: true,
			plugins: groupMembersFilters,
			height: 200,
			width: 250,
			title: Voltan.i18ln.labels.groupMembers,
			viewConfig: {
				forceFit: true
			}
		});

		groupMembersGrid.on('rowcontextmenu', function(grid, rowIndex, e){
			e.stopEvent();
			if (grid.contextMenu) {
				grid.contextMenu.destroy();
			}
			var userRelation = grid.getStore().getAt(rowIndex).data;
			var action = null;
			var handler = null;
			switch (userRelation.relationshipStatus) {
			case 'INACTIVE':
				userRelation.relationshipStatus = 'ACTIVE';
				action = 'activate';
				break;
			case 'ACTIVE':
				userRelation.relationshipStatus = 'INACTIVE';
				action = 'deactivate';
				break;
			case 'AWAITING_HOUSE':
				userRelation.relationshipStatus = 'ACTIVE';
				action = 'activate';
				break;
			case 'AWAITING_USER':
				Ext.Msg.alert('status', Voltan.i18ln.labels.noActionAvailable);
				return;				break;
			}

			grid.contextMenu = new Ext.menu.Menu({
				id: 'groupMembersGridContextMenu',
				items: [{
					text: action + ' this user',
					handler: function(){
						//create form
						saveUserHouseRelationshipAndUpdateGrid(userRelation, grid);
						grid.contextMenu.hide();
						//close this
					}
				}]

			});

			grid.contextMenu.showAt(e.getXY());


		});

		var saveUserHouseRelationshipAndUpdateGrid = function(userRelation, grid){
			var uhr = Seam.Remoting.createType('org.domain.testSeam21a.entity.UserHouseRelation')
			Ext.apply(uhr, userRelation);
			//TODO a bit clueless here - want to update the row in the best way possible
			cfg.sessionProxy.groupList.saveUserHouseRelation([uhr], function(data){
				var messages = [];
				for (var i = 0; i < data.length; ++i) {
					var current = data[i];
					if (!current.success) {
						messages.push(current.message);
					}
					else {
						var row = grid.getStore().getById(current.id);
						row.set('relationshipStatus', current.relationshipStatus);
						row.commit();
					}
				}

				if (messages.length > 0) {
					Ext.Msg.alert( messages.join(' '));

				}
			});
		};





		groupGrid.on({
			'mouseover': {
				fn: cfg.helpManager.show,
				scope: Voltan.i18ln.labels.help.groupHelp
			}
		});

		groupMembersGrid.on({
			'mouseover': {
				fn: cfg.helpManager.show,
				scope: Voltan.i18ln.labels.help.groupMembersHelp
			}
		});



	}
	return{
		getGroupingDs:function(){
			return groupDataStore;
		},
		getGrid:function(type){
			if(type==='g'){
				getGroupGrid();
				return groupGrid;
			}
			else{
				return groupMembersGrid;
			}
		}

	};
};
