(ns billshare.views.google-tests
   (:use [noir.core :only [defpage pre-route]]
         [noir.response :only [redirect]]         
         [hiccup.core :only [html]]
         [hiccup.page-helpers :only [link-to]]
         [appengine-magic.services.user :as guser]
         [billshare.models.user-service :as ds-user-service]))

(defpage "/user" []  
  (let [user (guser/current-user)
        ds-user (ds-user-service/get-user (guser/get-email user))]    
    (html
      [:span user]
      [:span ds-user]
      [:p (link-to (guser/logout-url) "sign out")]
    )))

(pre-route "/*" {}
(when-not (guser/user-logged-in?)
(redirect (guser/login-url :destination "/user"))))

(defpage "/login" []  
  ""
  (let [user (guser/current-user)] 
    (html [:h1 "Hello, " (if user (.getNickname user) "World") "!"]
          [:p (link-to (guser/login-url) "sign in")]
          [:p (link-to (guser/logout-url) "sign out")]))
  )
