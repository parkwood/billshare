(ns billshare.views.groups-manager
  (:require [billshare.views.common :as common]
            [billshare.models.user-service :as service]
            )
  (:use [noir.core :only [defpage]]))


(defpage "/groupMembersList" [] {})

(defpage user-groups "/userGroups" [] 
  (common/holy-shit service/get-groups))

(defpage "/persistGroups" [] {})



