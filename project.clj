(defproject billshare "0.1.0-SNAPSHOT"
            :description "FIXME: write this!"
            :dependencies [[org.clojure/clojure "1.3.0"]
                           [noir "1.2.1"]
                           [org.clojure/java.jdbc "0.0.6"]
                           [mysql/mysql-connector-java "5.1.6"]
                           [c3p0/c3p0 "0.9.1.2"]
                           [appengine-magic "0.4.3"]]
            :main billshare.server)

