##################
 Gears In Motion 
 Aug 23, 2007
 version 0.1
##################

	-------------
	 Description
	-------------
	
		Gears In Motion is a user interface that allows you to manage easily your Google Gears databases 
	for all your Google Gears projects.
	
	Gears in Motion is written in javascript and uses Google Gears and the YAHOO! UI 2.2.0 library.
	
	It is very easy to use and the functionalities implemented allows you to modify your database as you
	could do it on a spreadsheet :
	
			- inline editing : just click in a cell to modify it
			- add dynamically a new row
			- add dynamically a new column
			- right-click an element to display a context menu which allows you to :
			
					* delete dynamically an element of a table
					* view element details such as linked elements
	
	You can also display in a table the result of a query you entered or export your database in the sql
	format to use your data in another database.
	
	---------------
	 Limitations
	---------------
	
		- Sql export is not usable since we cannot copy/paste the generated sql (sic!)
		- Not tested on other browsers than firefox 2
	
	---------------
	 Known bugs
	---------------

		- Javascript fails if the sql query does not return a valid result (eg if the sql query is not syntax correct)
		
		Please send any bug report to "Eric Abouaf" <neyric arobase via.ecp.fr>

	---------------
	 User's Manual
	---------------
	
	Gears In Motion is really easy to use : 
		
			- to create a new database click on the button change database. You will be asked to enter the 
			  database's name. If this database does'nt exist a new one will be created
			- to add a table to a database click on the "Add a table" button
			- to delete one click on the corresponding red cross
			- to display a table of your database, just click on it in the left menu
			- to add a row or a column  to the table just click on the corresponding button
			- to edit an element just click in the cell you want to modify
			- you can also sort the data by clicking on the column headers
			- to delete an element right click a row and choose "Delete Item" in the context menu
			- to view an element details right click a row and choose "View Item"
			
	The only conventions you have to follow is the conventions on tables name and fields name because linked
	elements are autodetected. This is possible only if this names follow these conventions which are the 
	same as in Ruby on Rails :
	
			- tables names are plural : pets [id, type, name], owners [id, name]
			- for a has_many or belongs_to relation the link id must follow the rule explained in the example 
			  below :
					
					* a owner has many pets and a pet belongs to a owner
					* you have to had a column owner_id to the table pets which refers to the id of the owner 
					  of the pet
			
			- for a many_to_many relation : 
					
					* you have to create a link-table which name is composed of the name of the two linked table
					* for example : you have a table users and a table sports. A user can practise many 
					  sports and an sport can be practised by many users
					  The link table will be called users_sports and will contained three column : id, user_id,
					  sport_id. Each element of the table users_sports links a user of id user_id and a sport 
					  of id sport_id.
					
					
					
	-----------------
	 For developpers
	-----------------
	
		The project is composed of 5 files (plus some images, license.txt, README.txt and some javascript libs): 
		
				- gearsinmotion.html : includes all necessary javascript and css files.
				
				- css/gearsinmotion.css : the stylesheet of the project.
				
				- js/gearsinmotion.js : defines the object GIM which encapsulates all the project. It manages 
				  the dom construction, the display of tables.
				
				- js/gim_datatable_by_sql.js : defines the class GIM.DataTableBySql which inherits from YAHOO.widget.DataTable 
				  which is sortable, inline editable, paginable. We add functions to add a new column, a new row, 
				  to write the inline edited modifications in the database...
				 
				- js/sql.js : is in charge of all the sql queries.
	
