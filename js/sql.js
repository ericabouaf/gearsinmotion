
/**
 * Creates GIM.db
 */
GIM.initDatabase = function() {
   try {
      this.db = google.gears.factory.create('beta.database', '1.0');
   } 
   catch (ex) {
      throw new Error('GIM was unable to init database: '+ex.message);
   }
};


/**
 * Let the user add a new table with just an 'id' field. 
 */
GIM.addTable = function() {
  var tableName = prompt('Enter the new table name');
  
  if(tableName === null) { return; }
  if( tableName === '') {
     alert('Cannot create table without a name.');
     return;
  } 
  
  var query = 'create table '+tableName+' (id integer)';
  
  try {
     this.db.execute(query);
  }
  catch(ex) {
     throw new Error('GIM was unable to add table: '+ex.message);
  }
  
  this.updateMenu();
  GIM.displayTableBySql("select * from "+tableName, [], GIM.gim_data);
  // refresh liaisons (new liaisons can appear)
  GIM.autoDiscoverLiaisons();

};


GIM.openDatabase = function(dbName) {
   
   // Close the previous opened database
   if( this.db && this.openedDatabase) {
      this.db.close();
   }
   
   // Open the database
   try {
      this.db.open(dbName);
      this.openedDatabase = dbName;
      this.autoDiscoverLiaisons();
   }
   catch(ex) {
         throw new Error('GIM was unable to open database: '+ex.message);
   }
   
};




/**
 * Query database and returns an associative array 
 */
GIM.query = function(query,queryParams) {
   var table = [];
   var j = 0;
   try {
      var resultSet = this.db.execute (query,queryParams);
   }
   catch(ex) {
      throw new Error("GIM.query error: "+ex.message);
   }
   while( resultSet.isValidRow() ) {
      table[j] = [];
      for( var i = 0 ; i < resultSet.fieldCount() ; i++) {
         table[j][resultSet.fieldName(i)] = resultSet.field(i);
      }
      j++;
      resultSet.next();
   }
   resultSet.close();
   return table;
};


/**
 * Returns the list of tables
 */
GIM.listTables = function() {
   return this.query('select * from sqlite_master');
};

/**
 * Returns the number of elements in a table
 */
GIM.countTable = function(table) {
   var res = this.query('select count(*) from '+table);
   return res[0]["count(*)"];
};

/**
 * Returns the list of fields in a table
 */
GIM.listFieldInTable = function(tableName) {
   
   /*if (tableName === "sqlite_master") {
	  return [["name","varchar(255)"],["sql","varchar(255)"]];
   }*/

   if(!tableName) {
      console.trace();
      throw new Error("Must provide a tableName");
   }

   var res = this.query('select * from sqlite_master where name=?',[tableName]);
   
   var sql = res[0]["sql"];
   try {
      var regexpResults = sql.match(/^CREATE TABLE [^ ]*[ ]*\((.*)\)$/);
      var fieldsAndValues = regexpResults[1].split(',');
   }
   catch(ex) {
      alert("unable to match regexp.");
      return;
   }
   
   var fields = [];
   var simpleFields = [];
   for(var i =0 ; i < fieldsAndValues.length ; i++) {
      var field = fieldsAndValues[i].replace(/^\s+/, '').replace(/\s+$/, '').split(' ');
      fields.push([field[0],field[1]]);
	  simpleFields.push(field[0]);
   }
   return [fields,simpleFields];
};


GIM.insert = function(obj,tableName) {
   var fields,simpleFields = this.listFieldInTable(tableName);
   var queryParams = [];
   var questionMarks = [];
   for(var i = 0 ; i < fields.length ; i++) {
      var fieldName = fields[i][0];
      queryParams.push(obj[fieldName]);
      questionMarks.push('?');
   }
   var query = "insert into "+tableName+" values ("+questionMarks.join(',')+")";
   this.query(query, queryParams);
};



/**
 * This function exports the opened database to sql
 */
