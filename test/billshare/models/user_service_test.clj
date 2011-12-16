(ns billshare.models.user-service-test
  (:use [clojure.test])
  (:require [billshare.models.user-service :as service]
            [appengine-magic.testing :as ae-testing]
            [billshare.models.data-model])
  (:import  [billshare.models.data_model User Group UserGroupRelation Account]))
;(run-tests)

(use-fixtures :each (ae-testing/local-services :all))

(def Group-from-browser {:tempId 1 :relationshipStatus "INACTIVE" :id -1 :name "aGroup" :description "big" })

(deftest test-persist-new-Group
  (is (= 1 (let [user (service/get-user "vadal@no")] 
              (:tempId (service/persistAndAugmentGroup user Group-from-browser))))))

(deftest test-persist-existing-Group
  (is (let 
              [user (service/get-user "vadal@no")
               existing-Group (service/persistAndAugmentGroup user Group-from-browser)              
               modified-Group (assoc existing-Group :relationshipStatus "ACTIVE" :name "anGroup")
               persisted-Group (service/persistAndAugmentGroup user modified-Group)
               queried-Group (first(service/get-groups user))]
              ;(prn "queried-Group" queried-Group persisted-Group)
              ;(prn "query" (service/get-groups user))
              (and
                (= (:id queried-Group) (:id persisted-Group))
                (= (:relationshipStatus queried-Group) (:relationshipStatus persisted-Group)))
              )))
(comment(run-tests))

(deftest test-get-no-Groups-when-there-are-none
  (is (= [] (let
        [user (service/get-user "vadal@no")]
        (service/get-groups user)))))

(deftest test-retrieve-multiple-groups
  (is (let [user (service/get-user "vadal@no")
               persist-1-Group (service/persistAndAugmentGroup user Group-from-browser)
               persist-2-Group (service/persistAndAugmentGroup user (assoc Group-from-browser :name "bGroup" :relationshipStatus "ACTIVE"))
               groups (service/get-groups user)
               names (map :name groups)]
        ;(prn groups)
        (not (= (first names) (second names))))))