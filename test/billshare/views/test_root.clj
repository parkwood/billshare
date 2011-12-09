(ns billshare.views.test-root
  (:use [noir.util.test]
        [noir.cookies :as cookies]
        [clojure.test]))



(deftest cookies-get
(with-noir
(is (nil? (cookies/get :noir)))
(is (= "noir" (cookies/get :noir "noir")))))

