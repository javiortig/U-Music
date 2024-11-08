const {handleHttpError} = require('../utils/handleHttpError');
const Modification = require('../models/modifications');

const createModification = async function(modificationDetails,adminUserId,elementId){
    try {

        if (!modificationDetails ) {
            throw new Error('Modification details are missing');
        }
        if (!adminUserId) {
            throw new Error('Admin user id is missing');
        }
        if (!elementId) {
            throw new Error('Element id is missing');
        }
        const modification = new Modification({
            modification_details: modificationDetails,
            admin_user: adminUserId,
            element_id: elementId
        });

        await modification.save();
        return modification;
    } catch (error) {
        handleHttpError(res, "ERROR_CREATING_MODIFICATION", 403);
        return null;
    }
}

module.exports = {createModification};