
/**
 * Override YAHOO.widget.DataTable.editTextbox to allow the "Enter" key
 */
YAHOO.widget.DataTable.editTextbox = function(oEditor, oSelf) {
   var elCell = oEditor.cell;
   var oRecord = oEditor.record;
   var oColumn = oEditor.column;
   var elContainer = oEditor.container;
   var value = YAHOO.lang.isValue(oRecord.getData(oColumn.key)) ? oRecord.getData(oColumn.key) : "";

    // Textbox
    var elTextbox = elContainer.appendChild(document.createElement("input"));
    elTextbox.type = "text";
    elTextbox.style.width = elCell.offsetWidth + "px";
    elTextbox.value = value;

    // Set up a listener on each textbox to track the input value
    YAHOO.util.Event.addListener(elTextbox, "keyup", function(v){
        
        if(v.keyCode === 13) { 
          oSelf.saveCellEditor(); 
         }
         else {
            oSelf._oCellEditor.value = elTextbox.value;
            oSelf.fireEvent("editorUpdateEvent",{editor:oSelf._oCellEditor});
         }
    });

    // Select the text
    elTextbox.focus();
    elTextbox.select();
};




/**
 * GIM.DataTableBySql
 *
 * @classDescription    This class inherits from YAHOO.widget.DataTable which is sortable, inline editable, paginable.
 *                      We add function to add a new column, a new row, etc...
 * @params              query {string} : the table displays the result of this query, 
 *                      queryParams {array},
 *                      container {string} : the div in which the table is displayed
 * @return {Object}     Returns a new GIM.DataTableBySql object.
 * @constructor
 */
    // TEST : select users.id  ,  users.name from users  ,countries where users.country_id = countries.id and countries.name = "France"

GIM.DataTableBySql = function (query, queryParams, container, tableName) { 
   
   // Save parameters locally
   this.query = query;
	this.queryParams = queryParams;
   this.container = container;
   this.tableName = tableName;

   // Get the fields
   this.fields = (GIM.listFieldInTable(this.tableName))[1];	
   
   // Get the results
   this.results = GIM.query(query, queryParams);   
   
   
   // Configure pagination features
   // The display page links only if necessary
   this.minRowsPerPage = 10;
   var configs;
   if ( this.results.length > this.minRowsPerPage) {
       configs = {
           paginated:true, // Enables built-in client-side pagination
           paginator:{ // Configurable options
               //containers: null, // Create container DIVs dynamically
               //currentPage: 1, // Show page 1
               dropdownOptions: [this.minRowsPerPage,25,50,100], // Show these in the rows-per-page dropdown
               pageLinks: 5, // Show  5 links maximum
               rowsPerPage: this.minRowsPerPage 
           }
       };
   } else {
       configs = {};
   }

   // Builds the columnHeaders
   var columnHeaders = []; 
  	var tab_fields = [];
  	var subFieldsName = [];
  	for( var j = 0 ; j < this.fields.length ; j++) {
  	   var item = {key: this.fields[j],
  	   		      label: this.fields[j],
  	   		      sortable:true };
  		if (this.fields[j] != "id") item.editor = "textbox";
        subFieldsName.push(item);
  	   tab_fields.push(this.fields[j]);
  	}
  	columnHeaders.push({label: this.tableName, className:'table-name-header', children:subFieldsName}); //columnHeaders : name of the tables, subfieldsName : name of the fields of each table  

    // Builds the datasource from a JSON Array
 	var dataSource = new YAHOO.util.DataSource(this.results); 
 	dataSource.responseType = YAHOO.util.DataSource.TYPE_JSARRAY;
 	dataSource.responseSchema = {  fields: tab_fields };

 	// Call the constructor
 	GIM.DataTableBySql.superclass.constructor.call(this, this.container, columnHeaders, dataSource, configs);

 	// Buttons to add columns and rows
 	new YAHOO.widget.Button({ label:"Add a row", id: "addRowButton", container: this.container, onclick: { fn: function(){this.onAddRow();}, scope: this } });
 	new YAHOO.widget.Button({ label:"Add a column", id: "addColButton", container: this.container, onclick: { fn: function(){this.onAddCol();}, scope: this } });

 	// TODO: this is a horrible hack to have a uniq menu id !
    var tempId = "gim_contextmenu"+Math.floor(Math.random(3000)*2994);
 	this.contextMenu = new YAHOO.widget.ContextMenu(tempId, {zIndex:10, trigger: this.getBody() } );
 	this.contextMenu.addItem("View linked items");
 	this.contextMenu.addItem("Delete item");
 	//this.contextMenu.addItem("Edit Item");
 	this.contextMenu.render(document.body);
 	YAHOO.util.Dom.addClass(this.contextMenu.element, 'gim_contextmenu');
  
   // Init the events
   this.initEvents();
};

