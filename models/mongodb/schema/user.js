module.exports = function(mongoose){
	let userSchema = new mongoose.Schema({
		firstname: {
			type: String
		},
		lastname: {
			type: String
		},
		email:{
			type: String,
			required: true,
			unique: true
		},
		password: {
			type: String,
			required: true
		},
		phone:{
			type: String
		},
	 	createddate: {
			type: Date,
			default: Date.now
		},
		updateddate: {
    		type: Date
		},
    	deleted: {
    		type: Boolean,
			default: false
    	}
	});

	return mongoose.model('users', userSchema);
};
