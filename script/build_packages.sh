#!/usr/bin/sh
rm -f ../js/gim-standalone-0.2.1.js
cat ../js/helpers.js ../js/gearsinmotion.js ../js/gim_datatable_by_sql.js ../js/sql.js | ruby jsmin.rb > ../js/gim-standalone-0.2.1.js

