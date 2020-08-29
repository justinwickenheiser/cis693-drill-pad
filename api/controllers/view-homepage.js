module.exports = {


	friendlyName: 'View demo homepage',


	description: 'Display to the homepage which is going to be used for demo purposes.',


	exits: {

		success: {
			statusCode: 200,
			description: 'Requesting user is a guest, so show the public landing page.',
			viewTemplatePath: 'pages/homepage'
		},

	},

	fn: async function () {

		return {};

	}
};
