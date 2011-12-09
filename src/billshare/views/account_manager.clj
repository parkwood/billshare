(ns billshare.views.account-manager
  (:require [billshare.views.common :as common]
            [noir.content.getting-started]
            [noir.session]
            [noir.response :as response :only json]
            [appengine-magic.services.user :as guser]
            [billshare.models.user-service :as ds-user-service])
  (:use [noir.core :only [defpage defpartial]]
        [hiccup.core :only [html]]
        [hiccup.page-helpers :only [include-css html5 include-js]]))


(defpage "/getUserAccounts" [] 
  (let [user (guser/current-user)
        ds-user (ds-user-service/get-user (guser/get-email user))]
    (response/json {})))