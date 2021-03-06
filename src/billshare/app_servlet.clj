(ns billshare.app_servlet
  (:gen-class :extends javax.servlet.http.HttpServlet)
  (:use billshare.core)
  (:use [appengine-magic.servlet :only [make-servlet-service-method]]))


(defn -service [this request response]
  ((make-servlet-service-method billshare-app) this request response))

(comment (require '[appengine-magic.core :as ae])
(ae/serve billshare-app)
 (ae/stop))