// GIM.DataTableBySql inherits from YAHOO.widget.DataTable
YAHOO.extend(GIM.DataTableBySql, YAHOO.widget.DataTable);


GIM.DataTableBySql.prototype.initEvents = function() {
   // Inline editing
   this.subscribe("cellClickEvent",this.onEventShowCellEditor);

   // Element editing (update)
   this.subscribe("editorSaveEvent",this.onCellEdit, this, true);
   
   // Right click -> context  menu
	this.contextMenu.clickEvent.subscribe(this.onContextMenuClick,this, true);
};

/**
 * This method is called when the user clicked on an item of the context menu
 * like 'Delete Item' or 'View Item'
 *
 * @method           onContextMenuClick
 * @memberOf         GIM.DataTable
 * @param 
 */
GIM.DataTableBySql.prototype.onContextMenuClick = function(p_sType, p_aArgs, p_oMenu) {

   var task = p_aArgs[1];
   if( !task ) { return; }
    
   // Extract which row was context-clicked
   var row = this.contextMenu.contextEventTarget;
   while(row.tagName.toLowerCase() != "tr") {
      row = row.parentNode;
      if(row.tagName.toLowerCase() == "body") {
         return;
      }
   }
   
   var id = parseInt(row.childNodes[0].innerHTML,10);
   
   
   // View Item
   if(task.index == 0) {
		GIM.viewElement(id,this.tableName);
   }
   // Delete Item
   else if( task.index == 1) {
      this.onDeleteRow(row);
   }
   // Edit Item
   /*else if(task.index == 2) {
    // TODO : a form to edit an Element ?
		//GIM.editElement(id,tableName);
    alert('To edit, left-clic on the cell !');
   }*/
};

/**
 * Called when the user clicked on 'Add row' button.
 *
 * @method           onAddRow
 * @memberOf         GIM.DataTable
 * @result			 insert a new row in the table			 
 */
GIM.DataTableBySql.prototype.onAddRow = function() {

   // Create new row and add to datatable (display updated by this.addRow)
	var newId = GIM.getNextAvailableId(this.tableName);
	var new_row = {id: newId};
   this.addRow(new_row);
   
	// Add the row on the database...
	var questionMarks = [];
	var queryParams = [];
	for(var i = 0 ; i < this.fields.length ; i++ ) {
	   questionMarks.push('?');
	   queryParams.push("");
	}
	queryParams[0] = newId;
	
	try {
	   var query = 'insert into '+this.tableName+' values('+questionMarks.join(',')+')';
	   GIM.query(query,queryParams);
   }
   catch(e) {
      alert(e);
   }
	
   // Refresh view of table !
   this.refreshView();
   // And show page with new row (last page)
   var nPage = (Math.ceil((this.getRecordSet()._length)/this._configs.paginator.value.rowsPerPage)) || 1;
   this.showPage(nPage);
    
};

/**
 * Called when the user clicked on 'Add col' button.
 *
 * @method           onAddCol
 * @memberOf         GIM.DataTable
 */
GIM.DataTableBySql.prototype.onAddCol = function() {
   
   // Choose column name pop-up
   var fieldName = prompt("Field name");
   if( fieldName === null ) { return; }
   if( fieldName === "" ) { alert('Field must have a name !'); return; }
   // Choose column type pop-up
   var fieldType = prompt("Field type");
   if( fieldType === null ) { return; }
   if( fieldType === "" ) { alert('Field type must have a name !'); return; }
   // Add the column on the database
   var query = "alter table "+this.tableName+" add "+fieldName+" "+fieldType;
   GIM.query(query);
   
   // Update the view of the table
   GIM.displayTableBySql("select * from "+this.tableName, [], this.container, this.tableName);
    // refresh liaisons (new liaisons can appear)
   GIM.autoDiscoverLiaisons();

};



