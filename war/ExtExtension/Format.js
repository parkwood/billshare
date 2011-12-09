/**
 * specifically to use when money amounts are held in long integer as pence/cebts/kopecs etc 
 */
//Ext.ux.form.SeamFormPanel = Ext.extend(Ext.form.FormPanel, {});

Ext.util.Format.centMoney = function(v){
	v = v/ 100;
	v = (v == Math.floor(v)) ? v + ".00" : ((v * 10 == Math.floor(v * 10)) ? v + "0" : v);
	v = String(v);
	var ps = v.split('.');
	var whole = ps[0];
	var sub = ps[1] ? '.' + ps[1] : '.00';
	var r = /(\d+)(\d{3})/;
	while (r.test(whole)) {
		whole = whole.replace(r, '$1' + ',' + '$2');
	}
	v = whole + sub;
	if (v.charAt(0) == '-') {
		return '-$' + v.substr(1);
	}
	return "$" + v;
}

Ext.util.Format.centWrite = function(v){
	return v*100;
}

Ext.util.Format.centRead = function(v){
	return v/100;
}