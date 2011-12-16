(ns billshare.models.user-service
  (:require [billshare.models.data-model :as model]
            [appengine-magic.services.datastore :as ds])
  (:import  [billshare.models.data_model User Group UserGroupRelation Account]
            [com.google.appengine.api.datastore KeyFactory]))



(defn get-user [email]
  (or
    (first (ds/query :kind User :filter (= :email email)))
    (ds/save! (ds/new* User [ nil nil nil email email 0 []]))))

(defn get-accounts [email]
  (let [user (first (ds/query :kind User :filter (= :email email)))]
    (ds/query :kind Account :ancestor user)))

(defn- assoc-id-with-group [group relationshipStatus]
  (assoc group :relationshipStatus relationshipStatus :id (model/get-numeric-id group)))

(defn- augment-Group-with-ugr [{:keys [relationshipStatus] :as ugr}]
  "prob not too efficient doing query per Group..optimize later"
  ;(prn "ugr" ugr)
  (let [saved-Group (ds/retrieve Group (:group ugr) )]
    ;(prn "saved-Groups" saved-Groups)
    (assoc-id-with-group saved-Group relationshipStatus))
  )

(defn get-groups [user]
  (if-let [ugrs (ds/query :kind UserGroupRelation :ancestor user)]    
    (map  augment-Group-with-ugr ugrs)
    []))

;description	sdsd
;entityStatus	ACTIVE
;GroupId - dont need this. the id is the Group id	
;id	-1
;name	sdsd
;newRecord	true
;relationshipStatus	
;tempId	1003
(defn- persistGroup [user {:keys [id name description relationshipStatus]}]
  ""
  
  (if-let [group (ds/retrieve Group (model/create-key-from-numeric "Group" id))]    
    (let [saved-Group (ds/save! (assoc group :description description :name name))
          retrieved-ugr (ds/retrieve UserGroupRelation (:userGroupRelation group))
          saved-uhr (ds/save! (assoc retrieved-ugr :relationshipStatus relationshipStatus))]
      ;(prn "i could find group with id"  id)
      saved-Group)
    (let [saved-Group-minus-ugr (ds/save! (ds/new* Group [name description nil]))
          ugr (ds/save! (ds/new* UserGroupRelation [relationshipStatus saved-Group-minus-ugr] :parent user))
          saved-Group (ds/save! (assoc saved-Group-minus-ugr :userGroupRelation ugr))
          ]
    ;(prn "cannot find group with id"  id)
        saved-Group
      )
    )
  
  )

(defn persistAndAugmentGroup [user {:keys [tempId relationshipStatus] :as from-web}] 
  ;(prn "from web"  from-web tempId)
  (let [saved-Group (persistGroup user from-web)]
    ;(prn "!!!!!!!!!!11" saved-Group)    
    (assoc (assoc-id-with-group saved-Group relationshipStatus) :tempId tempId  ))
  )


