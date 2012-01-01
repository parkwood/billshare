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
  (assoc group :relationshipStatus relationshipStatus :id (ds/key-id group)))

(defn- augment-Group-with-ugr [{:keys [relationshipStatus] :as ugr}]
  "prob not too efficient doing query per Group..optimize later"
  (let [saved-Group (ds/retrieve Group (:group ugr) )]
    (assoc-id-with-group saved-Group relationshipStatus))
  )

(defn get-groups [user]
  (if-let [ugrs (ds/query :kind UserGroupRelation :ancestor user)]    
    (map  augment-Group-with-ugr ugrs)
    []))

(defn- persistGroup [user {:keys [id name description relationshipStatus]}]    
  (if-let [group (ds/retrieve Group (model/create-key-from-numeric "Group" id))]    
    (let [saved-Group (ds/save! (assoc group :description description :name name))
          retrieved-ugr (first (ds/query :kind UserGroupRelation :ancestor user :filter (= :group group)))
          saved-uhr (ds/save! (assoc retrieved-ugr :relationshipStatus relationshipStatus))]      
      saved-Group)
    (let [saved-Group-minus-ugr (ds/save! (ds/new* Group [name description []]))
          ugr (ds/save! (ds/new* UserGroupRelation [relationshipStatus saved-Group-minus-ugr] :parent user))
          saved-Group (ds/save! (assoc saved-Group-minus-ugr :userGroupRelations (conj (:userGroupRelations saved-Group-minus-ugr) ugr))) ]
      saved-Group
      )
    )
  )

(defn persistAndAugmentGroup [user {:keys [tempId relationshipStatus] :as from-web}] 
  (let [saved-Group (persistGroup user from-web)]    
    (assoc (assoc-id-with-group saved-Group relationshipStatus) :tempId tempId  ))
  )

(defn get-group-members [user group-id]  
  (let [group-key (model/create-key-from-numeric "Group" group-id)
        ugrs (ds/query :kind UserGroupRelation :filter (= :group group-key))
        user-keys (map (fn [x] (.getParent (ds/get-entity-object x))) ugrs)]    
    (if-let [existing-ugr (first (ds/query :kind UserGroupRelation :ancestor user :filter (= :group group-key)))]
      (map (fn [x] (ds/retrieve User x)) user-keys)
      "you are not a member of the group you are requesting"
      ))
  )

(defn find-and-join-group [user group-name]
  (if-let [group (first(ds/query :kind Group :filter (= :name group-name)))]
    (if-let [existing-ugr (first (ds/query :kind UserGroupRelation :ancestor user :filter (= :group group)))]
      "you already belong to this group"
      (let
        [ugr (ds/save! (ds/new* UserGroupRelation ["INACTIVE" group] :parent user))
         saved-group (ds/save! (assoc group :userGroupRelations (conj (:userGroupRelations group) ugr)))]
        "success"
        ))
    (str "unable to find the group " group-name)
    ))