/**
 * Event handler to edit cell (override buggy one from YUI)
 *
 * @method onEventShowCellEditor
 * @param oArgs.event {HTMLEvent} Event object.
 * @param oArgs.target {HTMLElement} Target element.
 */

GIM.DataTableBySql.prototype.onEventShowCellEditor = function(oArgs) {
    var evt = oArgs.event;
    var target = oArgs.target;
    var elTag = target.tagName.toLowerCase();

    var elCell = this.getTdEl(target);
    // this.getRecordIndex(elCell)) returns a false record index since it does not handle pagination !
    var realRecordIndex = this.getRecordIndex(elCell)+(this._configs.paginator.value.currentPage-1)*this._configs.paginator.value.rowsPerPage;
    
    var oRecord = this.getRecord(realRecordIndex);
    if(elCell) {
        // Si elCell a la classe yui-dt-first, 
        // it means it is the "id" column
        if( YAHOO.util.Dom.hasClass(elCell, 'yui-dt-first') ){
           //console.log(oRecord._oData.id);
        	  GIM.viewElement(oRecord._oData.id,this.tableName);
        }
        else {
           this.showCellEditor(elCell,oRecord);
        }
    }
    else {
    }
};

 /**
  * Called when the user finished editing a cell.
  *
  * @method          onCellEdit
  * @memberOf        GIM.DataTable
  * @param {String}  myDog The name of the dog. 
  * @return {Object} Returns a new object.
  */
GIM.DataTableBySql.prototype.onCellEdit = function(oArgs) {
   
   // Hack to have correct view (fixes a bug from YUI)
   this.refreshView();
   
   // Don't do anything if the value didn't change
   if( oArgs.newData === oArgs.oldData ) {
      return;
   }

   // Get the edited cell, row, table
   var td = oArgs.editor.cell;
   var tr = td.parentNode;
   
   var tableEl = tr.parentNode.parentNode;
   var headRowTable = tableEl.childNodes[0].childNodes[0]; // head row of table name
   var headRowFields = tableEl.childNodes[0].childNodes[1]; // head row of fields titles
   
   // Get the fieldName
   var index = -1;
   for(var i = 0 ; i < tr.childNodes.length ; i++) {
      if( tr.childNodes[i] === td) { index = i; }
   }
   if(index == -1 ) { throw new Error('onCellEdit failure !!!'); }
   var fieldName = headRowFields.childNodes[index].childNodes[0].childNodes[0].childNodes[0].innerHTML;

   // Get the table name
   // WARNING : many tables can be displayed... 
   var tableIndex = -1;
   for(var i = 0 ; i < headRowTable.childNodes.length ; i++) {
	  columnNbr = headRowTable.childNodes[i].colSpan;
      if( columnNbr < index) { index = index - columnNbr; } // find the index of the table concerned by the editing
      else {												// using the field index and the number of column of each
	     tableIndex = i;									// table displayed
	     break;
	  }
   }
   if(tableIndex == -1 ) { throw new Error('onCellEdit failure !!!'); }
   
   //var tableName = headRowTable.childNodes[tableIndex].childNodes[0].childNodes[0].innerHTML;

   // Get the id of the edited element 
   var idCell = 0;
   for(var j = 0 ; j<tableIndex ; j++) {
      idCell += headRowTable.childNodes[j].colSpan;
   }
   var elementId = tr.childNodes[idCell].innerHTML;

   // Update the changes in the database
   GIM.updateElement(this.tableName, elementId, fieldName, oArgs.newData);

   // If many tables are displayed the changes must be updated in all displayed table 

	// Update all fields concerned by the changes in the "main" table
	GIM.displayTableBySql(this.query, this.queryParams, this.container, this.tableName);	  
   
	// Update linked tables if displayed
	if(GIM._dataTableBySql_manytomany && GIM.gim_data_many_to_many.innerHTML !== ""){
	   var title = GIM.gim_data_many_to_many.childNodes[0];
      GIM.displayTableBySql(GIM._dataTableBySql_manytomany.query, GIM._dataTableBySql_manytomany.queryParams,GIM._dataTableBySql_manytomany.container);
		var NodeList = GIM.gim_data_many_to_many.getElementsByTagName("span");
    	var position = NodeList.item(0);
      GIM.gim_data_many_to_many.insertBefore(title, position);
   }
   if(GIM._dataTableBySql_hasmany && GIM.gim_data_has_many.innerHTML !== ""){
	   var title = GIM.gim_data_has_many.childNodes[0];
      GIM.displayTableBySql(GIM._dataTableBySql_hasmany.query, GIM._dataTableBySql_hasmany.queryParams,GIM._dataTableBySql_hasmany.container);
      var NodeList = GIM.gim_data_has_many.getElementsByTagName("span");
    	var position = NodeList.item(0);
      GIM.gim_data_has_many.insertBefore(title, position);
   }
   if(GIM._dataTableBySql_belongsto && GIM.gim_data_belongs_to.innerHTML !== ""){
	   var title = GIM.gim_data_belongs_to.childNodes[0];
      GIM.displayTableBySql(GIM._dataTableBySql_belongsto.query, GIM._dataTableBySql_belongsto.queryParams,GIM._dataTableBySql_belongsto.container);
      var NodeList = GIM.gim_data_belongs_to.getElementsByTagName("span");
    	var position = NodeList.item(0);
      GIM.gim_data_belongs_to.insertBefore(title, position);
   }
      
};

