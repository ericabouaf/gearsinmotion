
var struct = [
   
	{
		name: "countries",
		fields: {
			id: "int",
			name: "varchar(255)",
			supporters: "int"
		},
		elements: [
			{id: 1, name: "France", supporters: 64102000},
			{id: 2, name: "South Africa", supporters: 47850700},
			{id: 3, name: "Argentina", supporters: 39921833},
			{id: 4, name: "England", supporters: 49138831}
		]
	},
	{
	   name: "clubs",
	   fields: {
	      id: "int",
	      name: "varchar(255)",
	      country_id: "int"
	   },
	   elements: [
	      {id: 1, name: "Sale", country_id: 4},
   	   {id: 2, name: "Natal Sharks", country_id: 2},
   	   {id: 3, name: "Toulouse", country_id: 1},
   	   {id: 4, name: "Hindu Club", country_id: 3},
   	   {id: 5, name: "Stade Francais", country_id: 1},
   	   {id: 6, name: "Newcastle", country_id: 4},
   	   {id: 7, name: "Blue Bulls", country_id: 2}
	   ]
	},
	{
		name: "players",
		fields: {
			id: "int",
			name: "varchar(255)",
			picture: "varchar(255)",
			country_id: "int"
		},
		elements: [
			{id: 1, name: "Sebastien Chabal", country_id: 1, picture: "http://www.lequipe.fr/Rugby/RugbyImage848.jpg"},
			{id: 2, name: "Lionel Beauxis", country_id: 1, picture: "http://www.lequipe.fr/Rugby/RugbyImage4000000000004631.jpg"},
			{id: 3, name: "Frederic Michalak", country_id: 1, picture: "http://www.lequipe.fr/Rugby/RugbyImage3548.jpg"},
			{id: 4, name: "Nicolas Fernandez Miranda", country_id: 3, picture: "http://www.lequipe.fr/Rugby/RugbyImage1456.jpg"},
			{id: 5, name: "Jonny Wilkinson", country_id: 4, picture: "http://www.lequipe.fr/Rugby/RugbyImage956.jpg"},
			{id: 6, name: "Bryan Habana", country_id: 2, picture: "http://www.lequipe.fr/Rugby/RugbyImage6000000000004667.jpg"}
		],
		buildElementDom: function(elmt) {
			var div = cn('div');
			div.appendChild(cn('p',null,null,elmt.name));
			div.appendChild(cn('img',{src: elmt.picture}));
			return div;
		}
	},
   {
      name: "clubs_players",
      fields: {
         player_id: "int",
         club_id: "int"
      },
      elements: [
         {player_id: 1, club_id: 1},
         {player_id: 2, club_id: 5},
         {player_id: 3, club_id: 2},
         {player_id: 4, club_id: 4},
         {player_id: 5, club_id: 6},
         {player_id: 6, club_id: 7}
      ]
   }
];
	
YAHOO.util.Event.addListener(window, "load", function() {
	GIM.init('rugbyDB');
	// Populate the database
	GIM.populateDatabase(struct);	
	// Reopent the demoDb (updates the table list and the liaisons)
	GIM.chooseDb('rugbyDB');
});
