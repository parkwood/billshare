(ns billshare.views.common
  (:require
    [noir.response :as response :only json]
    [appengine-magic.services.user :as guser]
    [billshare.models.user-service :as ds-user-service])
  (:use [noir.core :only [defpartial]]
        [hiccup.page-helpers :only [include-css html5]]))
;nothing here yet
(comment(defpartial layout [& content]
            (html5
              [:head
               [:title "billshare"]
               (include-css "/css/2reset.css")]
              [:body
               [:div#wrapper
                content]])))

(defn holy-shit [f]
  (let [user (guser/current-user)
        ds-user (ds-user-service/get-user (guser/get-email user))]
    (response/json(f ds-user))))
