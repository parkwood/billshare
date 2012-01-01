(ns billshare.models.user-service-test
  (:use [clojure.test])
  (:require [billshare.models.user-service :as service]
            [appengine-magic.testing :as ae-testing]
            [appengine-magic.services.datastore :as ds]
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

(deftest test-retrieve-multiple-groups
  (is (let [user (service/get-user "vadal@no")
               persist-1-Group (service/persistAndAugmentGroup user Group-from-browser)
               persist-2-Group (service/persistAndAugmentGroup user (assoc Group-from-browser :name "bGroup" :relationshipStatus "ACTIVE"))
               groups (service/get-groups user)
               names (map :name groups)]
        ;(prn groups)
        (not (= (first names) (second names))))))

(deftest test-get-no-Groups-when-there-are-none
  (is (= [] (let
        [user (service/get-user "vadal@no")]
        (service/get-groups user)))))

(defn setup-house-with-two-people []
  (let [user1 (service/get-user "vadal@no")
            persist-Group (service/persistAndAugmentGroup user1 Group-from-browser)
            user2 (service/get-user "badal@no")
            try-add (service/find-and-join-group user2 (:name Group-from-browser))]
    [user2 persist-Group]))

(deftest test-create-group-then-add-second-person
  (is (= 2 (let [[user2 persist-Group] (setup-house-with-two-people)
                 users-in-house (service/get-group-members user2 (ds/key-id persist-Group))]
             ;(prn users-in-house)
             (count users-in-house)))))
(comment(run-tests))

(deftest test-error-when-house-does-not-exist
  (is (= "you are not a member of the group you are requesting"
         (let [user (service/get-user "vadal@no")
               response (service/get-group-members user 3)]
           response)))
  (is (= "unable to find the group aGroup" 
         (let [user (service/get-user "vadal@no")
               response (service/find-and-join-group user (:name Group-from-browser))]
           response)))
  )

(deftest test-error-when-user-already-in-house
  (is (= "you already belong to this group"
         (let [[user2 persist-Group] (setup-house-with-two-people)
               try-add (service/find-and-join-group user2 (:name Group-from-browser))]
           try-add))))