GIM.exportTablesInSQL = function() {
   
   var res = this.query('select * from sqlite_master');
   var sql_output = "";
   
   for(var i = 0 ; i < res.length ; i++) {
      
      // Structure de la table
      sql_output += res[i]['sql']+';\n';
      
      // Donnees
      var entries = this.query('select * from '+res[i]['name']);
      for(var k = 0 ; k < entries.length ; k++) {
         var queryParams = [];
         for(var field in entries[k]) {
            if( entries[k].hasOwnProperty(field) )
               queryParams.push('`'+entries[k][field]+'`');
         }
         var query = 'insert into '+res[i]['name']+' value ('+queryParams.join(',')+')';
         sql_output += query+';\n';
      }
      
   }
   return sql_output;
};

/**
 *  Update a field in an element:
 *  @params
 *          tableName {String}
 *          elementId {Integer}
 *          fieldName {String}
 *          newFieldValue
 */
GIM.updateElement = function(tableName, elementId, fieldName, newFieldValue) {
   
   var query = "update "+tableName+" set "+fieldName+"=? where id=?";
   var queryParams = [newFieldValue, elementId];
   
   GIM.query(query, queryParams);
};


/**
 * Get the next available id for the table (max(id)+1)
 */

GIM.getNextAvailableId = function(tableName) {
	var currentTable = this.query('select * from '+tableName+' order by id desc');
	if( currentTable.length === 0 ) return 1;
	var currentId = currentTable[0]['id'];
	var nextId = currentId+1;
	return nextId;
};

/**
 * autoDiscoverLiaisons
 */
GIM.autoDiscoverLiaisons = function() {
   
   var liaisons = [];
   
   // Loop on tables
   var tables = this.listTables();
   var tableNames = [];
   for(var i = 0 ; i < tables.length ; i++) {
      tableNames[i] = tables[i]['name'];
   }
   for(var i = 0 ; i < tables.length ; i++) {
      var table = tables[i];
      var tableName = table['name'];

      // Is it a many-to-many liaison table ?
      // ie. container a '_'
      var splittedName = tableName.split('_');
      if( splittedName.length == 2 && 
          tableNames.indexOf(splittedName[0]) != -1 &&
          tableNames.indexOf(splittedName[1]) != -1 ) {
             if( !liaisons[ splittedName[0] ] ) {
                liaisons[splittedName[0]] = [];
             }
             if( !liaisons[ splittedName[1] ] ) {
                liaisons[splittedName[1]] = [];
             }
             liaisons[ splittedName[0] ].push(["many_to_many", splittedName[1], tableName]);
             liaisons[ splittedName[1] ].push(["many_to_many", splittedName[0], tableName]);
      }
      // Else loop through the fields to find '_id'
      else {
         var fields = this.listFieldInTable(tableName)[0];      
         for(var k = 0 ; k < fields.length ; k++) {
            var fieldName = fields[k][0];
            if(fieldName.length > 3) {
               if( fieldName.substr(-3,3) == '_id' ) {
                  var singularDestTable = fieldName.substr(0, fieldName.length-3 );
                  var destTable = this.pluralizeTableName(singularDestTable);
                  if( tableNames.indexOf(destTable) != -1 ) {
                     if( !liaisons[tableName] ) liaisons[tableName] = [];
                     liaisons[tableName].push(["belongs_to", destTable]);
                     if( !liaisons[destTable] ) liaisons[destTable] = [];
                     liaisons[destTable].push(["has_many", tableName]);
                  }
               }
            }
         }
      }
      
   }
   this.liaisons = liaisons;
};
 
GIM.pluralizeTableName = function(singularName) {
   if( singularName.substr(-1,1) == 'y' ) {
      return singularName.substr(0,singularName.length-1)+'ies';
   }
   return singularName+'s';
};

GIM.singularizeTableName = function(pluralName) {
   if( pluralName.substr(-3,3) == 'ies' ) {
      return pluralName.substr(0,pluralName.length-3)+'y';
   }
   return pluralName.substr(0,pluralName.length-1);
};