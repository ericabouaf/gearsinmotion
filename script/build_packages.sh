#!/usr/bin/sh

# Compress all the needed files into a zip
# excluding the svn files.
rm -f gearsinmotion-0.2.zip
zip -r gearsinmotion-0.2.zip ../gearsinmotion.html ../images ../css ../js ../lib -x "*.svn/*"

# Same thing but with the standalone version
rm -f ../js/gim-standalone-0.2.js gim-standalone-0.2.zip
cat ../js/helpers.js ../js/gearsinmotion.js ../js/gim_datatable_by_sql.js ../js/sql.js | ruby jsmin.rb > ../js/gim-standalone-0.2.js
zip -r gim-standalone-0.2.zip ../gim-standalone.html ../images ../css ../js/gim-standalone-0.2.js ../lib -x "*.svn/*"