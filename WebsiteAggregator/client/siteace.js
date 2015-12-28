// show all websites
Session.set("SEARCH_PATTERN",'.*');

/////
// routing
/////

Router.configure({
	layoutTemplate: 'ApplicationLayout'
});

Router.route('/', function () {
	this.render('navbar', {to:"navbar"});
	this.render('website_form', {to:"main"});
});


Router.route('/detail/:_id', function(){
	this.render('navbar', {to:"navbar"});

	this.render('single_website', {to:"main", data: function(){
  		return Websites.findOne({_id: this.params._id});	
  	}});
});


/////
// template helpers 
/////

// helper function that returns all available websites based on the search pattern defined
Template.website_list.helpers({
	websites:function(){
		// DESC Order = - 1
		return Websites.find({ $or: [ {title: { $regex: Session.get("SEARCH_PATTERN"), $options: "i" } }, {description: { $regex: Session.get("SEARCH_PATTERN"), $options: "i" } } ] },
		 					 {sort: {nUpVotes: -1} });
	}
});

Template.website_item.helpers({
	getTitle:function(website_id){ // title is not a mandatory field. if it's not defined, return url
		var website = Websites.findOne({_id: website_id});
		if(website){
			if(website.title){
				return website.title;
			}
			else{
				return website.url;
			}
		}
	}
});

Template.website_comments.helpers({
	comments:function(){ // get comments of a determined website
		var website_id = this.website_id;
		return Comments.find({website_id: website_id}, {sort: {createdOn: -1} });
	}
});

/////
// template events 
/////

Template.website_item.events({

	"click .js-add-upvote":function(event){
		var website_id = this._id;

		Websites.update({_id: website_id}, {$inc: {nUpVotes: 1}});

		return false;// prevent the button from reloading the page
	},

	"click .js-add-downvote":function(event){

		var website_id = this._id;

		Websites.update({_id: website_id}, {$inc: {nDownVotes: 1}});

		return false;// prevent the button from reloading the page
	}
})

Template.website_form.events({
	
	"click .js-toggle-website-form":function(event){
		$("#website_form").toggle('slow');
	},

	"submit .js-search-pattern":function(event){
		var search_pattern = event.target.search_pattern.value;

		Session.set("SEARCH_PATTERN",'.*' + search_pattern + '.*');

		return false;
	},

	"submit .js-save-website-form":function(event){

		// get the form fields submitted
		var url = event.target.url.value;
		var title = event.target.title.value;
		var description = event.target.description.value;

		if(url && description){
			// initial values
			var createdOn = new Date();
			var nUpVotes = 0;
			var nDownVotes = 0;

			Websites.insert({
				title: title, 
				url: url, 
				description: description, 
				createdOn: createdOn,
				nUpVotes: nUpVotes,
				nDownVotes: nDownVotes
				},function(error, _id){
					if(error){
						console.log("Insert failed");
					}
					else{
						console.log("Insert successful");
					}
				}

			);
		}

		//reset values
		event.target.url.value = "";
		event.target.title.value = "";
		event.target.description.value = "";

		return false;// stop the form submit from reloading the page

	}
});

Template.single_website.events({
	"submit .js-add-comment":function(event){

		var comment = event.target.userComment.value;

		var website_id = this._id;

		var user;

		if(Meteor.user()){
			user = Meteor.user().emails[0].address;
			//return Meteor.user().username;
		}
		else{
			user = "anonymous";
		}

		Comments.insert({website_id: website_id, user: user, comment: comment, createdOn: new Date()});

		//reset value
		event.target.userComment.value = "";

		return false;// prevent the button from reloading the page
	}
});
