/**
 * @class Ext.form.ux.SeamFormPanel
 * @extends Ext.form.FormPanel
 * Seam form panel.  An extension of the Ext.form.FormPanel class for
 * form handling via Seam remoting.  The override here is for
 * the creation of the SeamBasicForm instead of the BasicForm.
 * the config passed to the constructor must specify the Seam
 * component, target method and the request component. (see SeamRemotingProxy)
 *
 * Form fields are passed as arguments to the remote method in the
 * order in which they were defined.  The seam specific config options are
 * seamComponent and remoteMethod.  Optionally the 'useMap' config
 * provides a more flexible solution for passing forms to Seam by mapping
 * the form fields to a Seam.Remoting.Map.  Remote methods that accept
 * maps can merge form state into a graph of objects using the beanutils
 * expression langauge for the the form field names.
 */
Ext.namespace('Ext.ux.form');
Ext.ux.form.SeamFormPanel = Ext.extend(Ext.form.FormPanel, {
    // private
    createForm: function(){
        delete this.initialConfig.listeners;
        return new Ext.ux.form.SeamBasicForm(null, this.initialConfig);
    }
});

Ext.reg('seamForm', Ext.ux.form.SeamFormPanel);


/**
 * @class Ext.ux.form.SeamBasicForm
 * @extends Ext.form.BasicForm
 * Supplies the functionality to do "actions" on forms and initialize 
 * Ext.form.Field types on existing markup.
 * By default, Ext Forms are submitted through Ajax, using {@link Ext.form.Action}.  However
 * this version will use the Seam Remoting abstraction to Ajax.
 * @constructor
 * @param {Mixed} el The form element or its id
 * @param {Object} config Configuration options
 */
Ext.ux.form.SeamBasicForm = function(el, config) {
    Ext.ux.form.SeamBasicForm.superclass.constructor.call(this, el, config);
};

Ext.extend(Ext.ux.form.SeamBasicForm, Ext.form.BasicForm, {
    /**
     * Shortcut to do a submit action.  This override calls the doAction with 'seamSubmit'.
     * @param {Object} options The options to pass to the action (see {@link #doAction} 
     * for details)
     * @return {BasicForm} this
     */
    submit: function(options){
        this.doAction('seamSubmit', options);
        return this;
    },

    /**
     * Shortcut to do a load action.  This override calls the doAction with 'seamLoad'.
     * @param {Object} options The options to pass to the action (see {@link #doAction} for 
     * details)
     * @return {BasicForm} this
     */
    load: function(options){
        this.doAction('seamLoad', options);
        return this;
    }
});


Ext.form.Action.SeamLoad = function(form, options){
    Ext.form.Action.SeamLoad.superclass.constructor.call(this, form, options);
};


Ext.extend(Ext.form.Action.SeamLoad, Ext.form.Action.Load, {
	run:function(){
        var o = this.options;
        
            var args = this.getParams() || [];
            args.push(this.processLoadResponse.createDelegate(this));
			//push it again as exception handling method
			args.push(this.processLoadResponse.createDelegate(this)); 

            var form = this.form;			
            if(o.proxy===undefined){
            	form.loadMethod.apply(form.seamComponent, args);
			}
			else{
				o.proxy.remoteMethod.apply(o.proxy.seamComponent,args);
			}		
	},
	processLoadResponse:function(response){
		  		//start assuming ok
  		var method = 'success';
		var arg = null;
		var incoherentResponse = {message:'Oh no! bad thing happen'};
		
        if (typeof response !== 'object') {
			try {
				response = Ext.decode(response);
			}
			catch(e){
				method = 'failure';
				arg = incoherentResponse;
			}
			if (typeof response !== 'object') {
				method = 'failure';
				arg = incoherentResponse;
				response = {};
			}
		}
			
		if(response.failure || !response.success){
			method = 'failure';			  
			if(!response.message || response.message.match(/Exception/g)){
				response.message = 'a system error occured';
			} 
		}
		
		this.form.clearInvalid();
        this.form.setValues(
			 response
		);
        this.form.afterAction(this, true);
		//this.form.apply
		            
		//return this.options[method] && this.options[method](this, response);
    	
	}
	
	});

/**
 * @class Ext.form.Action.SeamSubmit
 * @extends Ext.form.Action.Submit
 * A class which handles submission of data from {@link Ext.form.BasicForm Form}s
 * and processes the returned response.
 * Instances of this class are only created by a {@link Ext.form.BasicForm Form} when
 * submitting.
 * A response packet must contain a boolean success property, and, optionally
 * an errors property. The errors property contains error
 * messages for invalid fields.
 * By default, response packets are assumed to be JSON, so a typical response
 * packet may look like this:
 * {success: false, errors: {
 *      clientCode: "Client not found",
 *      portOfLoading: "This field must not be null"
 *  }}
 * Other data may be placed into the response for processing the the 
 * {@link Ext.form.BasicForm}'s callback
 * or event handler methods. The object decoded from this JSON is available in the 
 * {@link #result} property.
 */
