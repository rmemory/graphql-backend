/*

Look for permissions overlap. For example, 

permissionsNeeded is ['PERMISSIONUPDATE', 'ADMIN']

// this user doesn't not have permissions and will cause an Error to be thrown
{
	name: Richard
	permissions: ['USER']
}

// But this user does
{
	name: Bob
	permissions: ['ADMIN']
}

Success of this function means no Error is thrown

*/
function hasPermission(user, permissionsNeeded) {
	// Do the permissions they currently have include what they are asking for?
	if (!user)
		throw new Error("You are not logged in");
		
	const matchedPermissions = user.permissions.filter(permissionTheyHave =>
		// Returns true if permissionTheyHave (single value) is found anywhere
		// in permissionsNeeded (an array), which means the user
		// has at least a single permission
		permissionsNeeded.includes(permissionTheyHave)
	);

	// if the just filtered matchedPermissions array has any entires, it means
	// the user has permission, otherwise throw an Error
	if (!matchedPermissions.length) {
		throw new Error(`You do not have sufficient permissions

			: ${permissionsNeeded}

			You Have:

			${user.permissions}
			`);
	}
}

exports.hasPermission = hasPermission;
