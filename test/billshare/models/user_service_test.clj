(ns billshare.models.user-service-test
  (:use [clojure.test])
  (:require [billshare.models.user-service :as service]
            [appengine-magic.testing :as ae-testing]
            [billshare.models.data-model])
  (:import  [billshare.models.data_model User House UserHouseRelation Account]))
;(run-tests)

(use-fixtures :each (ae-testing/local-services :all))

(def house-from-browser {:tempId 1 :relationshipStatus "INACTIVE" :id -1 :name "ahouse" :description "big" })

(deftest test-persist-new-house
  (is (= 1 (let [user (service/get-user "vadal@no")] 
              (:tempId (service/persistAndAugmentGroup user house-from-browser))))))

(deftest test-persist-existing-house
  (is (let 
              [user (service/get-user "vadal@no")
               existing-house (service/persistAndAugmentGroup user house-from-browser)              
               modified-house (assoc existing-house :relationshipStatus "ACTIVE" :name "anhouse")
               persisted-house (service/persistAndAugmentGroup user modified-house)
               queried-house (first(service/get-groups user))]
              (and
                (= (:id queried-house) (:id persisted-house))
                (= (:relationshipStatus queried-house) (:relationshipStatus persisted-house)))
              )))

(deftest test-get-no-houses-when-there-are-none
  (is (= [] (let
        [user (service/get-user "vadal@no")]
        (service/get-groups user)))))