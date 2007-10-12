#!/usr/bin/sh
#
#  This file generates a single "gim_standalone.js" file
#
cat ../js/helpers.js ../js/gearsinmotion.js ../js/gim_datatable_by_sql.js ../js/sql.js > temp.js
ruby jsmin.rb < temp.js > gim_standalone.js
rm temp.js
