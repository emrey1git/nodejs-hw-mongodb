import ContactCollection from '../db/models/Contact.js';

// Tüm kontakları getir (sayfalama, filtre, sıralama)
async function getAllContacts({ userId, skip = 0, limit = 10, sortBy = '_id', sortOrder = 'asc', filter = {} } = {}) {
  return ContactCollection.find({ ...filter, userId })
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit);
}

// Toplam contact sayısı
async function countContacts({ userId, filter = {} } = {}) {
  return ContactCollection.countDocuments({ ...filter, userId });
}

// ID ile contact getir
async function getContactById(contactId, userId) {
  return ContactCollection.findOne({ _id: contactId, userId });
}

// Yeni contact oluştur
async function createContact(contactData) {
  return ContactCollection.create(contactData);
}

// Contact güncelle
async function updateContact(contactId, userId, updateData) {
  return ContactCollection.findOneAndUpdate(
    { _id: contactId, userId },
    updateData,
    { new: true }
  );
}

// Contact sil
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
