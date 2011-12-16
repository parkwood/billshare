Ext.namespace('billManager.util.grid');

billManager.util.grid.editorGridBuilder = function(){

	function saveGrid(grid){

		var ds = grid.getStore();
		var modified = ds.getModifiedRecords();
		var writer = ds.writer || {};
		var toSubmit = [];
		for (var i=0;i<modified.length;++i){
			var inst = {};
			var row = modified[i];
			for(var att in row.data){
				if(writer[att]){
					inst[att] = writer[att](row.data[att]);
				}
				else{
					inst[att] = row.data[att];
				}
			}
			//Ext.apply(inst,row.data);
			// defaults for new record - need to be set for unjsoning...
			if(row.data.id===''){
				inst.tempId = row.id;
				inst.id = -1;
				inst.entityStatus = 'ACTIVE';
			}
			toSubmit.push(inst);
		}

		//alert(modified.length);
		//create map of maps?
		var callBack = saveSuccessCallback.createDelegate(grid,[{}],true);
		//debugger;
		Ext.Ajax.request({
			url: grid.persistUrl || '/unknown',
			success: function(response){
				var jsonMessage = Ext.decode(response.responseText);
				callBack(jsonMessage);
			},
			failure: function(){alert("Error")}, 	   
			params: {toPersist: Ext.util.JSON.encode(toSubmit)}
		}); 
	}


	function saveSuccessCallback(wheresTheResponse){
		//debugger;
		var records = this.store.getModifiedRecords();

		// handle insert ids of new records
		var i;
		for(i = 0; i < records.length; i++) {
			var gridRow = records[i];
			if(wheresTheResponse[gridRow.id]) {
				var savedGroup = wheresTheResponse[gridRow.id];
				if(savedGroup.message==="failure"){
					console.debug('dj ohno');
					//		this.showError(action.result.error, this.saveFailedText);                
				}
				else{                        	
					//gridRow.set(this.store.pKey, savedGroup.id);
					gridRow.id = savedGroup.id;
					var dayta = {data:[savedGroup]}
					var rowContr = this.getStore().reader.readRecords(dayta);
					//var newData = new rowContr(savedGroup);
					this.store.remove(gridRow);
					this.store.add([rowContr.records[0]]);

					//Ext.apply(gridRow.data,savedGroup)    
				}                        
			}
		}
		this.store.commitChanges();
		//this.fireEvent('submitsuccess', this, records);


	} // end of success handler 

	function handleDelete(grid){
		debugger;
		if(!grid.selectedRow){
			//show message
			console.debug('nothing to delete');
		}
		var row = grid.selectedRow;
		row.set('entityStatus' , 'INACTIVE');
		var inst = Seam.Remoting.createType(grid.domainType);    	    
		Ext.apply(inst,row.data);     	
		//make sure modified
		var toSubmit = [inst];
		var callBack = saveSuccessCallback.createDelegate(grid,[{}],true);
		//debugger;
		var comp = grid.seamComponent;
		//var func = grid.submitMethod;
		comp[grid.submitMethod](toSubmit,callBack);

	}; 

	var refresh = function(grid){
		grid.store.reload();
	}

	function addBlankRecord(grid) {
		var store = grid.getStore();
		var orec, row;
		if(store.recordType) {
			orec = new store.recordType();
			orec.data = {};
			orec.fields.each(function(field) {
				orec.data[field.name] = field.defaultValue;
			});
			orec.data.newRecord = true;
			orec.commit();
			store.insert(0,orec);

			row = store.indexOf(orec);
			if(row && undefined !== this.editOnAddCol) {
				grid.startEditing(row, this.editOnAddCol);
			}
			else{
				grid.startEditing(row, 1);
			}

		}
	} 

	/**
	 * Handler for Adding a Record
	 */
	 function addRecord(grid,newRow,ds) {
		 var r = new userGroupRecordContructor(newRow);
		 grid.stopEditing();//stops any acitve editing
		 ds.insert(0, r); //1st arg is index,            
		 grid.startEditing(0, 1);
	 }; // end addRecord 



	 return{
		 buildGrid:function(config){

			 var mojito;

			 var defaultConfig = {
					 tbar: [
					        {
					        	text: Voltan.i18ln.labels.addRecord,					
					        	tooltip: Voltan.i18ln.labels.clickToAddRow,

					        	//We create our own css with a class called 'add'
					        	//.add is a custom class not included in
					        	// ext-all.css by default, so we need to define the
					        	// attributes of this style ourselves
					        	iconCls:'add', 
					        	handler: function(){ addBlankRecord(mojito);//addRecord(groupGrid,{id:22,name:'',description:''},groupGrid.getStore());
					        	} //what happens when user clicks on it
					        }, 
					        '-', //add a separator
					        {
					        	text:Voltan.i18ln.labels.saveChanges,					
					        	handler: function(){  saveGrid(mojito); }

					        },
					        /*{
                    text: 'Delete Selected',
					cls:'deleteSelected',
                    tooltip: 'Click to Delete selected row(s)',

                    //function to call when user clicks on button  
                    handler: function() {handleDelete(mojito);}, 
                    iconCls:'remove' 
                },*/ '->', // next fields will be aligned to the right 
                {
					        	text: 'Refresh',
					        	cls:'refresh',
					        	tooltip: 'Click to Refresh the table',
					        	handler: function(){refresh(mojito)},//refreshGrid,
					        	iconCls:'refresh'
                }
					        ]

			 };

			 if(config.tbar){
				 //add any buttons it does not have
				 config.tbar = config.tbar.concat(defaultConfig.tbar);
			 }
			 Ext.applyIf(config,defaultConfig);


			 mojito = new Ext.grid.EditorGridPanel(config);

			 //var configtbarlength = mojito.getTopToolbar().length;
			 //for(var i=0;i<configtbarlength;++i){
			 //	var item = mojito.getTopToolbar()[i];
			 //	if(item.handler){
			 //		item.handler = item.handler.createDelegate(mojito,[],true);
			 //	}
			 //}  
			 return mojito;
		 }
	 }

}();