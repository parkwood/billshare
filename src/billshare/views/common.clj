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

(defn get-user-email []
  (let [user (guser/current-user)]
    (guser/get-email user))
  )

(defn no-arg-data [f]
  (let [ds-user (ds-user-service/get-user (get-user-email))]
    (response/json {:data (f ds-user)})))

(defn arg-data [f args-seq]
  (let [ds-user (ds-user-service/get-user (get-user-email))
        fn-with-user (partial f ds-user)]
    (response/json (reduce (fn [x] ()) {} args-seq))))
