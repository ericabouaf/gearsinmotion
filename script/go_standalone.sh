cat ../js/helpers.js ../js/gearsinmotion.js ../js/gim_datatable_by_sql.js ../js/sql.js > tempo.js
ruby jsmin.rb < tempo.js > gim_standalone.js
rm tempo.js
