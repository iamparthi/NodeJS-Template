module.exports = function(mongoose){
	let sessionsSchema = new mongoose.Schema({
    	token: {
    		type: String,
			required: true,
			unique:true,
			index: true			
    	},
		type: {
			type: String,
			required: true
		},
		email: {
			type: String,
			index: true
		},
		ipaddress: {
			type: String
		},
		login: {
			type: Boolean,
			default: true
		},
		logout: {
			type: Boolean,
			default: false,
			index: true
		},
		login_at: {
			type: Date,
			default: Date.now
		},
		logout_at: {
			type: Date			
		},
		logout_event: {
			type:String
		}
	});	
	return mongoose.model('sessionlog', sessionsSchema);
};
