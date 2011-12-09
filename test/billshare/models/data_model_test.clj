(ns billshare.models.data-model-test
  (:use [clojure.test])
  (:require [appengine-magic.testing :as ae-testing]
            [billshare.models.data-model]
            [appengine-magic.services.datastore :as ds])

)

(ds/defentity User [name 	password 	random 	username 	email activeStatus userHouseRelations]) ;when create new, say :parent user
(ds/defentity House [name description])
(ds/defentity UserHouseRelation [relationshipStatus house]) 

(use-fixtures :each (ae-testing/local-services :all))

(deftest test-simple-persist-and-query
  (is (= "bama"
         (let [unpersisted (ds/new* User [ "bama" "pword" nil "bama" "b" 0 []])
               persisted (ds/save! unpersisted)
               retrieved (first (ds/query :kind User :filter (= :name "bama")))]
           (:name retrieved)))))

(deftest test-traverse-relationship
  (is (= "inactive"
         (let [user (ds/new* User ["bama" "pword" nil "bama" "b" 0 []])
               house(ds/new* House ["ahouse" "big"])
               p-house (ds/save! house)
               p-user (ds/save! user)
               uhr (ds/new* UserHouseRelation ["inactive" (ds/key-str p-house)] :parent p-user)               
               x ;(ds/with-transaction 
                   (ds/save! uhr)                                                
               p1-user (ds/save! (assoc p-user :userHouseRelations (conj (:userHouseRelations p-user) (ds/get-key-object x) )))              
               retrieved-uhr (first (ds/query :kind UserHouseRelation :ancestor p1-user :filter (= :house (ds/key-str p-house)) ))
               retrieved-house (ds/query :kind House :ancestor (:house retrieved-uhr))]
           (prn retrieved-uhr) 
           (prn (ds/get-key-object retrieved-uhr))
           (prn p1-user)
           (prn retrieved-house)
           (:relationshipStatus retrieved-uhr)))))
