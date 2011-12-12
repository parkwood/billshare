(ns billshare.views.root
    (:require [billshare.views.common :as common]
            [noir.content.getting-started]
            [noir.session]
            [noir.response :as response :only json])
  (:use [noir.core :only [defpage defpartial]]
        [hiccup.core :only [html]]
        [hiccup.page-helpers :only [include-css html5 include-js]]))


(defpartial create-main []
  (html5
    [:head
     [:title "billshare"]
     (include-css
       "/css/2reset.css"
       "/css/reset.css"
       "/ext2.2/resources/css/ext-all.css"
       )
     (include-js
       "/ext2.2/adapter/ext/ext-base.js"
       "/ext2.2/ext-core-debug.js"
       "/ext2.2/ext-all-debug.js"       
       "/ext2.2/locale/ext-lang-en.js"
       "/ExtExtension/grid-filtering/grid/filter/Filter.js"
       "/ExtExtension/grid-filtering/grid/filter/BooleanFilter.js"
       "/ExtExtension/grid-filtering/grid/filter/DateFilter.js"     
       "/ExtExtension/grid-filtering/grid/filter/NumericFilter.js"
       "/ExtExtension/grid-filtering/grid/filter/StringFilter.js"
       "/ExtExtension/grid-filtering/grid/filter/ListFilter.js"
       "/ExtExtension/grid-filtering/grid/GridFilters.js"
       "/ExtExtension/Format.js"     
       "/script/i18ln/en_messages.js"
       "/script/i18ln/localeSelector.js"
       "/script/integration/remotingProxy.js"
       "/script/integration/remotingFormHandler.js"    
       "/script/billManager/userGroup/inviteUserToGroup.js"
       "/script/billManager/userGroup/userGroupManager.js"
       "/script/billManager/userGroup/userRequestingToJoinGroup.js"
       "/script/billManager/util/grid.js"
       "/script/billManager/util/format.js"
       "/script/billManager/userAccount/userDetails.js"
       "/script/billManager/helpManager.js"
       "/script/billManager/layout.js"
       "/script/billManager/groupListStores.js"
       "/script/billManager/accountsGrid.js"
       "/script/billManager/userTasks.js"
       "/script/billManager/owages.js"
       "/script/billManager/main.js")

     ]
    [:body
     [:div#west]
     [:div#north {:style "height:80px"}
      [:div#banner {:style "width:60%;height:80px"}
       [:img {:src "img/bus.jpg" :style "height:80px;display:inline"}]]
      [:div#localeEl]]
     [:div#center2]
     [:div#center1
      [:div#groupGrid]
      [:div#groupMembersGrid]]
     [:div#props-panel {:style "width:200px;height:200px;overflow:hidden;"}]
     ]))

(defpage "/" []
  ;(when-not (noir.session/get :user-info)
  ;  (noir.response/redirect "/login")
    (create-main))

(defpage "/unknown" [] (response/json {}))

