/**
 *    GearsInMotion v0.2
 *
 *    http://code.google.com/p/gearsinmotion/
 */
var GIM = {
   
   
   elementDomFunctions: {},
   
   
   /**
    * Init function
    * params:
    *       - dbName (optional) Name of the database to open.
    *                            If it is undefined, we will display a form to select.
    */
   init: function(dbName) {
      
      this.initPanel();
      this.initDom();
      this.initDatabase(); 
      this.chooseDb(dbName);
   },
   
   /**
    * Creates the GIM panel : GIM.panel_container
    */
   initPanel: function() {
      
      this.div_to_store_skin_sam_class = cn('div', {className: 'yui-skin-sam'});
      document.body.appendChild(this.div_to_store_skin_sam_class);

      this.gim_dom_container = cn('div', {id: 'gim_dom_container'});
      this.div_to_store_skin_sam_class.appendChild(this.gim_dom_container);
      
      var gim_dom_container_hd = document.createElement('div', {className: 'hd'});
      
      this.gim_dom_container.appendChild(gim_dom_container_hd);
      var gim_dom_container_bd = cn('div', {className: 'bd'});
      
      this.gim_dom_container.appendChild(gim_dom_container_bd);
      var gim_dom_container_ft = cn('div', {className: 'ft'});
      
      this.gim_dom_container.appendChild(gim_dom_container_ft);

      this.panel_container = new YAHOO.widget.Panel('gim_panel',  
            { width:"1150px",
              close:true, 
              draggable:true, 
              modal:true,
              visible: this.panel_visible
            }
          );
      this.panel_container.setHeader('GIM : Gears In Motion, a simple tool for your gears databases !');
      this.panel_container.setFooter('Copyright (c) 2007, Eric Abouaf, Samuel Dehouck, Maxime R&eacute;ty - <a style="text-decoration:underline; color:blue; cursor:pointer;" onclick="GIM.showLicense();">License</a>');
      this.panel_container.hideEvent.subscribe(this.onHide,this,true);
      this.panel_container.showEvent.subscribe(this.onShow,this,true);
   },
   
   /**
    * Creates the GIM dom tree (content of the panel) :
    *       div.gim-container
    *       div.gim-menu
    *       div#gim-page
    *       div.gim-data (x4)
    */
   initDom: function() {
	    
      // Inside container of the panel
      this.gim_container = document.createElement('div');
      this.gim_container.id = 'gim-container';
      
      // Append container to panel and render panel
      this.panel_container.appendToBody(this.gim_container);
      this.panel_container.render(this.gim_dom_container); 
      this.panel_container.center();
      
	   this.gim_menu = cn('div', {id: 'gim-menu'});
	   this.gim_container.appendChild(this.gim_menu);
     
     this.gim_page = cn('div', {id: 'gim-page'});
	   this.gim_container.appendChild(this.gim_page);

      // gim_data : div for the "main" datatable
	   this.gim_data = cn('div', {className: 'gim-data'});
	   
	   this.gim_page.appendChild(this.gim_data);
	   // gim_data_belongs_to : div for the linked datatable for a belongs_to relation
	   this.gim_data_belongs_to = cn('div', {className: 'gim-data linked-table'});
	   
	   this.gim_page.appendChild(this.gim_data_belongs_to);
	   // gim_data_has_many : div for the linked datatable for a has_many relation
	   this.gim_data_has_many = cn('div', {className: 'gim-data linked-table'});
	   
	   this.gim_page.appendChild(this.gim_data_has_many);
	   // gim_data_many_to_many : div for the linked datatable for a many_to_many relation
	   this.gim_data_many_to_many = cn('div', {className: 'gim-data linked-table'});
	   this.gim_page.appendChild(this.gim_data_many_to_many);
   },
   
   
   chooseDb: function(dbName) {
      
      // Open the database, prompt for the name if dbName is undefined
      var dbToOpen = dbName;
      if( !dbToOpen ) {
         dbToOpen = prompt('Please enter the name of the database to open');
         if(dbToOpen === null) return;
         if(dbToOpen === "") {
            alert("Database must have a name.");
            return;
         }
      }
      this.openDatabase(dbToOpen);
      
      this.updateMenu();
   },
   
   
   // Manage display functions
   show: function() {
        this.panel_container.show();
   },
   
   hide: function() {
        this.panel_container.hide();
   },
   
   onShow: function() {
        this.panel_visible = true;
   },
   
   onHide: function() {
        this.panel_visible = false;
   },

   toggle: function() {
        if (this.panel_visible) {
            this.hide();
        } else {
            this.show();
        }
   },
   
   
   // Display a query entered
   /*freeQuery: function() {
      var query = prompt('Please enter your sql query');
      if (query) {
         this.displayTableBySql(query,[], this.gim_data);
      }
   },*/
   
   getRegExResult: function(query) {
      var result = query.match(/^select (([^, ]*)(, [^, ]*)*) from (([^, ]*)(, [^, ]*)*)/);
		var fields = result[1].split(', ');
		var tables = result[4].split(', ');
   },

	/**
    * Display the selected database 
    */
	updateMenu: function() {
		
		// Clear the current contents
	   this.gim_menu.innerHTML = "";
      this.gim_data.innerHTML = "";
	   this.gim_data_belongs_to.innerHTML = "";
	   this.gim_data_has_many.innerHTML = "";
      this.gim_data_many_to_many.innerHTML = "";
     
      // Button change database :	   
      // WARNING : be careful : no argument must be passed to chooseDb
      new YAHOO.widget.Button({ label:"Change database", id: "buttonChangeDB",  container: this.gim_menu, onclick: { fn: function() { GIM.chooseDb(); } } });
         
      this.gim_menu.appendChild( cn('p',null, null, "Database: <b>"+this.openedDatabase+"</b>" ) );
     
	   // List tables in openedDatabase   
	   var tables = this.listTables();
	   
	   // Menu construction
	   var tableEl = cn('table', {className: 'gim-db-tables-display yui-dt-table'});
       
	   var thead = document.createElement('thead');
	   var tr = document.createElement('tr');
	  
	   var thName = cn('th', {colSpan: 2}, null, "Tables :");
     
	   tr.appendChild(thName);
	   thead.appendChild(tr);
	   tableEl.appendChild(thead);
	   var tbody = document.createElement('tbody');
	   
	   for(var i = 0 ; i < tables.length ; i++) {
	      
	      var tableProp = tables[i];
         var lineClass = (i%2 === 0) ? "yui-dt-even" : "yui-dt-odd";
         
	      tr = cn('tr', {className: lineClass});
	      tr.tableName = tableProp.name;
		  
	      var tdName = cn('td',null,null, tableProp.name);
	      
	      tr.appendChild(tdName);
	      tdName.title = GIM.countTable(tableProp.name)+" elements in "+tableProp.name;
         YAHOO.util.Dom.addClass(tdName,'gim-db-table-link');

	      var tdOperations = cn('td', {className: 'gim-db-drop-link'}, null, "&nbsp;");
	      tr.appendChild(tdOperations);

	      YAHOO.util.Event.addListener(tdName, 'click', function() { GIM.displayTableBySql("select * from "+this.parentNode.tableName, [], GIM.gim_data, this.parentNode.tableName); });
	      // Remove the previous link tables displayed
	      YAHOO.util.Event.addListener(tdName, 'click', function() { 
			   GIM.gim_data_belongs_to.innerHTML="";
			   GIM.gim_data_has_many.innerHTML="";
			   GIM.gim_data_many_to_many.innerHTML="";
			   YAHOO.util.Dom.setStyle(GIM.gim_data_belongs_to, 'display', 'none');
			   YAHOO.util.Dom.setStyle(GIM.gim_data_has_many, 'display', 'none');
			   YAHOO.util.Dom.setStyle(GIM.gim_data_many_to_many, 'display', 'none');
		   });

	      YAHOO.util.Event.addListener(tdOperations, 'click', function() {
	         if( confirm('Drop table '+this.parentNode.tableName+' ?') ) {
	            GIM.dropTable(this.parentNode.tableName);
	            GIM.updateMenu();
	         }
	      });

	      tbody.appendChild(tr);
		  
	   }

	   tableEl.appendChild(tbody);
	   this.gim_menu.appendChild(tableEl);
	
	   // Button create table
	   new YAHOO.widget.Button({ label:"Add a table", id: "buttonCreateTable", container: this.gim_menu, onclick: { fn: this.addTable, scope: this } });
	   
   	// Button FreeQuery
      //new YAHOO.widget.Button({ label:"Free SQL Query", id: "buttonFreeQuery",  container: this.gim_menu, onclick: { fn: function() { GIM.freeQuery(); } } });
	   
	   // Export to sql button
	   new YAHOO.widget.Button({ label:"Export", id: "buttonExportSql", container: this.gim_menu, onclick: { fn: this.exportSql, scope: this } });
      
      var msg = cn('p', {className: 'gim-message'}, null, "Please visit <a href='http://code.google.com/p/gearsinmotion/' target='_new'>the GIM website</a> for any comment, bug report or feature request.");
      this.gim_menu.appendChild(msg);
      
	},
	
	/**
	 * display a datatable from a query
	 */
	
	displayTableBySql: function(query, queryParams, container, tableName) {
	   // Remove the previous context menu
      if(GIM._dataTableBySql && GIM._dataTableBySql.contextMenu) {
         GIM._dataTableBySql.contextMenu.destroy();
         GIM._dataTableBySql.contextMenu = null;
      }
      // Remove previous table from DOM
      //container.innerHTML = "";  
      
      // Create the new table   
      GIM._dataTableBySql = new GIM.DataTableBySql(query, queryParams, container, tableName);
      
	},
	
	/**
	 * View an item
	 */
	viewElement: function(id,tableName) {
      // Remove previous tables from DOM
      //this.gim_data.innerHTML = "";  

	   var result = this.query('select * from '+tableName+' where id=?',[id])[0];
     
	   if( YAHOO.lang.isFunction(GIM.elementDomFunctions[tableName]) ) {
	      var f = GIM.elementDomFunctions[tableName];
	      this.gim_data.innerHTML = "";
	      this.gim_data.appendChild( f(result) );
	   }
	   else {
   	   // Display the selected element
   	   new GIM.DataTableBySql('select * from '+tableName+' where id=?',[id], this.gim_data,tableName);
	   }
     
     GIM._dataTableBySql_manytomany = [];
     GIM._dataTableBySql_hasmany = [];
     GIM._dataTableBySql_belongsto = [];
     
     
     this.gim_data_many_to_many.innerHTML = "";
     this.gim_data_has_many.innerHTML = "";
     this.gim_data_belongs_to.innerHTML = "";
     YAHOO.util.Dom.setStyle(this.gim_data_many_to_many, 'display', 'block');
     YAHOO.util.Dom.setStyle(this.gim_data_has_many, 'display', 'block');
     YAHOO.util.Dom.setStyle(this.gim_data_belongs_to, 'display', 'block');
     
     // Initialize a flag to remember which title to create in the end
     var setTitleFlag = [false,false,false];

     var divContainer;
     
      // Display the linked elements
      if( this.liaisons[tableName] ) {
         
         for(var i = 0 ; i < this.liaisons[tableName].length ; i++ ) {
            var relation = this.liaisons[tableName][i][0];
            var destTable = this.liaisons[tableName][i][1];
            // MANY TO MANY
            if(relation == "many_to_many") {
                 var liaisonTableName = this.liaisons[tableName][i][2];
                 var linked_elts = GIM.query("select "+this.singularizeTableName(destTable)+"_id from "+liaisonTableName+" where "+this.singularizeTableName(tableName)+"_id=?",[id]);
                 // if element REALLY linked by this liaison
                 if (linked_elts.length>0) {
                      setTitleFlag[0] = true;
                      
                      var title = cn("div", {className: 'linked-elts-title'}, null, "Elements linked through link table "+liaisonTableName);
                     
                     divContainer = document.createElement('div');
                     this.gim_data_many_to_many.appendChild(title);
                     this.gim_data_many_to_many.appendChild(divContainer);
                      
                     // Build query
                     var query = "select * from "+destTable+' where ';
                     paramsTab =[];
                     for (var j=0; j<linked_elts.length; j++){
                      for (var link_id in linked_elts[j]){
                       if (linked_elts[j].hasOwnProperty(link_id)){
                              paramsTab.push(destTable+'.id='+linked_elts[j][link_id]);
                           } 
                        }
                     }
                     query += paramsTab.join(" or ");
                     
                     // Store table
                     GIM._dataTableBySql_manytomany.push(new GIM.DataTableBySql(query, [],divContainer,destTable));
                 }
            }
            
            var destTableFieldsForQuery = destTable+'.'+(GIM.listFieldInTable(destTable)[1].join(','+destTable+'.'));
              
            // HAS MANY
            if(relation == "has_many") {
                setTitleFlag[1] = true;
                divContainer = document.createElement('div');
                this.gim_data_has_many.appendChild(divContainer);
                GIM._dataTableBySql_hasmany.push( new GIM.DataTableBySql('select '+destTableFieldsForQuery+' from '+destTable+', '+tableName+' where '+destTable+'.'+this.singularizeTableName(tableName)+'_id='+tableName+'.id and '+tableName+'.id=?' ,[id], divContainer,destTable));
            }
            
            // BELONGS TO
            if(relation == "belongs_to") {
               setTitleFlag[2] = true;
               divContainer = document.createElement('div');
               this.gim_data_belongs_to.appendChild(divContainer);
               GIM._dataTableBySql_belongsto.push(new GIM.DataTableBySql('select '+destTableFieldsForQuery+' from '+destTable+', '+tableName+' where '+destTable+'.id='+tableName+'.'+this.singularizeTableName(destTable)+'_id and '+tableName+'.id=?' ,[id], divContainer,destTable));
            }
            
         } 
      }// end of liaison
      
     // Set global titles for each type of link
     var title,childNodes;
     var titlesData = [[this.gim_data_many_to_many,'MANY TO MANY'],[this.gim_data_has_many,'HAS_MANY'],[this.gim_data_belongs_to,'BELONGS_TO']];
     for (var i=0;i<titlesData.length;i++) {
         if (setTitleFlag[i]) {
            
            title = cn('h2',{className: 'linked-elts-title'}, null, titlesData[i][1] );
            
            childNodes = titlesData[i][0].childNodes;
            YAHOO.util.Dom.insertBefore(title,childNodes[0]);
         }
     }
     

	}, // end of viewElement
  
  exportSql: function() {
      var sql = this.exportTablesInSQL();
      this.gim_data.innerHTML = "";
      this.gim_data_many_to_many.innerHTML = "";
      this.gim_data_has_many.innerHTML = "";
      this.gim_data_belongs_to.innerHTML = "";
		YAHOO.util.Dom.setStyle(GIM.gim_data_belongs_to, 'display', 'none');
		YAHOO.util.Dom.setStyle(GIM.gim_data_has_many, 'display', 'none');
		YAHOO.util.Dom.setStyle(GIM.gim_data_many_to_many, 'display', 'none');
      
      var textarea = cn('textarea', {cols: 100, rows: 30},{marginTop: '4px'},sql);
      this.gim_data.appendChild(textarea);
  }
   
   
};

