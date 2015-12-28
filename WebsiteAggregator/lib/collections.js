//Runs on the client and on the server
Websites = new Mongo.Collection("websites");

Comments = new Mongo.Collection("websites_comments");

Websites.allow({
	insert: function(userId, doc){
		if(Meteor.user()){ // if the user is logged in

			if(doc.url && doc.description){
				return true;
			}	
			else{
				return false;
			}
		}
		else{
			return false;
		}
	},
	remove: function(userId, doc){
		return true;
	},
	update: function(userId, doc){
		return true;
	}
});