Ext.form.Action.SeamSubmit = function(form, options){
    Ext.form.Action.SeamSubmit.superclass.constructor.call(this, form, options);
};

Ext.extend(Ext.form.Action.SeamSubmit, Ext.form.Action.Submit, {
    /**
     * Gets the value form form fields.  There are a copule of ways in which the
     * request can be constructed.  1. Using the order in which the fields were 
     * defined on the form this solution works well for forms with a few fields.  
     * 2.  Using a map for the request params.  This solution provides a means to 
     * merge in complete object graph.
     */
    getParams: function() {
        if( this.form.useMap === true ){
         return this.getMapParams()  ;
         }
        else if( this.form.useWriter === true ){
         return this.getWriterParams()  ;
         }		 
         else{
          return this.getFieldParams();
         }
    },
	/**
	* go through form and use associated writer to create objects
	*/
	getWriterParams:function(){
		if (this.form.domainType) {
			var inst = Seam.Remoting.createType(this.form.domainType);
		}
		else if(this.form.componentName){			
			var inst = Seam.Component.newInstance(this.form.componentName);
		}
		//Ext.apply(inst);
		var writer = this.form.writer;
        this.form.items.each(function(field){
			var convertFunc = writer[field.name];
			if(convertFunc){
				inst[field.name] = convertFunc(field.getValue());
			}
			else{
				inst[field.name] = field.getValue();	
			}
			
                      
        });
		return [inst];
	},

    /**
     * With this strategy the fields registers on the associated form are added
     * to the arg array in the order that they were defined at construction time.
     */ 
    getFieldParams: function() {
        var params = [];
        var values = this.form.items.items;
        for (var i=0; i<values.length;++i) {
            params.push(values[i].getValue());
        };        
        return params;      
    },
    
    /**
     * This strategy uses a map of name/value pairs using a Seam.Remoting.Map. 
     * With this approach forms can be created that represent an object graph 
     * of arbitrary depth.  The solution assumes that form  field names adhere 
     * to the org.apache.BeanUtil property expressions.
     */
    getMapParams: function() {      
        var map = new Seam.Remoting.Map(); 
        this.form.items.each(function(field){
            map.put(field.name, field.getValue());          
        });
        
        var params = [];
        params.push(map);
        return params;              
    },
    
    /** private method of action class - called by some other extjs method
     * 
     */ 
    run: function() {
        var o = this.options;
        if (!o.clientValidation || this.form.isValid()) {
            var args = this.getParams();
            args.push(this.processSubmitResponse.createDelegate(this));
			//push it again as exception handling method
			args.push(this.processSubmitResponse.createDelegate(this)); 

            var form = this.form;			if(o.proxy===undefined){
            	form.remoteMethod.apply(form.seamComponent, args);
			}
			else{
				o.proxy.remoteMethod.apply(o.proxy.seamComponent,args);
			}
            
        } else if (o.clientValidation !== false) { 
            // client validation failed
            this.failureType = Ext.form.Action.CLIENT_INVALID;
            this.form.afterAction(this, false);
        }
    },

    /**
     * This override performs a little protocol translation.  
     */
    processSubmitResponse: function(response){
  
  		//start assuming ok
  		var method = 'success';
		var arg = null;
		var incoherentResponse = {message:'Oh no! bad thing happen'};
		
        if (typeof response !== 'object') {
			try {
				response = Ext.decode(response);
			}
			catch(e){
				method = 'failure';
				arg = incoherentResponse;
			}
			if (typeof response !== 'object') {
				method = 'failure';
				arg = incoherentResponse;
				response = {};
			}
		}
			
		if(response.failure || !response.success){
			method = 'failure';			  
			if(!response.message || response.message.match(/Exception/g)){
				response.message = 'a system error occured';
			} 
		}
		            
		return this.options[method](this, response);
    
    }
});


/**
 * Add Ext.form.Action.SeamSubmit to the Action types array.
 * there are two standard action types a seam basic form has - load and submit
 * in the 
 */
Ext.apply(Ext.form.Action.ACTION_TYPES, {
    'seamSubmit': Ext.form.Action.SeamSubmit,
	'seamLoad': Ext.form.Action.SeamLoad
});
