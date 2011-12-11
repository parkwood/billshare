(ns billshare.views.groups-manager
  (:require [billshare.views.common :as common]
            [billshare.models.user-service :as service]
            [clj-json.core :as clj-json :only parse-string]
            )
  (:use [noir.core :only [defpage]]))


(defpage [:any "/groupMembersList"] {:keys [groupId]} {})

(defpage user-groups "/userGroups" [] 
  (common/no-arg-data service/get-groups))

(defpage [:any "/persistGroups"] {:keys [toPersist]} 
  (let [groups-as-passed (clj-json/parse-string toPersist true)]
    (prn "as passed " groups-as-passed)
    (common/arg-data service/persistAndAugmentGroup groups-as-passed))
  )



