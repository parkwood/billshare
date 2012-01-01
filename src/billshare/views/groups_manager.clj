(ns billshare.views.groups-manager
  (:require [billshare.views.common :as common]
            [billshare.models.user-service :as service]
            [clj-json.core :as clj-json :only parse-string]
            )
  (:use [noir.core :only [defpage]]))


(defpage [:any "/groupMembersList"] {:keys [groupId]} 
  (common/call-fn-with-args service/get-group-members groupId))

(defpage user-groups "/userGroups" [] 
  (common/call-fn-with-args service/get-groups))

(defpage user-requesting-to-join-group "userRequestingToJoinGroup" {:keys [groupName]}
  (common/call-fn-with-args service/find-and-join-group groupName))

(defpage persist-groups [:any "/persistGroups"] {:keys [toPersist]} 
  (let [groups-as-passed (clj-json/parse-string toPersist true)]    
    (common/map-fn-returning-map-on-tempId service/persistAndAugmentGroup groups-as-passed))
  )



