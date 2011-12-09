(ns billshare.models.user-service
  (:require [billshare.models.data-model]
            [appengine-magic.services.datastore :as ds]))

(ds/defentity User [name 	password 	random 	username 	email activeStatus userHouseRelations]) ;when create new, say :parent user
(ds/defentity House [name description])
(ds/defentity UserHouseRelation [relationshipStatus house]) 
(ds/defentity Account [name activeStatus bills])

(defn get-user [email]
  (or
    (first (ds/query :kind User :filter (= :email email)))
    (ds/save! (ds/new* User [ nil nil nil email email 0 []]))))

(defn get-accounts [email]
  (let [user (first (ds/query :kind User :filter (= :email email)))]
    (ds/query :kind Account :ancestor user)))

(defn- augment-uhr-with-house [{:keys [relationshipStatus] :as uhr}]
  "prob not too efficient doing query per house..optimize later"
  (let [saved-house (first(ds/query :kind House :ancestor (:house uhr)))]
    (assoc saved-house :relationshipStatus relationshipStatus :id (ds/key-str saved-house)))
  )

(defn get-groups [user]
  (if-let [uhrs (ds/query :kind UserHouseRelation :ancestor user)]
    (map  augment-uhr-with-house uhrs)
    []))

;description	sdsd
;entityStatus	ACTIVE
;houseId - dont need this. the id is the house id	
;id	-1
;name	sdsd
;newRecord	true
;relationshipStatus	
;tempId	1003
(defn- persistGroup [user {:keys [id name description relationshipStatus]}]
  "lets assume we have user already"
  (if-let [uhr (first(ds/query :kind UserHouseRelation :ancestor user :filter (= :house id)))]
    (let [house (first(ds/query :kind House :ancestor (:house uhr)))
          saved-house (ds/save! (assoc house :description description :name name))
          saved-uhr (ds/save! (assoc uhr :relationshipStatus relationshipStatus))]
      saved-house)
    (let [saved-house (ds/save! (ds/new* House [name description]))
          uhr (ds/save! (ds/new* UserHouseRelation [relationshipStatus (ds/key-str saved-house)] :parent user))
          ]
        saved-house
      )  
    )
  )

(defn persistAndAugmentGroup [user {:keys [tempId relationshipStatus] :as from-web}] 
  (let [saved-house (persistGroup user from-web)]
    (prn "!!!!!!!!!!11" saved-house)
    (assoc saved-house :tempId tempId :relationshipStatus relationshipStatus :id (ds/key-str saved-house)))
  )


