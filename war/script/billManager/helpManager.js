/**
 * 
 * @param {Object} messages - values are of form {message:''}
 */
Ext.namespace('billManager.helpManager');
billManager.helpManager.fn = function(messages){

	var helpPanel = new Ext.Panel({
		ctCls:'mahmoud',
		bodyStyle:'overflow:scroll'
	})
	var tableRowTemplate = new Ext.Template('<tr><td>{0}</td><td>{1}</td></tr>');
	var tableTemplate = new Ext.Template('<table>{0}</table>');//<th rowspan="2">Questions</th>
	var helpTemplate = new Ext.Template(Voltan.i18ln.labels.help+' => {strapLine}');


	return{
		show:function(){
			var container = Ext.getCmp('south');
			container.setTitle(helpTemplate.applyTemplate(this));
			var rows = [];
			for(var question in this.questions){
				rows.push(tableRowTemplate.applyTemplate([question,this.questions[question]]));				
			}
			var table = tableTemplate.applyTemplate([rows.join('')]);			
			helpPanel.body.update(table);

		},
		unshow:function(){},
		getHelpPanel:function(){
			return helpPanel;
		}};
}
