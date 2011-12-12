(ns billshare.views.test-groups-manager
  (:use [noir.util.test]
        [clojure.test]
        [billshare.views.common])
  (:require [billshare.views.groups-manager :as groups-manager]
            [appengine-magic.testing :as ae-testing]
            [clj-json.core :as clj-json :only parse-string]))


(use-fixtures :each (ae-testing/local-services :all))

(defmacro noir-gae-test [& body]
  `(with-noir
    (with-redefs [get-user-email (fn [] "joe.bloggs")]
      ~@body))
  )

(defn extract-data [result]
  (:data (clj-json/parse-string (:body result) true)))
;so this is basically a whole server integration test - good/bad?
(deftest get-no-houses-when-none-exist
  (noir-gae-test
    (is (= [] (extract-data (groups-manager/user-groups [])) ))))

;(run-tests)
(deftest test-group-is-contained-in-map-after-persist
  (noir-gae-test
    (is (= {} (groups-manager/persist-groups {:toPersist "[{
                                               \"description\":	\"sdsd\",
                                               \"entityStatus\": \"ACTIVE\",                                               	
                                               \"id\"	: -1,
                                               \"name\" :	\"sdsd\",
                                               \"newRecord\" : \"true\",
                                               \"relationshipStatus\" :	\"ACTIVE\",
                                               \"tempId\" :	1003}]"})))))

