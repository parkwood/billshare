(ns billshare.views.welcome
  (:require [billshare.views.common :as common]
            [noir.content.getting-started]
            [noir.session]
            [noir.response])
  (:use [noir.core :only [defpage defpartial]]
        [hiccup.core :only [html]]
        [hiccup.page-helpers :only [include-css html5 include-js]]))

(comment (defpage "/welcome" []
         (common/layout
           [:p "Welcome to billshare"])))

