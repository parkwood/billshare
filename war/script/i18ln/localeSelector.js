Voltan.i18ln.localeSelectorFunction = function(currentLocale){

	var panel  = new Ext.Panel({
		id:'localeSelectorPanel',
		items:[
		       new Ext.form.ComboBox({
		    	   store:new Ext.data.SimpleStore({
		    		   data:[['en','English'],['fr','French']],
		    		   fields:['locale','countryName']
		    	   }),
		    	   mode:'local',
		    	   triggerAction: 'all',
		    	   displayField: 'countryName',
		    	   valueField:'locale',
		    	   value:currentLocale,
		    	   listeners:{
		    		   select:{fn:function(combo,record,index){
		    			   var form = Ext.select('#languageSelectorForm').elements[0];
		    			   var menu = Ext.select('#languageSelectorForm select').elements[0];
		    			   menu.value = record.data.locale;
		    			   form.submit();
		    		   }}
		    	   }
		       })

		       ]
	});

	return panel;
}


