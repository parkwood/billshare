(ns billshare.models.data-model-test
  (:use [clojure.test])
  (:require [appengine-magic.testing :as ae-testing]
            [billshare.models.data-model :as model]
            [appengine-magic.services.datastore :as ds]
            [clj-json.core :as clj-json :only parse-string])
  (:import  [billshare.models.data_model User Group UserGroupRelation Account]
            [com.google.appengine.api.datastore KeyFactory])
)


(use-fixtures :each (ae-testing/local-services :all))

(deftest test-simple-persist-and-query
  (is (= "bama"
         (let [unpersisted (ds/new* User [ "bama" "pword" nil "bama" "b" 0 []])
               persisted (ds/save! unpersisted)
               retrieved (first (ds/query :kind User :filter (= :name "bama")))]
           (:name retrieved)))))


(deftest test-traverse-relationship
  (is (= "inactive"
         (let [p-user (ds/save! (ds/new* User ["bama" "pword" nil "bama" "b" 0 []]))               
               group-1 (ds/save!(ds/new* Group ["1 group" "small" nil]))
               p-Group (ds/save! (ds/new* Group ["aGroup" "big" nil]))               
               p-ugr (ds/save! (ds/new* UserGroupRelation ["inactive" p-Group] :parent p-user))                                                                             
               p1-user (ds/save! (assoc p-user :userGroupRelations (conj (:userGroupRelations p-user) (ds/get-key-object p-ugr) )))              
               retrieved-uhr (first (ds/query :kind UserGroupRelation :ancestor p1-user :filter (= :group p-Group) ))
               retrieved-Groups (ds/query :kind Group :ancestor (:group retrieved-uhr) )
               group-after-marshal (clj-json/parse-string (clj-json/generate-string (assoc (first retrieved-Groups) :id (model/get-numeric-id (first retrieved-Groups)))) true)
               retrieved-group-after-marshal (ds/retrieve Group (model/create-key-from-numeric "Group" (:id group-after-marshal))  )
               ]
           ;(prn retrieved-uhr) 
           ;(prn (ds/get-key-object retrieved-uhr))
           ;(prn p1-user)
           (prn retrieved-group-after-marshal)
           (prn (:id group-after-marshal) (type (:id group-after-marshal)))
           ;(prn "after marshal"  group-after-marshal)
           (:relationshipStatus retrieved-uhr)))))
;(run-tests)