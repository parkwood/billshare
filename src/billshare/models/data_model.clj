(ns billshare.models.data-model
  (:require [appengine-magic.services.datastore :as ds]))

(ds/defentity User [name 	password 	random 	username 	email activeStatus userHouseRelations]) ;when create new, say :parent user
(ds/defentity House [name description])
(ds/defentity UserHouseRelation [relationshipStatus house]) 
(ds/defentity Account [name activeStatus bills]) 
