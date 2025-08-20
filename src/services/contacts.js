import ContactCollection from '../db/models/Contact.js';

// Tüm kontakları sayfalama ile getir
async function getAllContacts({ skip = 0, limit = 10, sortBy = '_id', sortOrder = 'asc', filter = {} } = {}) {
  return ContactCollection.find(filter)
                          .sort({ [sortBy]: sortOrder })
                          .skip(skip)
                          .limit(limit);
}




// Toplam kontak sayısını döndür
async function countContacts(filter = {}) {
  return ContactCollection.countDocuments(filter);
}
// ID ile kontak getir
async function getContactById(contactId) {
  return ContactCollection.findById(contactId);
}

// Yeni kontak oluştur
async function createContact(contactData) {
  return ContactCollection.create(contactData);
}

// Mevcut kontak güncelle
async function updateContact(contactId, updateData) {
  return ContactCollection.findByIdAndUpdate(contactId, updateData, { new: true });
}

// Kontak sil
async function deleteContact(contactId) {
  return ContactCollection.findByIdAndDelete(contactId);
}

export default {
  getAllContacts,
  countContacts, // artık ekli
  getContactById,
  createContact,
  updateContact,
  deleteContact,
};
