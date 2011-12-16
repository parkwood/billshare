(ns billshare.core
  (:require [appengine-magic.core :as gae]
	    [noir.util.gae :as noir]))

;; load all of the routes (defpage's) so they get def'd
(require 'billshare.views.google-tests)
(require 'billshare.views.root)
(require 'billshare.views.account-manager)
(require 'billshare.views.groups-manager)

;; def the appengine app
(gae/def-appengine-app billshare-app (noir/gae-handler nil))