/**
 * Called when the user clicked "Delete Item" in the context Menu
 *
 * @method          onDeleteRow
 * @memberOf        GIM.DataTable
 * @param {String}  row to be deleted
 */

//WARNING : If the row concerned displays many tables, for example an element and a linked element from another table, 
//			the method must propose to delete only this element or only the linked element and not allways th entire row

GIM.DataTableBySql.prototype.onDeleteRow = function(row) {
	var ids = [];
	var tableEl = row.parentNode.parentNode;
	var headRowFields = tableEl.childNodes[0].childNodes[1];

  var realRecordIndex = this.getRecordIndex(row)+(this._configs.paginator.value.currentPage-1)*this._configs.paginator.value.rowsPerPage;

	// Construction of the table of ids with all the ids of the elements in the row (element, linked element)
	for (var i=0 ; i<headRowFields.childNodes.length ; i++) {
		if (headRowFields.childNodes[i].childNodes[0].childNodes[0].childNodes[0].innerHTML === "id") {
			ids.push(row.childNodes[i].innerHTML);
		}
	}

	if (confirm("Do you want to delete the element of id "+ids[0]+" from the table "+this.tableName+"?")){	
	   var query = 'delete from '+this.tableName+' where id=?'; 
		// delete the element selected from the table
	   GIM.query(query,[ids[compteur]]);
      // Delete row from table
      this.deleteRow(realRecordIndex);
      // Re-paginate if delete last only row of a page
      if (realRecordIndex==(this._configs.paginator.value.currentPage-1)*this._configs.paginator.value.rowsPerPage && this._configs.paginator.value.currentPage>0)  { this.showPage(this._configs.paginator.value.currentPage-1);}
      // And Refresh view of table
      this.refreshView();
	}

};



/**
 * Rewrite of Handler for change events on paginator SELECT element.
 *
 * @method _onPaginatorDropdownChange
 * @param e {HTMLEvent} The change event.
 * @param oSelf {YAHOO.widget.DataTable} DataTable instance.
 * @private
 */
 
// REWRITE of YUI version, which is bugged (display "no records found" because keep wrong number of page)
GIM.DataTableBySql.prototype._onPaginatorDropdownChange = function(e, oSelf) {
    var elTarget = YAHOO.util.Event.getTarget(e);
    var newValue = elTarget[elTarget.selectedIndex].value;
    var newRowsPerPage = YAHOO.lang.isValue(parseInt(newValue,10)) ? parseInt(newValue,10) : null;
    if(newRowsPerPage !== null) {
        
        // Modified piece of code to fix the bug
        var currentPage = oSelf.get("paginator").currentPage;
        var nPage = 1;
        if ((currentPage-1)*newRowsPerPage<oSelf.getRecordSet()._length) {
            nPage = currentPage;
        } else {
            nPage =1;
        }
        
        oSelf.updatePaginator({rowsPerPage:newRowsPerPage});
        oSelf.showPage(nPage);
        oSelf.refreshView();
    }
    else {
    }
};
