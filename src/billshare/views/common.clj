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

(defn call-fn-with-args [f & args]
  (let [ds-user (ds-user-service/get-user (get-user-email))]
    (response/json {:data (apply f ds-user args)})))

(defn map-fn-returning-map-on-tempId [f args-seq]
  (let [ds-user (ds-user-service/get-user (get-user-email))
        fn-with-user (partial f ds-user)
        result-map (reduce (fn [result x] 
                             (let [fn-result (fn-with-user x)]
                               (assoc result (:tempId fn-result) fn-result))) {} args-seq)]
    (prn "result map" result-map)
    (response/json result-map )))
