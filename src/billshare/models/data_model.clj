(ns billshare.models.data-model
  (:require [appengine-magic.services.datastore :as ds])
   (:import [com.google.appengine.api.datastore KeyFactory]))

(ds/defentity User [name 	password 	random 	username 	email activeStatus userGroupRelations]) ;when create new, say :parent user
(ds/defentity Group [ name description userGroupRelations])
(ds/defentity UserGroupRelation [relationshipStatus group]) 
(ds/defentity Account [name activeStatus bills]) 

(defn create-key-from-numeric [str-type numeric-id] 
  (try
    (KeyFactory/createKey str-type (.intValue numeric-id))
    (catch Exception e numeric-id)))
