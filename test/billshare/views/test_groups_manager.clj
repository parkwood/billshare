(ns billshare.views.test-groups-manager
  (:use [noir.util.test]
        [clojure.test])
  (:require [billshare.views.groups-manager :as groups-manager]
            [appengine-magic.testing :as ae-testing]))


(use-fixtures :each (ae-testing/local-services :all))

;so this is basically a whole server integration test - good/bad?
(deftest get-no-houses-when-none-exist
  (with-noir
    (= [] (groups-manager/user-groups []))))