GIM.showLicense = function() {
    var text = "Software License Agreement (New BSD License)<br /><br />"+

    "Copyright (c) 2007, Eric Abouaf, Samuel Dehouck, Maxime R&eacute;ty<br />"+
    "All rights reserved.<br /><br />"+

    "Redistribution and use of this software in source and binary forms, with or without modification, are<br />"+
    "permitted provided that the following conditions are met:<br /><br />"+

    "* Redistributions of source code must retain the above<br />"+
    "  copyright notice, this list of conditions and the<br />"+
    "  following disclaimer.<br /><br />"+

    "* Redistributions in binary form must reproduce the above<br />"+
    "  copyright notice, this list of conditions and the<br />"+
    "  following disclaimer in the documentation and/or other<br />"+
    "  materials provided with the distribution.<br /><br />"+

    "* Neither the name of Yahoo! Inc. nor the names of its<br />"+
    "  contributors may be used to endorse or promote products<br />"+
    "  derived from this software without specific prior<br />"+
    "  written permission of Yahoo! Inc.<br /><br />"+

    "THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS \"AS IS\" AND ANY EXPRESS OR IMPLIED<br />"+
    "WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A<br />"+
    "PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR<br />"+
    "ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT<br />"+
    "LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS<br />"+
    "INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR<br />"+
    "TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF<br />"+
    "ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.";
    
    this.gim_data.innerHTML = "";
    this.gim_data_many_to_many.innerHTML = "";
    this.gim_data_has_many.innerHTML = "";
    this.gim_data_belongs_to.innerHTML = "";
    YAHOO.util.Dom.setStyle(GIM.gim_data_belongs_to, 'display', 'none');
    YAHOO.util.Dom.setStyle(GIM.gim_data_has_many, 'display', 'none');
    YAHOO.util.Dom.setStyle(GIM.gim_data_many_to_many, 'display', 'none');
    
    this.gim_data.innerHTML = text;
};

