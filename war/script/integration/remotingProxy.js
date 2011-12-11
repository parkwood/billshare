// This line should be included in all files in order to reference a local
// blank image (by default BLANK_IMAGE_URL = http://www.extjs.com)
Ext.BLANK_IMAGE_URL = 'ext2.2/resources/images/default/s.gif';

/**
 * Copyright(c) 2008, http://www.mcdconsultingllc.com
 * 
 * Licensed under the terms of the Open Source LGPL 3.0
 * http://www.gnu.org/licenses/lgpl.html
 * @author Sean McDaniel 
 */
Ext.namespace('Ext.ux.data');

/**
 * @class Ext.data.ux.SeamRemotingProxy
 * @extends Ext.data.DataProxy
 * Seam remoting proxy.  An extension of the Ext.data.DataProxy class for
 * making requests to server side Seam components via Seam remoting.  This
 * proxy can be bound to a single Seam component and futher to a single
 * method exposed by the component.  In order to the remoting to work the
 * method must be annotated wtih @WebRemote.
 *
 * Constructor
 * @param {Object} config - Containing the following properties:
 * - seamComponent - A Seam component instance.
 * - remoteMethod - A reference to the remote method.
 * - requestComponent - The name of a Seam component
 */
Ext.ux.data.SeamRemotingProxy = function(config) {
   Ext.apply(this, config);
   Ext.ux.data.SeamRemotingProxy.superclass.constructor.call(this);
};

Ext.extend(Ext.ux.data.SeamRemotingProxy, Ext.data.DataProxy, {
   /**
    * Calls the seam remote method.
    * 
    * @param {Object} params An object containing properties which are to be used as parameters
    * to the remote method.  If a requestComponent was specified the properties will
    * be copied to the requestComponent instance else they will be passed as individual args to the
    * remote method.
    * @param {Ext.data.DataReader} reader The Reader object which converts the data
    * object into a block of Ext.data.Records.
    * @param {Function} callback The function into which to pass the block of Ext.data.Records.
    * The function must be passed 
    * - The Record block object
    * - The "arg" argument from the load function
    * - A boolean success indicator
    * @param {Object} scope The scope in which to call the callback
    * @param {Object} arg An optional argument which is passed to the callback as its second parameter.
    */
    load: function(params, reader, callback, scope, arg) {
        this.fireEvent("beforeload", this, params);
        var args = [];
        params = params || {};
        var proxy = this;

        Ext.Ajax.request({
        	   url: this.remoteMethod || '/unknown',
        	   success: function(response) {
                   proxy.loadResponse(response, reader, callback, scope, arg);
               },
        	   failure: function(){alert("Error")},
        	   
        	   params: params
        	});        
    },

    /**
     * Private!  Processes the response.  
     */
    loadResponse: function(response, reader, callback, scope, arg) {
        var result;
        try {
            result = reader.read(response.responseText);
        } catch (e) {
        	console.debug(e);
            this.fireEvent("loadexception", this, response, e);
            callback.call(scope, response, arg, false);   
            return;
        }
    
        this.fireEvent("load", this, response, arg);
        callback.call(scope, result, arg, true);    
    }
});

/**
 * @class Ext.data.ux.SeamRemotingJsonReader
 * @extends Ext.data.JsonReader
 * Need to extend Ext.data.JsonReader to account for the fact that the Ext.data.JsonReader
 * expectes the actual reponse string to be assigned to the property 'responseText' on the
 * response object it is passed.  The override to the read method here simply calls the base 
 * class, packaging the reponse received from the callback in a responseText property of a
 * new object.
 *
 * This class uses a simple protocol with the server. Since Seam Remoting abstracts away the
 * Http layer we can't rely on an HTTP status to determine if the call resulted in a server
 * side exception or not.  The solution here use an interceptor on the server for the remote
 * methods that returns Json.  If an exception is raised the interceptor will return a Json
 * string of '{exception:true}'.  This reader will in turn throw an exception with
 * the message which will ultimately result in a 'loadexception' to be fired from the proxy.
 * Note: this interceptor infrastructure is required.  It was determined that when error occured
 * on the server our Seam registered callback was not invoked.  
 */
Ext.ux.data.SeamRemotingJsonReader = function(meta, recordType) {
    Ext.apply(meta, {successProperty: 'success'});
    Ext.ux.data.SeamRemotingJsonReader.superclass.constructor.call(this, meta, recordType);
};

Ext.extend(Ext.ux.data.SeamRemotingJsonReader, Ext.data.JsonReader, {
    /**
     * This method is only used by a DataProxy which has retrieved data from a remote server.
     * This override simply accounts for the need to create a response object with a responseText
     * property. 
     *
     * If the success indicator is false throw an exception.
     *
     * @param {Object} response The Seam Remoting object which is the json version of the data returned by java method
     * @return {String} data A data block which is used by an Ext.data.Store object as
     * a cache of Ext.data.Records.
     */
    read: function(response) { 
    //return response;
     //response = '{data:'+Ext.encode(response)+'}';
        var response = Ext.decode(response);//{data:response};//
        
		if(!response || typeof response !== 'object'){
			response = {success:false, data:[]};
		}
		else{
			response = response.data;
		}
		
        if (response.data && response.data.exception) {
            throw {
                message: 'SeamRemotiingJsonReader.read: Exception raised on server.'
            };      
        }
    
        return Ext.ux.data.SeamRemotingJsonReader.superclass.read.call(this, {
            responseText: Ext.encode(response)
        }); 
        //return json;   
    }
});


Voltan.billManager.seamCallback = function(serverFn){
	return function(response){
		if(typeof response === 'string'){
			try {
				response = Ext.encode(response);
			}
			catch(ex){
				throw { message:'error: '+response };
			}			
		}
		if(response.exception){
				throw { message:'error: '+response.exception };
		}
		
		serverFn(response);
	}
	
}

