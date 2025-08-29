import ContactCollection from '../db/models/Contact.js';


async function getAllContacts({ userId, skip = 0, limit = 10, sortBy = '_id', sortOrder = 'asc', filter = {} } = {}) {
  return ContactCollection.find({ ...filter, userId })
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit);
}


async function countContacts({ userId, filter = {} } = {}) {
  return ContactCollection.countDocuments({ ...filter, userId });
}


async function getContactById(contactId, userId) {
  return ContactCollection.findOne({ _id: contactId, userId });
}


async function createContact(contactData) {
  return ContactCollection.create(contactData);
}


async function updateContact(contactId, userId, updateData) {
  return ContactCollection.findOneAndUpdate(
    { _id: contactId, userId },
    updateData,
    { new: true }
  );
}


async function deleteContact(contactId, userId) {
  return ContactCollection.findOneAndDelete({ _id: contactId, userId });
}

export default {
  getAllContacts,
  countContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
};
